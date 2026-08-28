import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calculator, 
  Award, 
  GraduationCap, 
  CheckCircle, 
  Percent, 
  BookOpen, 
  ChevronRight, 
  AlertTriangle,
  TrendingUp,
  Layers,
  Sparkles,
  Clock,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStudentAcademicProfile, type StudentAcademicProfile, type SemesterAcademicRecord } from '../utils/academicData';
import { SUBJECTS_DATABASE, getNormalizedDepartment } from '../utils/subjectsData';

interface ComponentMark {
  name: string;
  score: number;
  maxScore: number;
  weightage: number;
}

interface CourseMarks {
  subject: string;
  code: string;
  grade: string;
  isOngoing: boolean;
  components: ComponentMark[];
}

const Marks = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<StudentAcademicProfile>(() => getStudentAcademicProfile(user));
  const [activeViewTab, setActiveViewTab] = useState<'current' | 'transcript'>('current');
  const [selectedSemester, setSelectedSemester] = useState<string>(user?.semester || '4-1');

  // Load and subscribe to academic profile updates
  useEffect(() => {
    const loaded = getStudentAcademicProfile(user);
    setProfile(loaded);
    setSelectedSemester(user?.semester || '4-1');

    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setProfile(e.detail);
      }
    };
    window.addEventListener('academic-profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('academic-profile-updated', handleProfileUpdate);
  }, [user]);

  // Current semester course data
  const studentDept = getNormalizedDepartment(user?.department || 'Computer Science and Engineering (CSE)');
  const currentSemesterRecord = profile.semesters.find(s => s.semester === selectedSemester) || profile.semesters[profile.semesters.length - 1];
  const isSelectedSemOngoing = currentSemesterRecord?.isCurrentOngoing ?? (selectedSemester === (user?.semester || '4-1'));

  const currentCourses: CourseMarks[] = currentSemesterRecord?.subjects.map(s => ({
    subject: s.subject,
    code: s.code,
    grade: s.isFinalExamCompleted ? s.grade : 'CIE Active',
    isOngoing: !s.isFinalExamCompleted,
    components: [
      { name: 'Midterm 1', score: s.internal, maxScore: 30, weightage: 30 },
      { name: 'Quiz 1', score: s.quiz, maxScore: 10, weightage: 10 },
      { name: 'Assignments & Lab', score: s.assignment, maxScore: 20, weightage: 20 },
      { 
        name: s.isFinalExamCompleted ? 'Final Exam (Official)' : 'Final Exam (Target Forecast)', 
        score: s.isFinalExamCompleted ? s.finalExam : 36, 
        maxScore: 40, 
        weightage: 40 
      }
    ]
  })) || [];

  const [selectedCourse, setSelectedCourse] = useState<CourseMarks | null>(null);

  // Initialize selected course
  useEffect(() => {
    if (currentCourses.length > 0) {
      setSelectedCourse(currentCourses[0]);
      setMidtermScore(currentCourses[0].components[0].score);
      setQuizScore(currentCourses[0].components[1].score);
      setLabScore(currentCourses[0].components[2].score);
      setFinalTarget(currentCourses[0].components[3].score);
    }
  }, [selectedSemester, profile]);

  // Grade Estimator sandbox
  const [midtermScore, setMidtermScore] = useState<number>(25);
  const [quizScore, setQuizScore] = useState<number>(9);
  const [labScore, setLabScore] = useState<number>(18);
  const [finalTarget, setFinalTarget] = useState<number>(36);

  const totalCalculated = midtermScore + quizScore + labScore + finalTarget;

  const getEstimatedGrade = (score: number) => {
    if (score >= 90) return 'O (Outstanding • 10 GP)';
    if (score >= 82) return 'A+ (Excellent • 9 GP)';
    if (score >= 74) return 'A (Very Good • 8 GP)';
    if (score >= 65) return 'B+ (Good • 7 GP)';
    if (score >= 55) return 'B (Above Average • 6 GP)';
    if (score >= 45) return 'C (Pass • 5 GP)';
    return 'F (Fail • 0 GP)';
  };

  const handleSelectCourse = (course: CourseMarks) => {
    setSelectedCourse(course);
    setMidtermScore(course.components[0].score);
    setQuizScore(course.components[1].score);
    setLabScore(course.components[2].score);
    setFinalTarget(course.components[3].score);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen pb-28">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
              Academic Performance & University Gradebook
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Internal Marks & GPA Estimator
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Published university semester transcripts, continuous internal evaluation, and GPA forecasting.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setActiveViewTab('current')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeViewTab === 'current'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSelectedSemOngoing ? 'Ongoing Semester (4-1)' : `Semester ${selectedSemester}`}
          </button>
          <button
            onClick={() => setActiveViewTab('transcript')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeViewTab === 'transcript'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Semesters Transcript ({profile.semesters.length})
          </button>
        </div>
      </header>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative Published CGPA */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Official CGPA</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {profile.cgpa.toFixed(2)} <span className="text-xs text-slate-400 font-bold">/ 10.0</span>
          </h3>
          <p className="text-[11px] text-blue-600 font-bold mt-0.5">
            Completed: Sem 1-1 to 3-2 ({profile.totalCreditsCompleted} Credits)
          </p>
        </div>

        {/* Equivalent Percentage */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Aggregate %</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {profile.overallPercentage.toFixed(1)}%
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Formula: (CGPA - 0.75) × 10</p>
        </div>

        {/* Current Semester Status */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Sem {user?.semester || '4-1'} Status</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-sm sm:text-base font-black text-amber-600 mt-1">
            Ongoing Term
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Final Exams Awaited</p>
        </div>

        {/* Academic Standing */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Standing</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-xs sm:text-sm font-black text-purple-700 truncate mt-1">
            {profile.academicStanding}
          </h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Eligible for Campus Placements</p>
        </div>
      </div>

      {/* 1. All Semesters Full Academic Transcript */}
      {activeViewTab === 'transcript' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                University Semester-Wise Academic Transcript
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official grading history for completed terms (1-1 to 3-2) and continuous evaluation for current term ({user?.semester || '4-1'})
              </p>
            </div>
            <span className="text-xs font-black bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200 self-start sm:self-auto">
              Official CGPA: {profile.cgpa.toFixed(2)} ({profile.overallPercentage.toFixed(1)}%)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="p-3.5 font-bold">Academic Term</th>
                  <th className="p-3.5 font-bold">Academic Year</th>
                  <th className="p-3.5 font-bold">Credits</th>
                  <th className="p-3.5 font-bold">SGPA</th>
                  <th className="p-3.5 font-bold">Percentage</th>
                  <th className="p-3.5 font-bold">University Status</th>
                  <th className="p-3.5 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {profile.semesters.map((sem) => (
                  <tr key={sem.semester} className={`hover:bg-slate-50/70 transition-colors ${sem.isCurrentOngoing ? 'bg-amber-50/30' : ''}`}>
                    <td className="p-3.5 font-extrabold text-slate-900 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sem.isCurrentOngoing ? 'bg-amber-500 animate-pulse' : 'bg-blue-600'}`}></span>
                      Semester {sem.semester}
                      {sem.isCurrentOngoing && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded ml-1">
                          CURRENT
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-600">{sem.year}</td>
                    <td className="p-3.5 font-bold text-slate-800">{sem.credits} Credits</td>
                    <td className="p-3.5 font-black text-slate-900 text-sm">
                      {sem.isCurrentOngoing ? (
                        <span className="text-amber-700 text-xs">~{sem.sgpa.toFixed(2)} (CIE)</span>
                      ) : (
                        sem.sgpa.toFixed(2)
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-blue-600">
                      {sem.isCurrentOngoing ? (
                        <span className="text-amber-700 text-xs">~{sem.percentage.toFixed(1)}%</span>
                      ) : (
                        `${sem.percentage.toFixed(1)}%`
                      )}
                    </td>
                    <td className="p-3.5">
                      {sem.isCurrentOngoing ? (
                        <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                          In Progress (Exam Awaited)
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                          sem.status === 'Distinction'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sem.status === 'First Class'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : sem.status === 'Fail'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sem.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedSemester(sem.semester);
                          setActiveViewTab('current');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-bold transition-all"
                      >
                        {sem.isCurrentOngoing ? 'Inspect CIE Marks' : 'View Grade Card'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Current Semester Course Breakdown & GPA Simulator */}
      {activeViewTab === 'current' && (
        <div className="space-y-6">
          {/* Ongoing Notification Banner */}
          {isSelectedSemOngoing && (
            <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3 text-amber-900">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                  Semester {selectedSemester} is Currently Ongoing
                </h4>
                <p className="text-xs font-medium text-amber-700 mt-0.5 leading-relaxed">
                  Final university theory & practical examinations for Semester {selectedSemester} are not yet conducted. The marks shown below reflect your continuous internal evaluation (Midterms, Quizzes & Lab Assignments). Use the <b>Interactive Grade Forecaster</b> on the right to simulate your upcoming final exam target score!
                </p>
              </div>
            </div>
          )}

          {/* Semester Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Select Academic Semester:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.semesters.map(s => (
                <button
                  key={s.semester}
                  onClick={() => setSelectedSemester(s.semester)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedSemester === s.semester
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Sem {s.semester}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    selectedSemester === s.semester 
                      ? 'bg-blue-700 text-white' 
                      : (s.isCurrentOngoing ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700')
                  }`}>
                    {s.isCurrentOngoing ? 'Ongoing' : `SGPA ${s.sgpa.toFixed(2)}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Courses Grid & Selected Course Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Courses selection cards */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Semester {selectedSemester} Courses ({currentCourses.length} Subjects)
                  </h3>
                  <span className="text-xs font-bold text-blue-600">Click subject to inspect breakdown</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentCourses.map((course) => (
                    <div
                      key={course.code}
                      onClick={() => handleSelectCourse(course)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                        selectedCourse?.code === course.code
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-400'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-slate-500">{course.code}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          course.isOngoing
                            ? 'text-amber-800 bg-amber-100'
                            : 'text-blue-700 bg-blue-100/70'
                        }`}>
                          {course.grade}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs truncate leading-snug">{course.subject}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          {course.isOngoing ? 'Internal CIE Active' : 'Official Results Published'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Component breakdown */}
              {selectedCourse && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">{selectedCourse.code}</span>
                      <h3 className="text-sm font-black text-slate-900">{selectedCourse.subject}</h3>
                    </div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${
                      selectedCourse.isOngoing
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {selectedCourse.isOngoing ? 'Continuous Internal Evaluation' : `Grade: ${selectedCourse.grade}`}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    {selectedCourse.components.map((c, idx) => {
                      const pct = c.maxScore > 0 ? (c.score / c.maxScore) * 100 : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{c.name} ({c.weightage}% Weightage)</span>
                            <span>
                              {c.score} / {c.maxScore} <span className="text-slate-400">({pct.toFixed(0)}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sandbox GPA Forecaster */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Interactive Grade Forecaster
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Adjust target scores to estimate your final subject grade and GP.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Midterm Exam (Max 30)</label>
                    <input
                      type="number"
                      max={30}
                      min={0}
                      value={midtermScore}
                      onChange={(e) => setMidtermScore(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Quizzes & Tests (Max 10)</label>
                    <input
                      type="number"
                      max={10}
                      min={0}
                      value={quizScore}
                      onChange={(e) => setQuizScore(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Labs / Assignments (Max 20)</label>
                    <input
                      type="number"
                      max={20}
                      min={0}
                      value={labScore}
                      onChange={(e) => setLabScore(Math.min(20, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Final Exam Target (Max 40)</label>
                    <input
                      type="number"
                      max={40}
                      min={0}
                      value={finalTarget}
                      onChange={(e) => setFinalTarget(Math.min(40, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-purple-800">
                      <span>Simulated Total Score:</span>
                      <span className="text-base font-black text-purple-900">{totalCalculated} / 100</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-purple-800">
                      <span>Forecasted Grade:</span>
                      <span className="text-xs font-extrabold text-purple-950">{getEstimatedGrade(totalCalculated)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marks;
