import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

import { Award, BookOpen, Clock, FileText, ChevronRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS_DATABASE, getNormalizedDepartment } from '../utils/subjectsData';

interface ComponentMark {
  name: string;
  score: number;
  maxScore: number;
  weightage: number;
}

interface CourseHistory {
  subject: string;
  code: string;
  grade: string;
  attendance: number;
  components: ComponentMark[];
}

const AcademicHistory = () => {
  const { user } = useAuth();
  
  const studentSem = user?.semester || '1-1';
  const studentDept = getNormalizedDepartment(user?.department || 'Computer Science');

  const semestersList = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
  const currentSemIdx = semestersList.indexOf(studentSem);
  
  // Historical semesters are all semesters strictly before the current one
  const historicalSemesters = semestersList.slice(0, currentSemIdx);
  
  const [selectedSem, setSelectedSem] = useState<string>(
    historicalSemesters.length > 0 ? historicalSemesters[historicalSemesters.length - 1] : ''
  );
  const [historyData, setHistoryData] = useState<CourseHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (sem: string) => {
    if (!user?.id || !sem) return;
    try {
      setLoading(true);
      const headers = {
        'x-requester-username': user.username,
        'x-requester-role': user.role || 'student'
      };
      
      // Fetch past marks
      const marksRes = await fetch(`${API_BASE_URL}/marks?student_id=${user.id}&semester=${sem}`, { headers });
      // Fetch past attendance (we filter by semester locally)
      const attRes = await fetch(`${API_BASE_URL}/attendance/student/${user.id}`, { headers });
      
      if (marksRes.ok && attRes.ok) {
        const marksData = await marksRes.json();
        const attData = await attRes.json();
        
        // Group marks by subject
        const subjectGroups: Record<string, any> = {};
        marksData.forEach((m: any) => {
          if (!subjectGroups[m.subject]) {
            subjectGroups[m.subject] = [];
          }
          subjectGroups[m.subject].push(m);
        });
        
        // Get subjects list for this past semester
        const pastSemSubjects = SUBJECTS_DATABASE[studentDept]?.[sem] || [];
        
        const codes: Record<string, string> = {
          'Linear Algebra & Calculus': 'MATH101',
          'Engineering Physics/Chemistry': 'PHYS102',
          'Programming in C': 'CS103',
          'Engineering Drawing': 'ME104',
          'English': 'ENG105',
          'Labs': 'LAB106',
          'Differential Equations & Vector Calculus': 'MATH102',
          'Applied Physics': 'PHYS204',
          'Basic Electrical Engineering': 'EE102',
          'Data Structures': 'CS202',
          'Workshops/Labs': 'WS106',
          'Discrete Mathematics': 'MATH201',
          'OOP (Java/C++)': 'CS203',
          'DBMS': 'CS204',
          'Digital Logic & Computer Organization': 'CS205',
          'Skill Course (Design Thinking / Full Stack-1)': 'SKL206',
          'Machine Learning': 'CS302',
          'Probability & Statistics': 'MATH202',
          'Operating Systems': 'CS206',
          'Software Engineering': 'CS301',
          'Optimization Techniques': 'MATH203',
          'Artificial Intelligence': 'CS303',
          'Computer Networks': 'CS304',
          'Automata Theory & Compiler Design': 'CS305',
          'NLP': 'CS306',
          'Computer Vision': 'CS307',
          'Professional Elective-I': 'PE308',
          'Deep Learning': 'CS310',
          'Data Analytics/Big Data': 'CS311',
          'Web Technologies': 'CS312',
          'Professional Elective-II': 'PE313',
          'Open Elective-I': 'OE314',
          'Generative AI': 'CS401',
          'MLOps & Model Deployment': 'CS402',
          'Professional Electives (III & IV)': 'PE403',
          'Open Elective-II': 'OE404',
          'Project Work Part-1': 'PRJ405',
          'Major Industry Internship': 'INT406',
          'Final Major Project / Dissertation': 'PRJ407'
        };

        const mapped: CourseHistory[] = pastSemSubjects.map(subjName => {
          const compMarks = subjectGroups[subjName] || [];
          
          const midterm = compMarks.find((c: any) => c.assessment_type === "Midterm 1")?.marks || 0;
          const quiz = compMarks.find((c: any) => c.assessment_type === "Quiz 1")?.marks || 0;
          const assignments = compMarks.find((c: any) => c.assessment_type === "Assignments")?.marks || 0;
          const finalExam = compMarks.find((c: any) => c.assessment_type === "Final Exam")?.marks || 0;
          const total = midterm + quiz + assignments + finalExam;
          
          const getGradeChar = (score: number) => {
            if (score >= 95) return 'O';
            if (score >= 88) return 'A+';
            if (score >= 80) return 'A';
            if (score >= 70) return 'B+';
            if (score >= 60) return 'B';
            if (score >= 50) return 'C';
            return 'F';
          };
          
          // Find real attendance percentage for this past subject
          const attSubj = attData.subject_list?.find((s: any) => s.subject === subjName);
          const attPct = attSubj ? attSubj.percentage : 80.0; // fallback if no logs
          
          return {
            subject: subjName,
            code: codes[subjName] || 'SUBJ100',
            grade: getGradeChar(total),
            attendance: attPct,
            components: [
              { name: 'Midterm 1', score: midterm, maxScore: 30, weightage: 30 },
              { name: 'Quiz 1', score: quiz, maxScore: 10, weightage: 10 },
              { name: 'Assignments', score: assignments, maxScore: 20, weightage: 20 },
              { name: 'Final Exam', score: finalExam, maxScore: 40, weightage: 40 }
            ]
          };
        });
        
        setHistoryData(mapped);
      }
    } catch (e) {
      console.warn("Failed to load historical data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSem) {
      fetchHistory(selectedSem);
    }
  }, [selectedSem]);

  // Overall statistics for the selected semester
  const overallGpa = historyData.length > 0 
    ? (historyData.reduce((acc, c) => {
        const gradePoints: Record<string, number> = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };
        return acc + gradePoints[c.grade];
      }, 0) / historyData.length).toFixed(2)
    : '0.00';

  const overallAtt = historyData.length > 0
    ? (historyData.reduce((acc, c) => acc + c.attendance, 0) / historyData.length).toFixed(1)
    : '0.0';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Academic History
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Review your historical semester performance, grades, and attendance metrics.
          </p>
        </div>

        {/* Previous Semester Selector */}
        {historicalSemesters.length > 0 && (
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {historicalSemesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSem(sem)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedSem === sem ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        )}
      </header>

      {historicalSemesters.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 p-12 text-center rounded-2xl">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
          <p className="font-bold text-slate-700 text-base">No History Records Available</p>
          <p className="text-slate-400 text-xs mt-1">
            You are currently enrolled in your starting semester ({studentSem}). History reports populate once promoted.
          </p>
        </div>
      ) : loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-155 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-bold">Retrieving historical grades and scores...</p>
        </div>
      ) : (
        <>
          {/* KPI Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Semester GPA (Avg)</p>
                <h3 className="text-2xl font-bold text-slate-900">{overallGpa} / 10.00</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Average Attendance</p>
                <h3 className="text-2xl font-bold text-slate-900">{overallAtt}%</h3>
              </div>
            </div>
          </div>

          {/* Subjects performance logs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-800">Semester {selectedSem} Course Performance</h3>
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                {historyData.length} Subjects Taught
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {historyData.map(course => (
                <div key={course.code} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 text-indigo-500 rounded-xl border border-slate-100 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {course.code}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          Grade: <strong className="text-blue-600 font-extrabold">{course.grade}</strong>
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 mt-1">{course.subject}</h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-650">
                    <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Attendance</p>
                      <p className="font-bold text-slate-900 mt-0.5">{course.attendance}%</p>
                    </div>
                    {course.components.map((comp, idx) => (
                      <div key={idx} className="text-left border-l border-slate-200 pl-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{comp.name}</p>
                        <p className="font-bold text-slate-900 mt-0.5">{comp.score} / {comp.maxScore}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AcademicHistory;
