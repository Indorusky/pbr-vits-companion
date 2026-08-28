import { useState, useEffect } from 'react';
import { Users, Upload, X, ChevronRight, Mail, GraduationCap, Percent, Check, AlertTriangle, FileSpreadsheet } from 'lucide-react';
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
  
  const [activeTab, setActiveTab] = useState<'marks' | 'attendance'>('attendance');
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<FacultyAttendanceRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubjectEdit, setSelectedSubjectEdit] = useState('');
  const [selectedCompEdit, setSelectedCompEdit] = useState('Midterm 1');
  const [editScore, setEditScore] = useState(0);
  
  // Filtering states for attendance tab
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students?faculty_username=${user?.username || ''}`);
      if (response.ok) {
        const data = await response.json();
        const studentAccounts = data.map((acc: any) => ({
          ...acc,
          attendance: acc.attendance,
          marks: acc.marks,
        }));
        setStudents(studentAccounts);
      }
    } catch (e) {
      console.warn("Backend fetch students failed, local storage fallback", e);
    }
  };

  const fetchAttendance = async () => {
    if (!user?.username) return;
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/faculty?faculty_username=${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
        // Autofill first available subject filter if empty
        if (data.length > 0 && !filterSubject) {
          setFilterSubject(data[0].subject);
        }
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
        // Refresh local list
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
    
    const subjectsList = Array.isArray(user?.subjects) ? user.subjects : (typeof user?.subjects === 'string' ? (user.subjects as string).split(', ') : []);
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

  // Filtered records
  const filteredRecords = attendanceRecords.filter(r => {
    const matchesSubj = !filterSubject || r.subject === filterSubject;
    const matchesDate = !filterDate || r.date === filterDate;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSubj && matchesDate && matchesStatus;
  });

  const totalStudents = students.length;
  const avgAttendance = totalStudents > 0 
    ? (students.reduce((sum, s) => sum + (s.attendance || 0), 0) / totalStudents).toFixed(1) 
    : '0';
  const atRiskStudents = students.filter(s => (s.attendance || 0) < 80).length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Faculty Portal
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage course attendance, correct biometric mismatches, and view student marks.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-sm font-extrabold px-6 border-b-2 transition-all ${activeTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Attendance Management
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`pb-3 text-sm font-extrabold px-6 border-b-2 transition-all ${activeTab === 'marks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Internal Marks
        </button>
      </div>

      {activeTab === 'marks' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Total Enrolled Students</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalStudents} Students</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Average Attendance</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{avgAttendance}%</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">Students Needing Attention</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{atRiskStudents} Students (&lt;80%)</h3>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-extrabold text-slate-800">Enrolled Student Roster {user?.department ? `(${user.department})` : ''}</h2>
              <span className="text-xs text-slate-400 font-bold">Total count: {students.length}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {students.map((st) => (
                <div 
                  key={st.username} 
                  onClick={() => openStudentDetail(st)}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    {st.profile_photo ? (
                      <img src={st.profile_photo} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0 border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {st.name?.charAt(0) || st.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{st.name || st.username}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Roll No: <strong className="text-slate-700">{st.roll_number || 'N/A'}</strong> • {st.department || 'N/A'} {st.year ? `• Year ${st.year}` : ''} • Attendance: {st.attendance}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-slate-400 font-bold">Internal Marks</p>
                      <p className="font-bold text-slate-900 text-sm">{st.marks}%</p>
                    </div>
                    <button
                      onClick={(e) => openEditModal(st, e)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Edit Score
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-bold">
                  No students found.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Attendance Management Tab */
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none"
              >
                <option value="">Select Course/Subject</option>
                {distinctSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-bold">Attendance Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-bold font-bold">Presence Quota</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <button
              onClick={() => { setFilterSubject(''); setFilterDate(new Date().toISOString().split('T')[0]); setFilterStatus('All'); }}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-extrabold text-slate-800">
                Attendance Log: {filterSubject || 'All Subjects'} ({filterDate})
              </h3>
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                {filteredRecords.length} records located
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-150">
                    <th className="p-4 font-bold">Student Name</th>
                    <th className="p-4 font-bold">Roll Number</th>
                    <th className="p-4 font-bold">Period</th>
                    <th className="p-4 font-bold">Timings</th>
                    <th className="p-4 font-bold">Verification Method</th>
                    <th className="p-4 font-bold">Confidence</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center">Toggle Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{rec.student_name}</td>
                      <td className="p-4 font-semibold">{rec.roll_number}</td>
                      <td className="p-4 font-bold">Period {rec.period}</td>
                      <td className="p-4 text-slate-500">{rec.start_time} - {rec.end_time}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          rec.verification_method === 'FACE_RECOGNITION' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : rec.verification_method === 'MANUAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-slate-50 text-slate-500 border border-slate-150'
                        }`}>
                          {rec.verification_method}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-600">{rec.confidence_score || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold text-[10px] ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleAttendanceStatus(rec.id, rec.status)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 hover:border-blue-200 transition-all"
                        >
                          Mark {rec.status === 'Present' ? 'Absent' : 'Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        No logs match the chosen filter configuration. Choose a correct subject/date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Marks Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => {if(e.target === e.currentTarget) { setShowEditModal(false); setSelectedStudent(null); }}}>
          <form onSubmit={handleUpdateMarks} className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Update Marks for {selectedStudent.name || selectedStudent.username}</h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
              <select
                value={selectedSubjectEdit}
                onChange={(e) => setSelectedSubjectEdit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Array.isArray(user?.subjects) ? user.subjects : (typeof user?.subjects === 'string' ? (user.subjects as string).split(', ') : [])).map((subj: string) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assessment Component</label>
              <select
                value={selectedCompEdit}
                onChange={(e) => setSelectedCompEdit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Midterm 1">Midterm 1 (Max 30)</option>
                <option value="Quiz 1">Quiz 1 (Max 10)</option>
                <option value="Assignments">Assignments (Max 20)</option>
                <option value="Final Exam">Final Exam (Max 40)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Marks Score</label>
              <input
                type="number"
                min="0"
                value={editScore}
                onChange={(e) => setEditScore(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">Save</button>
              <button type="button" onClick={() => { setShowEditModal(false); setSelectedStudent(null); }} className="px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Student Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => {if(e.target === e.currentTarget) { setShowDetailModal(false); setSelectedStudent(null); }}}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => { setShowDetailModal(false); setSelectedStudent(null); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              {selectedStudent.profile_photo ? (
                <img src={selectedStudent.profile_photo} alt="Profile" className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-200" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-sm">
                  {selectedStudent.name?.charAt(0) || selectedStudent.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedStudent.name || selectedStudent.username}</h3>
                <p className="text-sm font-medium text-blue-600">Username: {selectedStudent.username}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Email Address</p>
                  <p className="text-sm text-slate-900">{selectedStudent.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <GraduationCap className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Academic Info</p>
                  <p className="text-sm text-slate-900">
                    {selectedStudent.department || 'N/A Dept'} • Year {selectedStudent.year || 'N/A'} • Sem {selectedStudent.semester || 'N/A'}
                  </p>
                  {selectedStudent.roll_number && (
                    <p className="text-xs text-slate-700 mt-1 font-bold">Roll Number: {selectedStudent.roll_number}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-blue-600 font-semibold mb-1">Attendance</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedStudent.attendance}%</p>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs text-indigo-600 font-semibold mb-1">Internal Marks</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedStudent.marks}%</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => { setShowDetailModal(false); setSelectedStudent(null); }}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
