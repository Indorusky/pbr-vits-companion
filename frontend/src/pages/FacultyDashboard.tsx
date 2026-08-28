import { useState, useEffect } from 'react';
import { 
  Users, 
  Upload, 
  X, 
  ChevronRight, 
  GraduationCap, 
  Percent, 
  Check, 
  AlertTriangle, 
  Search, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  BookOpen,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

interface StudentAccount {
  id: number;
  username: string;
  name: string;
  email: string;
  department?: string;
  year?: string;
  semester?: string;
  role: string;
  roll_number?: string;
  attendance?: number;
  marks?: number;
  profile_photo?: string;
}

interface FacultyAttendanceRecord {
  id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  semester: string;
  subject: string;
  date: string;
  period: number;
  start_time: string;
  end_time: string;
  status: string;
  verification_method: string;
  confidence_score: string | null;
}

const FacultyDashboard = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks'>('attendance');
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<FacultyAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Student list filters
  const [studentSearch, setStudentSearch] = useState('');
  const [rosterDept, setRosterDept] = useState('ALL');
  const [rosterSem, setRosterSem] = useState('ALL');

  // Attendance management filters
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState(''); // Default to All Dates so logs are never hidden
  const [filterStatus, setFilterStatus] = useState('All');
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubjectEdit, setSelectedSubjectEdit] = useState('');
  const [selectedCompEdit, setSelectedCompEdit] = useState('Midterm 1');
  const [editScore, setEditScore] = useState(0);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/students?faculty_username=${user?.username || ''}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (e) {
      console.warn("Backend fetch students failed", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (!user?.username) return;
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/faculty?faculty_username=${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      }
    } catch (e) {
      console.warn("Failed to fetch faculty attendance", e);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAttendance();
  }, [user]);

  const handleUpdateMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubjectEdit) return;
    
    const maxScores: Record<string, number> = { "Midterm 1": 30, "Quiz 1": 10, "Assignments": 20, "Final Exam": 40 };
    const limit = maxScores[selectedCompEdit] || 100;
    if (editScore > limit) {
      alert(`Error: Maximum marks for ${selectedCompEdit} is ${limit}`);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/marks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-username': user?.username || '',
          'x-requester-role': user?.role || 'faculty'
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          subject: selectedSubjectEdit,
          semester: selectedStudent.semester || '1-1',
          assessment_type: selectedCompEdit,
          marks: editScore
        })
      });
      if (res.ok) {
        alert("Marks updated successfully!");
        setShowEditModal(false);
        setSelectedStudent(null);
        fetchStudents();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'Failed to update marks'}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAttendanceStatus = async (recordId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setAttendanceRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: nextStatus, verification_method: 'MANUAL' } : r));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const openStudentDetail = (st: StudentAccount) => {
    setSelectedStudent(st);
    setShowDetailModal(true);
  };

  const openEditModal = (st: StudentAccount, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(st);
    
    const subjectsList = Array.isArray(user?.subjects) 
      ? user.subjects 
      : (typeof user?.subjects === 'string' ? (user.subjects as string).split(',').map(s => s.trim()) : []);
    setSelectedSubjectEdit(subjectsList[0] || '');
    setSelectedCompEdit('Midterm 1');
    setEditScore(0);
    
    setShowEditModal(true);
  };

  // Get distinct subjects from faculty assigned subjects and recorded logs
  const facultyAssignedSubjects = Array.isArray(user?.subjects) 
    ? user.subjects 
    : (typeof user?.subjects === 'string' ? (user.subjects as string).split(',').map(s => s.trim()).filter(Boolean) : []);

  const distinctSubjects = Array.from(new Set([
    ...facultyAssignedSubjects,
    ...attendanceRecords.map(r => r.subject)
  ])).filter(Boolean);

  // Filtered attendance records
  const filteredRecords = attendanceRecords.filter(r => {
    const matchesSubj = !filterSubject || r.subject === filterSubject;
    const matchesDate = !filterDate || r.date === filterDate;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesSearch = !attendanceSearch || 
      (r.student_name || '').toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      (r.roll_number || '').toLowerCase().includes(attendanceSearch.toLowerCase());
    return matchesSubj && matchesDate && matchesStatus && matchesSearch;
  });

  // Filtered student roster
  const filteredStudents = students.filter(s => {
    const matchesSearch = !studentSearch || 
      (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.roll_number || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.username || '').toLowerCase().includes(studentSearch.toLowerCase());
    const matchesDept = rosterDept === 'ALL' || (s.department || '').toLowerCase().includes(rosterDept.toLowerCase());
    const matchesSem = rosterSem === 'ALL' || s.semester === rosterSem;
    return matchesSearch && matchesDept && matchesSem;
  });

  const totalStudents = students.length;
  const avgAttendance = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + (s.attendance || 0), 0) / totalStudents).toFixed(1) 
    : '0';
  const atRiskStudents = students.filter(s => (s.attendance || 0) < 75).length;
  const todayRecordsCount = attendanceRecords.filter(r => r.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen pb-28">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">Faculty Management Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            {user?.name || user?.username || 'Faculty Console'}
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Department of {user?.department || 'Computer Science & Engineering'} • Live FRS & Academic Administration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchStudents(); fetchAttendance(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Students</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{totalStudents}</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Enrolled across sections</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Avg Attendance</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{avgAttendance}%</h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Institute benchmark: 75%</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">At-Risk (&lt;75%)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-600">{atRiskStudents}</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Requires attendance alert</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Today's FRS Logs</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-indigo-700">{todayRecordsCount}</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Biometric logs verified</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex gap-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Attendance Management & Verification Logs ({attendanceRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'marks'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Student Roster & Internal Marks ({students.length})
        </button>
      </div>

      {/* 1. Attendance Management Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Subject Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject</label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Subjects ({distinctSubjects.length})</option>
                  {distinctSubjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Attendance Date Filter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Date</label>
                  <button 
                    onClick={() => setFilterDate(filterDate ? '' : new Date().toISOString().split('T')[0])}
                    className="text-[10px] text-blue-600 font-bold hover:underline"
                  >
                    {filterDate ? 'Show All Dates' : 'Show Today'}
                  </button>
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              {/* Search by student name/roll */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Search Student</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name or roll number..."
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Summary & Reset */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                Showing <b>{filteredRecords.length}</b> records {filterDate ? `for ${filterDate}` : '(All recorded dates)'} {filterSubject ? `• ${filterSubject}` : ''}
              </span>
              <button
                onClick={() => { setFilterSubject(''); setFilterDate(''); setFilterStatus('All'); setAttendanceSearch(''); }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="p-3.5 font-bold">Student Name</th>
                    <th className="p-3.5 font-bold">Roll Number</th>
                    <th className="p-3.5 font-bold">Subject</th>
                    <th className="p-3.5 font-bold">Period & Time</th>
                    <th className="p-3.5 font-bold">Date</th>
                    <th className="p-3.5 font-bold">Method</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{rec.student_name}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-600">{rec.roll_number}</td>
                      <td className="p-3.5 font-semibold text-slate-800 max-w-[160px] truncate">{rec.subject}</td>
                      <td className="p-3.5 text-slate-500">
                        <span className="font-bold text-slate-800">P{rec.period}</span> ({rec.start_time}-{rec.end_time})
                      </td>
                      <td className="p-3.5 font-medium text-slate-500">{rec.date}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          rec.verification_method === 'FACE_RECOGNITION' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : rec.verification_method === 'MANUAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}>
                          {rec.verification_method}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] inline-flex items-center gap-1 ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {rec.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => toggleAttendanceStatus(rec.id, rec.status)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200 hover:border-blue-300 transition-all"
                        >
                          Mark {rec.status === 'Present' ? 'Absent' : 'Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 font-bold space-y-2">
                        <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                        <p>No attendance logs match the current filter selection.</p>
                        <button
                          onClick={() => { setFilterSubject(''); setFilterDate(''); setFilterStatus('All'); setAttendanceSearch(''); }}
                          className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100"
                        >
                          Show All Historical Records
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Student Roster & Internal Marks Tab */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          {/* Roster Filters */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search students by name, roll number, or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={rosterSem}
                onChange={(e) => setRosterSem(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Semesters</option>
                <option value="1-1">Sem 1-1</option>
                <option value="1-2">Sem 1-2</option>
                <option value="2-1">Sem 2-1</option>
                <option value="2-2">Sem 2-2</option>
                <option value="3-1">Sem 3-1</option>
                <option value="3-2">Sem 3-2</option>
                <option value="4-1">Sem 4-1</option>
                <option value="4-2">Sem 4-2</option>
              </select>
            </div>
          </div>

          {/* Student Roster Cards */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredStudents.map((st) => (
              <div 
                key={st.username} 
                onClick={() => openStudentDetail(st)}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  {st.profile_photo ? (
                    <img src={st.profile_photo} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0 border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {st.name?.charAt(0) || st.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{st.name || st.username}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Roll No: <strong className="text-slate-800">{st.roll_number || '2373A01001'}</strong> • {st.department || 'CSE'} • Sem {st.semester || '4-1'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      (st.attendance || 0) >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {st.attendance || 75}% Attendance
                    </span>
                  </div>
                  <button
                    onClick={(e) => openEditModal(st, e)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Edit Score
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-bold">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>No students match the search criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Marks Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => {if(e.target === e.currentTarget) { setShowEditModal(false); setSelectedStudent(null); }}}>
          <form onSubmit={handleUpdateMarks} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">Update Marks for {selectedStudent.name || selectedStudent.username}</h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <select
                value={selectedSubjectEdit}
                onChange={(e) => setSelectedSubjectEdit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {distinctSubjects.map((subj: string) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assessment Component</label>
              <select
                value={selectedCompEdit}
                onChange={(e) => setSelectedCompEdit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Midterm 1">Midterm 1 (Max 30)</option>
                <option value="Quiz 1">Quiz 1 (Max 10)</option>
                <option value="Assignments">Assignments (Max 20)</option>
                <option value="Final Exam">Final Exam (Max 40)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Awarded Marks</label>
              <input
                type="number"
                min="0"
                max="100"
                value={editScore}
                onChange={(e) => setEditScore(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setSelectedStudent(null); }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Save Score
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => {if(e.target === e.currentTarget) { setShowDetailModal(false); setSelectedStudent(null); }}}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {selectedStudent.profile_photo ? (
                  <img src={selectedStudent.profile_photo} alt="Profile" className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                    {selectedStudent.name?.charAt(0) || selectedStudent.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedStudent.name || selectedStudent.username}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{selectedStudent.roll_number || '2373A01001'}</p>
                </div>
              </div>
              <button onClick={() => { setShowDetailModal(false); setSelectedStudent(null); }} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 font-bold block">Department</span>
                <span className="font-extrabold text-slate-800">{selectedStudent.department || 'CSE'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Semester</span>
                <span className="font-extrabold text-slate-800">{selectedStudent.semester || '4-1'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Attendance</span>
                <span className="font-extrabold text-emerald-600">{selectedStudent.attendance || 75}%</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Internal Marks</span>
                <span className="font-extrabold text-blue-600">{selectedStudent.marks || 75}%</span>
              </div>
            </div>

            <button
              onClick={() => { setShowDetailModal(false); setSelectedStudent(null); }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
