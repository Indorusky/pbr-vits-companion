import { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Upload, Search, Filter, X, Plus, Award, UserCheck, Eye, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS_DATABASE, getNormalizedDepartment } from '../utils/subjectsData';

export interface StudentSubmission {
  studentId: string;
  studentName: string;
  rollNumber: string;
  submittedFile: string;
  submittedAt: string;
  comments?: string;
  score?: number;
  feedback?: string;
  status: 'Submitted' | 'Graded';
}

export interface Assignment {
  id: string;
  title: string;
  department: string;
  semester: string;
  subject: string;
  createdBy: string;
  dueDate: string;
  description: string;
  points: number;
  submissions: Record<string, StudentSubmission>;
}

const DEPARTMENTS_LIST = [
  'Computer Science and Engineering (CSE)',
  'CSE AI',
  'CSE AIML',
  'Electronics and Communication Engineering (ECE)',
  'Electrical and Electronics Engineering (EEE)',
  'Civil Engineering',
];

const SEMESTERS_LIST = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'ass-1',
    title: 'Lab Task 3: Implementation of Graph Traversals & Shortest Path Algorithm',
    department: 'Computer Science and Engineering (CSE)',
    semester: '3-1',
    subject: 'Algorithms',
    createdBy: 'Dr. DODLA SRUJAN CHANDRA REDDY',
    dueDate: '2026-09-05',
    description: 'Implement Dijkstra\'s and BFS/DFS algorithms in Python/Java. Analyze the time complexity for sparse vs dense graphs and submit your code along with the execution report as a PDF document.',
    points: 100,
    submissions: {
      '2373A01001': {
        studentId: '2373A01001',
        studentName: 'Shaik Sameer',
        rollNumber: '2373A01001',
        submittedFile: 'graph_traversals_solution.pdf',
        submittedAt: '2026-08-26 14:30',
        comments: 'Implemented using PriorityQueue for optimal O((V+E)logV) complexity.',
        score: 95,
        feedback: 'Excellent work! Code structure and complexity analysis are spot on.',
        status: 'Graded'
      }
    }
  },
  {
    id: 'ass-2',
    title: 'Assignment 2: Deep Learning Model Optimization & Hyperparameter Tuning',
    department: 'CSE AI',
    semester: '3-1',
    subject: 'Artificial Intelligence',
    createdBy: 'Dr. GANUGULA VIJAY KUMAR',
    dueDate: '2026-09-10',
    description: 'Build a Convolutional Neural Network (CNN) for CIFAR-10 classification. Apply dropout, batch normalization, and test Adam vs SGD optimizers. Include accuracy curves.',
    points: 100,
    submissions: {}
  },
  {
    id: 'ass-3',
    title: 'Design Project 1: CMOS Analog Amplifier Circuit Simulation',
    department: 'Electronics and Communication Engineering (ECE)',
    semester: '3-1',
    subject: 'Digital Communications',
    createdBy: 'Dr. RAMIREDDY KONDAIAH',
    dueDate: '2026-09-02',
    description: 'Simulate a two-stage operational amplifier in SPICE. Calculate open-loop gain, phase margin, and power dissipation.',
    points: 100,
    submissions: {
      '2373B04012': {
        studentId: '2373B04012',
        studentName: 'K. Rajesh',
        rollNumber: '2373B04012',
        submittedFile: 'opamp_spice_simulation.zip',
        submittedAt: '2026-08-25 18:10',
        comments: 'Phase margin achieved is 62 degrees.',
        score: 88,
        feedback: 'Good simulation. Phase margin meets requirements.',
        status: 'Graded'
      }
    }
  },
  {
    id: 'ass-4',
    title: 'Assignment 1: Responsive Single Page Application using React & REST API',
    department: 'Computer Science and Engineering (CSE)',
    semester: '3-1',
    subject: 'Web Technologies',
    createdBy: 'Mr. SHAIK SHABBIR BASHA',
    dueDate: '2026-09-12',
    description: 'Construct a full-stack student dashboard featuring real-time data fetching, responsive UI layouts for mobile & desktop devices, and dark mode toggles.',
    points: 100,
    submissions: {}
  }
];

const Assignments = () => {
  const { user, viewMode } = useAuth();
  const isFacultyOrAdmin = viewMode === 'faculty' || viewMode === 'admin';

  // Normalize student department & semester
  const userDept = getNormalizedDepartment(user?.department || 'Computer Science and Engineering (CSE)');
  const userSem = user?.semester || '3-1';
  const studentId = user?.roll_number || user?.username || 'student_1';

  // Filter state (Default to 'All' so students see all published assignments without lockout)
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSem, setSelectedSem] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Assignments State
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_assignments_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    return INITIAL_ASSIGNMENTS;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('campus_ai_assignments_v2', JSON.stringify(assignments));
  }, [assignments]);

  // Create Assignment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDept, setNewDept] = useState<string>(userDept);
  const [newSem, setNewSem] = useState<string>(userSem);
  const [newSubject, setNewSubject] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPoints, setNewPoints] = useState<number>(100);

  // Student Submit Modal State
  const [activeSubmitAss, setActiveSubmitAss] = useState<Assignment | null>(null);
  const [submittedFileName, setSubmittedFileName] = useState<string>('');
  const [studentComments, setStudentComments] = useState<string>('');

  // Faculty Grading Modal State
  const [activeGradingAss, setActiveGradingAss] = useState<Assignment | null>(null);
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<StudentSubmission | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(100);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');

  // Get available subjects when creation department or semester changes
  const availableSubjectsForNew = SUBJECTS_DATABASE[newDept]?.[newSem] || ['General Coursework'];

  useEffect(() => {
    if (availableSubjectsForNew.length > 0) {
      setNewSubject(availableSubjectsForNew[0]);
    }
  }, [newDept, newSem]);

  // Handler: Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !newDueDate) return;

    const newAss: Assignment = {
      id: `ass-${Date.now()}`,
      title: newTitle.trim(),
      department: newDept,
      semester: newSem,
      subject: newSubject || availableSubjectsForNew[0] || 'General',
      createdBy: user?.name || user?.username || 'Faculty Instructor',
      dueDate: newDueDate,
      description: newDesc.trim(),
      points: newPoints,
      submissions: {}
    };

    setAssignments([newAss, ...assignments]);
    setNewTitle('');
    setNewDesc('');
    setNewDueDate('');
    setNewPoints(100);
    setShowCreateModal(false);
  };

  // Handler: Student Submit Assignment
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitAss || !submittedFileName.trim()) return;

    const newSubmission: StudentSubmission = {
      studentId: studentId,
      studentName: user?.name || user?.username || 'Student',
      rollNumber: user?.roll_number || '2373A01001',
      submittedFile: submittedFileName.trim(),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      comments: studentComments.trim(),
      status: 'Submitted'
    };

    setAssignments(prev => prev.map(ass => {
      if (ass.id === activeSubmitAss.id) {
        return {
          ...ass,
          submissions: {
            ...ass.submissions,
            [studentId]: newSubmission
          }
        };
      }
      return ass;
    }));

    setActiveSubmitAss(null);
    setSubmittedFileName('');
    setStudentComments('');
  };

  // Handler: Faculty Save Grade & Feedback
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGradingAss || !selectedStudentForGrading) return;

    setAssignments(prev => prev.map(ass => {
      if (ass.id === activeGradingAss.id) {
        const updatedSubmissions = { ...ass.submissions };
        const key = selectedStudentForGrading.studentId;
        if (updatedSubmissions[key]) {
          updatedSubmissions[key] = {
            ...updatedSubmissions[key],
            score: gradingScore,
            feedback: gradingFeedback.trim(),
            status: 'Graded'
          };
        }
        return { ...ass, submissions: updatedSubmissions };
      }
      return ass;
    }));

    setSelectedStudentForGrading(null);
    setGradingFeedback('');
  };

  // Filter logic
  const filteredAssignments = assignments.filter(ass => {
    // Dept filter using normalized department comparison
    if (selectedDept !== 'All') {
      const normAssDept = getNormalizedDepartment(ass.department);
      const normSelectedDept = getNormalizedDepartment(selectedDept);
      if (normAssDept !== normSelectedDept) return false;
    }
    // Sem filter
    if (selectedSem !== 'All' && ass.semester !== selectedSem) return false;
    // Subject filter
    if (selectedSubject !== 'All' && ass.subject !== selectedSubject) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = ass.title.toLowerCase().includes(q) ||
                    ass.description.toLowerCase().includes(q) ||
                    ass.subject.toLowerCase().includes(q) ||
                    ass.createdBy.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Status filter for students
    if (!isFacultyOrAdmin && selectedStatus !== 'All') {
      const studentSub = ass.submissions[studentId];
      const status = studentSub ? studentSub.status : 'Not Started';
      if (selectedStatus === 'Not Started' && studentSub) return false;
      if (selectedStatus === 'Submitted' && status !== 'Submitted') return false;
      if (selectedStatus === 'Graded' && status !== 'Graded') return false;
    }

    return true;
  });

  const getStudentStatus = (ass: Assignment) => {
    const sub = ass.submissions[studentId];
    if (!sub) return { label: 'Not Started', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    if (sub.status === 'Graded') return { label: `Graded (${sub.score}/${ass.points})`, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    return { label: 'Submitted', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            Academic Coursework & Assignments
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">
            {isFacultyOrAdmin 
              ? 'Publish course assignments to specific departments/semesters, inspect student submissions, and assign grades.'
              : `Viewing assignments for ${userDept} (${userSem}). Complete tasks and submit before due dates.`
            }
          </p>
        </div>

        {isFacultyOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </header>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search assignments or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 uppercase mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2 text-slate-700 focus:outline-none max-w-[150px] sm:max-w-none"
          >
            <option value="All">All Depts</option>
            {DEPARTMENTS_LIST.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Semesters</option>
            {SEMESTERS_LIST.map(s => (
              <option key={s} value={s}>Sem {s}</option>
            ))}
          </select>

          {!isFacultyOrAdmin && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2 text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Submitted">Submitted</option>
              <option value="Graded">Graded</option>
            </select>
          )}
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map(ass => {
            const studentSub = ass.submissions[studentId];
            const statusInfo = getStudentStatus(ass);
            const submissionCount = Object.keys(ass.submissions).length;

            return (
              <div
                key={ass.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      {ass.subject}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Sem {ass.semester}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {ass.department}
                    </span>
                  </div>

                  {/* Status / Submissions Badge */}
                  <div>
                    {isFacultyOrAdmin ? (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{submissionCount} {submissionCount === 1 ? 'Submission' : 'Submissions'}</span>
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">{ass.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
                    {ass.description}
                  </p>
                </div>

                {/* Faculty Info & Points */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                  <span className="font-semibold">Instructor: <strong className="text-slate-700">{ass.createdBy}</strong></span>
                  <span className="font-bold text-slate-700">Max Score: {ass.points} pts</span>
                </div>

                {/* Student Feedback (If Graded) */}
                {!isFacultyOrAdmin && studentSub?.status === 'Graded' && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-emerald-600" /> Instructor Grade:
                      </span>
                      <span className="text-sm font-extrabold text-emerald-900">{studentSub.score} / {ass.points}</span>
                    </div>
                    {studentSub.feedback && (
                      <p className="text-emerald-700 font-normal italic mt-1">"{studentSub.feedback}"</p>
                    )}
                  </div>
                )}

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Due Date: <strong className="text-slate-800">{ass.dueDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isFacultyOrAdmin ? (
                      <button
                        onClick={() => {
                          setActiveGradingAss(ass);
                          setSelectedStudentForGrading(null);
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Submissions & Grade
                      </button>
                    ) : (
                      <>
                        {studentSub ? (
                          <div className="text-xs text-slate-500 font-medium italic flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            Submitted: <span className="underline font-bold text-slate-700">{studentSub.submittedFile}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveSubmitAss(ass);
                              setSubmittedFileName('');
                              setStudentComments('');
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" /> Submit Assignment
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-dashed border-slate-200 p-12 text-center rounded-2xl">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold">No assignments found for the selected filters.</p>
          </div>
        )}
      </div>

      {/* 1. Faculty Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateAssignment} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Publish New Assignment</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Target Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {DEPARTMENTS_LIST.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Semester</label>
                <select
                  value={newSem}
                  onChange={(e) => setNewSem(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                >
                  {SEMESTERS_LIST.map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                >
                  {availableSubjectsForNew.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Lab Exercise 4: Neural Network Tuning"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Max Points</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={newPoints}
                  onChange={(e) => setNewPoints(parseInt(e.target.value) || 100)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Description & Instructions</label>
              <textarea
                rows={4}
                placeholder="Describe task requirements, deliverables, and format..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
              >
                Publish Assignment
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Student Submit Assignment Modal */}
      {activeSubmitAss && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleStudentSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Submit Assignment Response</h3>
              <button
                type="button"
                onClick={() => setActiveSubmitAss(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Coursework</p>
              <h4 className="font-bold text-slate-800 text-sm">{activeSubmitAss.title}</h4>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">{activeSubmitAss.subject} • Due {activeSubmitAss.dueDate}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Attach Solution File / Document</label>
              <input
                type="text"
                placeholder="e.g. lab3_dijkstra_solution.pdf"
                value={submittedFileName}
                onChange={(e) => setSubmittedFileName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Accepted formats: PDF, DOCX, ZIP, or Code File.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Student Remarks / Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Write any remarks or execution notes for the instructor..."
                value={studentComments}
                onChange={(e) => setStudentComments(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Final Submit
              </button>
              <button
                type="button"
                onClick={() => setActiveSubmitAss(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Faculty View Submissions & Grading Modal */}
      {activeGradingAss && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Submissions Inspector</h3>
                <p className="text-xs text-slate-500">{activeGradingAss.title} ({activeGradingAss.subject})</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveGradingAss(null);
                  setSelectedStudentForGrading(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Submissions */}
            <div className="space-y-3">
              {Object.keys(activeGradingAss.submissions).length > 0 ? (
                Object.values(activeGradingAss.submissions).map(sub => (
                  <div
                    key={sub.studentId}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h5 className="font-extrabold text-slate-800 text-sm">{sub.studentName}</h5>
                        <p className="text-[10px] text-slate-500">Roll No: <strong>{sub.rollNumber}</strong> • Submitted: {sub.submittedAt}</p>
                      </div>

                      <div>
                        {sub.status === 'Graded' ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                            Score: {sub.score} / {activeGradingAss.points}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">
                            Pending Grade
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-150">
                      File: <strong className="text-blue-600 underline">{sub.submittedFile}</strong>
                      {sub.comments && <p className="text-slate-500 mt-1 italic">Note: "{sub.comments}"</p>}
                    </div>

                    {sub.feedback && (
                      <div className="text-xs text-emerald-700 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 font-medium">
                        Feedback: "{sub.feedback}"
                      </div>
                    )}

                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentForGrading(sub);
                          setGradingScore(sub.score || activeGradingAss.points);
                          setGradingFeedback(sub.feedback || '');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" /> Grade / Update Feedback
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">No student submissions received yet for this task.</p>
                </div>
              )}
            </div>

            {/* Grade Form for Selected Student */}
            {selectedStudentForGrading && (
              <form onSubmit={handleSaveGrade} className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3 mt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-indigo-900 uppercase">
                    Grade {selectedStudentForGrading.studentName} ({selectedStudentForGrading.rollNumber})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentForGrading(null)}
                    className="text-indigo-400 hover:text-indigo-600 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">Marks Earned (Max: {activeGradingAss.points})</label>
                    <input
                      type="number"
                      min="0"
                      max={activeGradingAss.points}
                      value={gradingScore}
                      onChange={(e) => setGradingScore(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-1">Instructor Feedback</label>
                  <textarea
                    rows={2}
                    placeholder="Write constructive feedback for the student..."
                    value={gradingFeedback}
                    onChange={(e) => setGradingFeedback(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" /> Save Grade & Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
