import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

import { BarChart3, Calculator, Award, GraduationCap, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS_DATABASE, getNormalizedDepartment } from '../utils/subjectsData';

interface ComponentMark {
  name: string;
  score: number;
  maxScore: number;
  weightage: number; // percentage of total grade
}

interface CourseMarks {
  subject: string;
  code: string;
  grade: string;
  components: ComponentMark[];
}

const INITIAL_MARKS: CourseMarks[] = [
  {
    subject: 'Math III',
    code: 'MATH301',
    grade: 'A',
    components: [
      { name: 'Midterm 1', score: 27, maxScore: 30, weightage: 30 },
      { name: 'Quiz 1', score: 9, maxScore: 10, weightage: 10 },
      { name: 'Assignments', score: 18, maxScore: 20, weightage: 20 },
      { name: 'Final Exam (Estimated)', score: 36, maxScore: 40, weightage: 40 }
    ]
  },
  {
    subject: 'Data Structures',
    code: 'CS402',
    grade: 'A+',
    components: [
      { name: 'Midterm 1', score: 29, maxScore: 30, weightage: 30 },
      { name: 'Quiz 1', score: 10, maxScore: 10, weightage: 10 },
      { name: 'Coding Lab Projects', score: 19, maxScore: 20, weightage: 20 },
      { name: 'Final Exam (Estimated)', score: 37, maxScore: 40, weightage: 40 }
    ]
  },
  {
    subject: 'Applied Physics',
    code: 'PHYS204',
    grade: 'B+',
    components: [
      { name: 'Midterm 1', score: 23, maxScore: 30, weightage: 30 },
      { name: 'Quiz 1', score: 8, maxScore: 10, weightage: 10 },
      { name: 'Lab Experiments', score: 17, maxScore: 20, weightage: 20 },
      { name: 'Final Exam (Estimated)', score: 32, maxScore: 40, weightage: 40 }
    ]
  }
];

const Marks = () => {
  const { user } = useAuth();
  
  // Calculate dynamic subjects based on logged-in student's info
  const studentDept = getNormalizedDepartment(user?.department || 'Computer Science');
  const studentSem = user?.semester || '3-1';
  const semesterSubjectsList = SUBJECTS_DATABASE[studentDept]?.[studentSem] || [];
  
  const generatedMarks: CourseMarks[] = semesterSubjectsList.map((name, idx) => {
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

    const hash = name.length;
    const overallMarks = 70 + (hash % 28); // 70 to 97%
    
    const midterm = Math.round((30 / 100) * overallMarks);
    const quiz = Math.round((10 / 100) * overallMarks);
    const lab = Math.round((20 / 100) * overallMarks);
    const finalExam = overallMarks - (midterm + quiz + lab);

    const getGradeChar = (score: number) => {
      if (score >= 95) return 'O';
      if (score >= 88) return 'A+';
      if (score >= 80) return 'A';
      if (score >= 70) return 'B+';
      if (score >= 60) return 'B';
      if (score >= 50) return 'C';
      return 'F';
    };

    const grade = getGradeChar(overallMarks);

    return {
      subject: name,
      code: codes[name] || `SUBJ${100 + idx}`,
      grade,
      components: [
        { name: 'Midterm 1', score: midterm, maxScore: 30, weightage: 30 },
        { name: 'Quiz 1', score: quiz, maxScore: 10, weightage: 10 },
        { name: 'Assignments', score: lab, maxScore: 20, weightage: 20 },
        { name: 'Final Exam (Estimated)', score: finalExam, maxScore: 40, weightage: 40 }
      ]
    };
  });

  const initialCourses = generatedMarks.length > 0 ? generatedMarks : INITIAL_MARKS;

  const [courses, setCourses] = useState<CourseMarks[]>(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<CourseMarks>(initialCourses[0]);
  const [loading, setLoading] = useState(true);
  
  // Grade Estimator sandbox
  const [midtermScore, setMidtermScore] = useState<number>(initialCourses[0]?.components[0]?.score || 23);
  const [quizScore, setQuizScore] = useState<number>(initialCourses[0]?.components[1]?.score || 8);
  const [labScore, setLabScore] = useState<number>(initialCourses[0]?.components[2]?.score || 17);
  const [finalTarget, setFinalTarget] = useState<number>(initialCourses[0]?.components[3]?.score || 35);

  const fetchMarks = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/marks?student_id=${user.id}&semester=${studentSem}`, {
        headers: {
          'x-requester-username': user.username,
          'x-requester-role': user.role || 'student'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const subjectGroups: Record<string, any> = {};
        data.forEach((m: any) => {
          if (!subjectGroups[m.subject]) {
            subjectGroups[m.subject] = [];
          }
          subjectGroups[m.subject].push(m);
        });
        
        const mappedCourses: CourseMarks[] = generatedMarks.map(subj => {
          const compMarks = subjectGroups[subj.subject] || [];
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
          return {
            subject: subj.subject,
            code: subj.code,
            grade: getGradeChar(total),
            components: [
              { name: 'Midterm 1', score: midterm, maxScore: 30, weightage: 30 },
              { name: 'Quiz 1', score: quiz, maxScore: 10, weightage: 10 },
              { name: 'Assignments', score: assignments, maxScore: 20, weightage: 20 },
              { name: 'Final Exam (Estimated)', score: finalExam, maxScore: 40, weightage: 40 }
            ]
          };
        });
        
        setCourses(mappedCourses);
        if (mappedCourses.length > 0) {
          setSelectedCourse(mappedCourses[0]);
          setMidtermScore(mappedCourses[0].components[0].score);
          setQuizScore(mappedCourses[0].components[1].score);
          setLabScore(mappedCourses[0].components[2].score);
          setFinalTarget(mappedCourses[0].components[3].score);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live marks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, [user?.id, user?.semester, user?.department]);

  const totalCalculated = midtermScore + quizScore + labScore + finalTarget;

  const getEstimatedGrade = (score: number) => {
    if (score >= 95) return 'O (Outstanding)';
    if (score >= 88) return 'A+ (Excellent)';
    if (score >= 80) return 'A (Very Good)';
    if (score >= 70) return 'B+ (Good)';
    if (score >= 60) return 'B (Above Average)';
    if (score >= 50) return 'C (Average)';
    return 'F (Fail)';
  };

  const handleSelectCourse = (course: CourseMarks) => {
    setSelectedCourse(course);
    setMidtermScore(course.components[0].score);
    setQuizScore(course.components[1].score);
    setLabScore(course.components[2].score);
    setFinalTarget(course.components[3].score);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Internal Marks & GPA Estimator
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Monitor scores, see marks distribution, and forecast grade points.
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Current CGPA (Avg)</p>
            <h3 className="text-2xl font-bold text-slate-900">8.92 / 10.0</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Outstanding Grades</p>
            <h3 className="text-2xl font-bold text-purple-600">2 Subjects (A/A+)</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Academic Standing</p>
            <h3 className="text-2xl font-bold text-emerald-600">First Class Distinction</h3>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Marks Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Courses selection cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Enrolled Subjects Marks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.code}
                  onClick={() => handleSelectCourse(course)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    selectedCourse.code === course.code
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400">{course.code}</span>
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Grade: {course.grade}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 truncate">{course.subject}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Click to details & predict</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Component breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Score Weightage: <span className="text-blue-600">{selectedCourse.subject}</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{selectedCourse.code}</span>
            </div>

            <div className="p-6 space-y-4">
              {selectedCourse.components.map((c, idx) => {
                const pct = c.maxScore > 0 ? (c.score / c.maxScore) * 100 : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                      <span>{c.name} ({c.weightage}% weightage)</span>
                      <span>{c.score} / {c.maxScore} <span className="text-slate-400">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Sandbox GPA Forecaster */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Grade Forecaster
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Simulate upcoming exam targets to estimate final grades.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Midterm (Max 30)</label>
                <input
                  type="number"
                  max={30}
                  value={midtermScore}
                  onChange={(e) => setMidtermScore(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Quizzes (Max 10)</label>
                <input
                  type="number"
                  max={10}
                  value={quizScore}
                  onChange={(e) => setQuizScore(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Labs / Assignments (Max 20)</label>
                <input
                  type="number"
                  max={20}
                  value={labScore}
                  onChange={(e) => setLabScore(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Final Exam Forecast (Max 40)</label>
                <input
                  type="number"
                  max={40}
                  value={finalTarget}
                  onChange={(e) => setFinalTarget(Math.min(40, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-purple-700">
                  <span>Total Simulated Score:</span>
                  <span className="text-sm font-extrabold text-purple-900">{totalCalculated} / 100</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-purple-700">
                  <span>Estimated Grade:</span>
                  <span className="text-sm font-extrabold text-purple-900">{getEstimatedGrade(totalCalculated)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marks;
