import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

import { 
  Book, 
  Award, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  X, 
  ChevronRight, 
  MessageSquare, 
  Calculator, 
  CheckCircle2, 
  RefreshCw,
  Bell,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS_DATABASE, getNormalizedDepartment } from '../utils/subjectsData';

interface SubjectInfo {
  name: string;
  marks: number;
  attendance: number;
  code: string;
  faculty: string;
  nextExam: string;
  notes: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | 'Final Year';
}

interface Announcement {
  id: number;
  text: string;
  date: string;
  important?: boolean;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, text: 'Hackathon next week!', date: 'Today', important: true },
  { id: 2, text: 'Midterm schedules are out.', date: 'Yesterday', important: false },
  { id: 3, text: 'Library extended hours for exam week.', date: '2 days ago', important: false }
];

const Dashboard = () => {
  const { user, viewMode } = useAuth();
  const navigate = useNavigate();

  // State initialized immediately so screen NEVER stays blank
  const [attendance, setAttendance] = useState<number>(85.5);
  const [healthScore, setHealthScore] = useState<number>(88);
  const [aiInsight, setAiInsight] = useState<string>(
    'Your performance in CS is excellent. Focus on Physics to boost your overall health score!'
  );
  
  // Calculate dynamic subjects based on logged-in student's info
  const studentDept = getNormalizedDepartment(user?.department || 'Computer Science');
  const studentSem = user?.semester || '3-1';
  const semesterSubjectsList = SUBJECTS_DATABASE[studentDept]?.[studentSem] || [];
  
  const generatedSubjects: SubjectInfo[] = semesterSubjectsList.map((name, idx) => {
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

    const faculties = [
      'Dr. Clara Croft',
      'Prof. Alan Vance',
      'Dr. Sarah Jenkins',
      'Dr. Rajiv Sharma',
      'Prof. Amit Patel',
      'Dr. Helen Hunt'
    ];

    // Live class attendance calculation (20 classes held per subject)
    const studentSeed = (user?.username || user?.name || 'student').length;
    const hash = idx * 7 + studentSeed * 13;
    const totalClassesHeld = 20;
    const attendedClasses = (studentSeed + idx) % 2 === 0 ? 20 : (studentSeed + idx) % 3 === 0 ? 18 : 14;
    const attendanceVal = parseFloat(((attendedClasses / totalClassesHeld) * 100).toFixed(1));
    const marksVal = 70 + ((hash + studentSeed) % 28); // 70 to 97%
    
    const semChar = studentSem.charAt(0);
    const yrString = semChar === '1' ? '1st Year' :
                     semChar === '2' ? '2nd Year' :
                     semChar === '3' ? '3rd Year' : 'Final Year';

    return {
      name,
      marks: marksVal,
      attendance: attendanceVal,
      code: codes[name] || `SUBJ${100 + idx}`,
      faculty: faculties[hash % faculties.length],
      nextExam: `Oct ${10 + (hash % 18)}, 2026`,
      notes: `Focus on core concepts of ${name}. Review lecture materials.`,
      year: yrString as any
    };
  });

  const [subjects, setSubjects] = useState<SubjectInfo[]>(generatedSubjects);
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);

  useEffect(() => {
    setSubjects(generatedSubjects);
    if (generatedSubjects.length > 0) {
      // Calculate live overall attendance identically to Attendance.tsx
      const totalAttended = generatedSubjects.reduce((sum, s, idx) => {
        const studentSeed = (user?.username || user?.name || 'student').length;
        const attended = (studentSeed + idx) % 2 === 0 ? 20 : (studentSeed + idx) % 3 === 0 ? 18 : 14;
        return sum + attended;
      }, 0);
      const totalHeld = generatedSubjects.length * 20;
      const avgAtt = totalHeld > 0 ? parseFloat(((totalAttended / totalHeld) * 100).toFixed(1)) : 92.0;
      const avgMks = Math.round(generatedSubjects.reduce((acc, s) => acc + s.marks, 0) / generatedSubjects.length);
      
      // Check if cached summary exists
      try {
        const cached = localStorage.getItem('campus_ai_attendance_summary');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.overall_percentage !== undefined) {
            setAttendance(parsed.overall_percentage);
            const computedHealth = Math.min(100, Math.round((avgMks * 0.40) + (parsed.overall_percentage * 0.40) + (90 * 0.10) + (88 * 0.10)));
            setHealthScore(computedHealth);
            return;
          }
        }
      } catch { /* ignore */ }

      setAttendance(avgAtt);
      const computedHealth = Math.min(100, Math.round((avgMks * 0.40) + (avgAtt * 0.40) + (90 * 0.10) + (88 * 0.10)));
      setHealthScore(computedHealth);
    }
  }, [user?.department, user?.semester, user?.username, user?.name]);
  
  // Interactive UI modals
  const [selectedSubject, setSelectedSubject] = useState<SubjectInfo | null>(null);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [showHealthBreakdown, setShowHealthBreakdown] = useState<boolean>(false);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState<boolean>(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState<string>('');
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Calculator form state
  const [attendedClasses, setAttendedClasses] = useState<number>(34);
  const [totalClasses, setTotalClasses] = useState<number>(40);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  const canPost = viewMode === 'faculty' || viewMode === 'admin';

  useEffect(() => {
    if (!user?.id) return;
    
    const headers = {
      'x-requester-username': user.username,
      'x-requester-role': user.role || 'student'
    };
    
    // Fetch attendance statistics
    fetch(`${API_BASE_URL}/attendance/student/${user.id}`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then(attData => {
        const realOverallAtt = attData.overall_percentage !== undefined ? attData.overall_percentage : attData.overall_pct;
        if (realOverallAtt !== undefined) {
          setAttendance(realOverallAtt);
        }
        
        // Fetch marks
        fetch(`${API_BASE_URL}/marks?student_id=${user.id}&semester=${studentSem}`, { headers })
          .then(res => {
            if (!res.ok) throw new Error('API Error');
            return res.json();
          })
          .then(marksData => {
            const subjectMarksMap: Record<string, number> = {};
            marksData.forEach((m: any) => {
              if (!subjectMarksMap[m.subject]) {
                subjectMarksMap[m.subject] = 0;
              }
              subjectMarksMap[m.subject] += m.marks;
            });
            
            const updatedSubjects = generatedSubjects.map(subj => {
              const attSubj = attData.subject_list?.find((s: any) => s.subject === subj.name);
              const realAtt = attSubj ? attSubj.percentage : 0.0;
              const realMark = subjectMarksMap[subj.name] !== undefined ? subjectMarksMap[subj.name] : 0;
              return {
                ...subj,
                attendance: realAtt,
                marks: realMark
              };
            });
            
            setSubjects(updatedSubjects);
            if (updatedSubjects.length > 0) {
              const avgMks = Math.round(updatedSubjects.reduce((acc, s) => acc + s.marks, 0) / updatedSubjects.length);
              const attVal = realOverallAtt !== undefined ? realOverallAtt : (
                updatedSubjects.reduce((acc, s) => acc + s.attendance, 0) / updatedSubjects.length
              );
              const computedHealth = Math.min(100, Math.round((avgMks * 0.40) + (attVal * 0.40) + (90 * 0.10) + (88 * 0.10)));
              setHealthScore(computedHealth);
            }
            setApiConnected(true);
          })
          .catch(() => setApiConnected(false));
      })
      .catch(() => {
        setApiConnected(false);
      });
  }, [user?.id, user?.semester, user?.department]);

  const handleRefreshInsights = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const insights = [
        'Great progress! Your CS score is in the top 5% of your class.',
        'Attention needed: Physics attendance is 79.5%. Attending 3 more lectures will reach target 75%.',
        'Consistently high performance in Math (90%). Keep up the regular practice before midterms!',
        'Your academic health score is 88/100, indicating strong steady progress overall.'
      ];
      const randomInsight = insights[Math.floor(Math.random() * insights.length)];
      setAiInsight(randomInsight);
      setIsRefreshing(false);
    }, 400);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;
    const item: Announcement = {
      id: Date.now(),
      text: newAnnouncementText.trim(),
      date: 'Just now',
      important: true,
    };
    setAnnouncements([item, ...announcements]);
    setNewAnnouncementText('');
    setShowAddAnnouncement(false);
  };

  // Calculator math
  const currentCalcPct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '0';
  const neededClasses = (() => {
    if (totalClasses <= 0) return 0;
    const targetRatio = targetPercentage / 100;
    if (attendedClasses / totalClasses >= targetRatio) return 0;
    // (attended + x) / (total + x) >= targetRatio => attended + x >= targetRatio*total + targetRatio*x => x(1 - targetRatio) >= targetRatio*total - attended
    const req = Math.ceil((targetRatio * totalClasses - attendedClasses) / (1 - targetRatio));
    return req > 0 ? req : 0;
  })();

  const handleAskAIAboutSubject = (subjectName: string) => {
    navigate('/chat', { state: { initialPrompt: `Can you help me prepare for my ${subjectName} exam and improve my performance?` } });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 min-h-screen pb-32 sm:pb-12">
      {/* Attendance Warning Alert Banner */}
      {subjects.some(s => s.attendance < 75) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm flex items-start gap-3 animate-bounce-subtle">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-900 text-sm">Attendance Shortage Alert</h4>
            <p className="text-xs text-red-700 font-medium">
              Your attendance is below the mandatory 75% threshold in the following course(s). Please attend upcoming lectures to avoid debarment:
            </p>
            <ul className="list-disc pl-5 text-xs text-red-800 font-bold space-y-0.5 mt-1.5">
              {subjects.filter(s => s.attendance < 75).map(s => (
                <li key={s.code}>
                  {s.name} ({s.code}) — Current Attendance: <span className="text-red-600 underline">{s.attendance}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-xs sm:text-sm">
            Here is your academic overview for today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>Attendance Predictor</span>
          </button>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${
            apiConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {apiConnected ? 'API Live' : 'Demo Active'}
          </span>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {/* Attendance Card */}
        <div 
          onClick={() => navigate('/attendance')}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view full actual attendance records"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1 truncate">
                Attendance <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{attendance}%</h3>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div
          onClick={() => navigate('/academic-health')}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view full health score factor analysis"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1 truncate">
                Health Score <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{healthScore}/100</h3>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="col-span-2 bg-gradient-to-r from-purple-50 to-indigo-50/50 rounded-2xl p-4 sm:p-6 shadow-sm border border-purple-100 flex items-start space-x-3 sm:space-x-4">
          <div className="p-2.5 sm:p-3 bg-purple-100 text-purple-600 rounded-xl shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-purple-900 font-bold">AI Insight</p>
              <button 
                onClick={handleRefreshInsights}
                className="text-purple-600 hover:text-purple-800 text-xs font-semibold p-1 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                title="Generate fresh AI academic insight"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-purple-950 font-medium mt-1 leading-snug">
              {aiInsight}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Subjects & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects List (Takes 2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-600" />
                Enrolled Subjects (Year-Wise)
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Click any subject to view detailed report & AI study help
              </p>
            </div>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
              {subjects.length} Enrolled
            </span>
          </div>

          <div className="space-y-6">
            {['1st Year', '2nd Year', '3rd Year', 'Final Year'].map((yr) => {
              const yrSubjects = subjects.filter(s => s.year === yr);
              if (yrSubjects.length === 0) return null;
              return (
                <div key={yr} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{yr} CURRICULUM</h4>
                  <div className="space-y-3">
                    {yrSubjects.map((subj) => (
                      <div
                        key={subj.name}
                        onClick={() => setSelectedSubject(subj)}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-50 hover:bg-blue-50/50 rounded-xl border transition-all cursor-pointer group gap-3 ${
                          subj.attendance < 75 ? 'border-red-100 bg-red-50/10 hover:bg-red-50/20' : 'border-transparent hover:border-blue-100'
                        }`}
                      >
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className={`p-2.5 rounded-xl shadow-sm group-hover:shadow shrink-0 mt-0.5 sm:mt-0 ${
                            subj.attendance < 75 ? 'bg-red-100 text-red-600' : 'bg-white text-indigo-500'
                          }`}>
                            <Book className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug break-words">{subj.name}</h4>
                              {subj.attendance < 75 && (
                                <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-0.5 shrink-0">
                                  <AlertTriangle className="w-3 h-3" /> Warning
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {subj.code} • Attendance:{' '}
                              <span className={subj.attendance < 75 ? 'text-red-600 font-bold' : ''}>
                                {subj.attendance}%
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                          <div className="text-left sm:text-right">
                            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Internal Marks</p>
                            <p className="font-extrabold text-slate-900 text-base sm:text-lg">{subj.marks}%</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Announcements
            </h2>
            {canPost && (
              <button
                onClick={() => setShowAddAnnouncement(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                title="Add announcement"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[380px]">
            {announcements.map((ann) => (
              <div key={ann.id} className="flex items-start space-x-3 group">
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                  ann.important ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-800 font-medium leading-snug">{ann.text}</p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{ann.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject Detail Drawer / Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  {selectedSubject.code}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedSubject.name}</h3>
                <p className="text-xs text-slate-500">Instructor: {selectedSubject.faculty}</p>
              </div>
              <button
                onClick={() => setSelectedSubject(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Internal Score</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{selectedSubject.marks}%</p>
                <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Above Passing Target
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Subject Attendance</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{selectedSubject.attendance}%</p>
                <p className="text-[11px] text-slate-500 mt-1">Target threshold: 75.0%</p>
              </div>
            </div>

            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-2">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" /> AI Recommendation
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {selectedSubject.notes}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAskAIAboutSubject(selectedSubject.name)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask AI Assistant</span>
              </button>
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Predictor Modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Attendance Predictor</h3>
                  <p className="text-xs text-slate-500">Calculate required classes to reach target</p>
                </div>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Attended Classes</label>
                <input
                  type="number"
                  value={attendedClasses}
                  onChange={(e) => setAttendedClasses(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Total Classes Held</label>
                <input
                  type="number"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Percentage (%)</label>
                <input
                  type="number"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(Math.min(100, Math.max(50, parseInt(e.target.value) || 75)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                <p className="text-xs text-blue-700 font-medium">Current Calculated Attendance: <span className="font-bold text-blue-900">{currentCalcPct}%</span></p>
                {neededClasses > 0 ? (
                  <p className="text-sm font-semibold text-blue-900 mt-1">
                    You need to attend <span className="text-blue-600 underline font-bold">{neededClasses}</span> more consecutive classes to reach {targetPercentage}%.
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-emerald-700 mt-1">
                    🎉 You have already met or exceeded your {targetPercentage}% target!
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowCalculator(false)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Health Score Factors Breakdown Modal */}
      {showHealthBreakdown && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Academic Health Score Breakdown</h3>
                  <p className="text-xs text-slate-500">How your overall health score ({healthScore}/100) is computed</p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthBreakdown(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Factor 1: Internal Marks */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center justify-center text-xs shrink-0">
                    40%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Academic Internal Marks</h4>
                    <p className="text-[10px] text-slate-500">Average score across midterms, tests & assessments</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-900">{healthScore}%</span>
              </div>

              {/* Factor 2: Class Attendance */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center justify-center text-xs shrink-0">
                    40%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Live Class Attendance</h4>
                    <p className="text-[10px] text-slate-500">Attended classes ratio out of total held classes</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-900">{attendance}%</span>
              </div>

              {/* Factor 3: Assignment Completion */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 text-purple-700 font-bold rounded-xl flex items-center justify-center text-xs shrink-0">
                    10%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Assignment Completion</h4>
                    <p className="text-[10px] text-slate-500">On-time coursework submission rate</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-900">90%</span>
              </div>

              {/* Factor 4: Quizzes & Engagement */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-100 text-amber-700 font-bold rounded-xl flex items-center justify-center text-xs shrink-0">
                    10%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Quiz & Skill Engagement</h4>
                    <p className="text-[10px] text-slate-500">Participation in interactive quizzes & AI tools</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-900">85%</span>
              </div>
            </div>

            {/* Formula box */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs space-y-1">
              <p className="font-extrabold text-emerald-900 uppercase text-[10px] tracking-wider">Weighted Calculation Formula</p>
              <p className="text-emerald-800 font-mono text-[11px]">
                Health Score = (Marks × 0.4) + (Attendance × 0.4) + (Assignments × 0.1) + (Quizzes × 0.1)
              </p>
            </div>

            <button
              onClick={() => setShowHealthBreakdown(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {canPost && showAddAnnouncement && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddAnnouncement} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add New Announcement</h3>
              <button
                type="button"
                onClick={() => setShowAddAnnouncement(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Announcement Text</label>
              <textarea
                rows={3}
                value={newAnnouncementText}
                onChange={(e) => setNewAnnouncementText(e.target.value)}
                placeholder="Enter announcement notice..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => setShowAddAnnouncement(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Profile Card at bottom of Dashboard */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
          <Book className="w-4 h-4 text-blue-600" />
          Student Profile Summary
        </h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1 min-w-0 w-full text-xs">
            <div className="min-w-0">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Full Name</p>
              <p className="text-slate-900 font-extrabold text-sm mt-0.5 break-words">{user?.name || 'Alex Johnson'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Email Address</p>
              <p className="text-slate-900 font-extrabold text-sm mt-0.5 break-all">{user?.email || 'alex.j@campus.edu'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Department</p>
              <p className="text-slate-900 font-extrabold text-sm mt-0.5 break-words">{user?.department || 'Computer Science'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Academic Year</p>
              <p className="text-slate-900 font-extrabold text-sm mt-0.5">{user?.year || '3rd Year'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
