import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Building, Activity, BookOpen, ChevronRight, Clock, Trash2, Camera, Search, Filter, CheckCircle, XCircle, Loader2, Video } from 'lucide-react';
import { loadFaceApiModels, getFaceEmbedding } from '../utils/faceRecognition';
import { API_BASE_URL } from '../config';



interface DeptData {
  id: string;
  name: string;
  code: string;
}

interface SubjectData {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  year: string;
  semester: string;
}

interface StudentStatus {
  student_id: number;
  username?: string;
  name: string;
  roll_number: string;
  semester: string;
  department: string;
  face_registered: boolean;
  profile_photo?: string;
}

interface AttendanceRecord {
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

interface FaceAuditLog {
  id: number;
  student_name: string;
  roll_number: string;
  action: string;
  performed_by: string;
  timestamp: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'infra' | 'attendance' | 'biometrics' | 'config'>('attendance');
  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);
  const [departments, setDepartments] = useState<DeptData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);

  // Attendance Analytics & Biometrics State
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [studentsStatus, setStudentsStatus] = useState<StudentStatus[]>([]);
  const [auditLogs, setAuditLogs] = useState<FaceAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Config States
  const [windowStart, setWindowStart] = useState('08:00');
  const [windowEnd, setWindowEnd] = useState('10:00');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Admin Webcam Scanner (for manual re-registration)
  const [showScanner, setShowScanner] = useState(false);
  const [scanningStudent, setScanningStudent] = useState<StudentStatus | null>(null);
  const [scannerStep, setScannerStep] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [scannedSamples, setScannedSamples] = useState<string[]>([]);
  const [scanPrompt, setScanPrompt] = useState('');
  const [isModelsLoading, setIsModelsLoading] = useState(false);


  const fetchInfra = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        setStudentCount(data.filter((a: any) => a.role === 'student').length);
        setFacultyCount(data.filter((a: any) => a.role === 'faculty').length);
      }
    } catch (e) {
      console.warn(e);
    }

    try {
      setDepartments(JSON.parse(localStorage.getItem('campus_ai_departments') || '[]'));
      setSubjects(JSON.parse(localStorage.getItem('campus_ai_subjects') || '[]'));
    } catch { /* ignore */ }
  };

  const fetchAttendanceAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/attendance/admin`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
        setStudentsStatus(data.students);
        setAuditLogs(data.audit_logs);
      }
    } catch (e) {
      console.warn("Failed to fetch admin attendance logs", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system-config`);
      if (res.ok) {
        const data = await res.json();
        setWindowStart(data.attendance_window_start);
        setWindowEnd(data.attendance_window_end);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    fetchInfra();
    fetchAttendanceAnalytics();
    fetchConfigs();
  }, []);

  const handleSaveConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/system-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendance_window_start: windowStart,
          attendance_window_end: windowEnd
        })
      });
      if (res.ok) {
        alert("Morning attendance window updated successfully!");
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleResetAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/reset`, { method: 'POST' });
      if (res.ok) {
        alert("Attendance records & face enrollments successfully reset.");
        setShowResetConfirm(false);
        fetchAttendanceAnalytics();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleAttendance = async (recordId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: nextStatus, verification_method: 'MANUAL' } : r));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const generateFaceEmbedding = (userNm: string) => {
    const embedding = [];
    let hash = 0;
    for (let i = 0; i < userNm.length; i++) {
      hash = userNm.charCodeAt(i) + ((hash << 5) - hash);
    }
    for (let i = 0; i < 128; i++) {
      const seed = Math.sin(hash + i) * 10000;
      embedding.push(parseFloat((seed - Math.floor(seed)).toFixed(6)));
    }
    return JSON.stringify(embedding);
  };

  const handlePromoteStudent = async (username?: string) => {
    if (!username) return;
    if (!window.confirm(`Are you sure you want to promote student '${username}' to the next semester?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/students/${username}/promote`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchInfra();
        fetchAttendanceAnalytics();
      } else {
        const err = await res.json();
        alert(`Error: ${err.detail || 'Promotion failed'}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startAdminScan = async (stud: StudentStatus) => {
    setIsModelsLoading(true);
    setScanPrompt('Loading Face AI Models...');
    setShowScanner(true);
    try {
      await loadFaceApiModels();
    } catch (err) {
      alert('Failed to load Face Recognition AI models.');
      setIsModelsLoading(false);
      setShowScanner(false);
      return;
    }
    setIsModelsLoading(false);

    setScanningStudent(stud);
    setScannerStep('scanning');
    setScannedSamples([]);
    setScanPrompt('Align student face inside frame...');

    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      .then(mediaStream => {
        (window as any).adminScanStream = mediaStream;
        setTimeout(() => {
          const videoEl = document.getElementById('admin-video') as HTMLVideoElement;
          if (videoEl) {
            videoEl.srcObject = mediaStream;
            videoEl.play().catch(e => console.warn(e));

            const descriptors: Float32Array[] = [];
            const interval = setInterval(async () => {
              if (!videoEl || videoEl.paused || videoEl.ended) return;

              setScanPrompt(
                descriptors.length === 0 ? 'Position face inside guide (Sample 1/3)...' :
                descriptors.length === 1 ? 'Blink eyes to verify (Sample 2/3)...' :
                'Turn head slightly left (Sample 3/3)...'
              );

              try {
                const descriptor = await getFaceEmbedding(videoEl);
                if (descriptor) {
                  descriptors.push(descriptor);
                  setScannedSamples(prev => [...prev, `sample${descriptors.length}`]);

                  if (descriptors.length >= 3) {
                    clearInterval(interval);
                    
                    if ((window as any).adminScanStream) {
                      (window as any).adminScanStream.getTracks().forEach((t: any) => t.stop());
                      (window as any).adminScanStream = null;
                    }
                    
                    setScannerStep('success');
                    
                    // Average the 128-dimensional face embeddings for pinpoint accuracy
                    const avgDescriptor = new Float32Array(128);
                    for (let i = 0; i < 128; i++) {
                      let sum = 0;
                      for (let j = 0; j < descriptors.length; j++) {
                        sum += descriptors[j][i];
                      }
                      avgDescriptor[i] = sum / descriptors.length;
                    }

                    const embedding = JSON.stringify(Array.from(avgDescriptor));
                    
                    fetch(`${API_BASE_URL}/register-face`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        student_id: stud.student_id,
                        embedding: embedding
                      })
                    }).then(res => {
                      if (res.ok) {
                        fetchAttendanceAnalytics();
                      }
                    });
                  }
                }
              } catch (e) {
                console.error(e);
              }
            }, 800);

            (window as any).adminScanInterval = interval;
          }
        }, 300);
      }).catch(e => {
        console.error(e);
        alert("Camera access failed. Please ensure webcam permissions are allowed.");
      });
  };

  const getSubjectCount = (deptId: string) => subjects.filter(s => s.departmentId === deptId).length;

  // Filtered Records
  const filteredRecords = records.filter(r => {
    const matchesSearch = !searchQuery || r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || r.roll_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSem = !filterSemester || r.semester === filterSemester;
    const matchesSubj = !filterSubject || r.subject === filterSubject;
    const matchesDate = !filterDate || r.date === filterDate;
    return matchesSearch && matchesSem && matchesSubj && matchesDate;
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600 animate-pulse" />
            Admin Overview
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Biometrics monitoring, morning window configs, and global logs manual override panels.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-sm font-extrabold px-5 border-b-2 transition-all ${activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          College Logs Log
        </button>
        <button
          onClick={() => setActiveTab('biometrics')}
          className={`pb-3 text-sm font-extrabold px-5 border-b-2 transition-all ${activeTab === 'biometrics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Biometric Enrollments
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 text-sm font-extrabold px-5 border-b-2 transition-all ${activeTab === 'config' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Attendance Configuration
        </button>
        <button
          onClick={() => setActiveTab('infra')}
          className={`pb-3 text-sm font-extrabold px-5 border-b-2 transition-all ${activeTab === 'infra' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Infrastructure Stats
        </button>
      </div>

      {activeTab === 'infra' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div onClick={() => navigate('/manage-users')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">Total Enrolled</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{studentCount} Students</h3>
            </div>
            <div onClick={() => navigate('/manage-departments')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform">
                <Building className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">Active Departments</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{departments.length} Departments</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl w-fit mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">System Health</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">99.9% Uptime</h3>
            </div>
            <div onClick={() => navigate('/manage-users')} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-500">Faculty Members</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{facultyCount} Faculty</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Department Performance Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div key={dept.id} onClick={() => navigate('/manage-departments')} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800">{dept.name}</h4>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">{getSubjectCount(dept.id)} subjects assigned</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Configure morning window */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Attendance Timing configuration
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Morning Window Start</label>
                <input
                  type="time"
                  value={windowStart}
                  onChange={(e) => setWindowStart(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Morning Window End</label>
                <input
                  type="time"
                  value={windowEnd}
                  onChange={(e) => setWindowEnd(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleSaveConfig}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Save timings
            </button>
          </div>

          {/* Reset Attendance */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-850 text-sm flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                Emergency Attendance Clear / Reset
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Clears all logged attendance logs, preset overrides, and student face enrollments from the database. Student logins, timetables, and subjects remain intact.
              </p>
            </div>
            {showResetConfirm ? (
              <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl space-y-3 mt-4">
                <p className="text-xs text-rose-900 font-extrabold">⚠️ Are you absolutely sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleResetAttendance}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-fit px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl transition-all"
              >
                Trigger System Reset
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'biometrics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-800">Student Biometrics Enrollments Status</h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
                Total Students: {studentsStatus.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-150">
                    <th className="p-4 font-bold">Student Name</th>
                    <th className="p-4 font-bold">Roll Number</th>
                    <th className="p-4 font-bold">Semester / Branch</th>
                    <th className="p-4 font-bold">Face Status</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {studentsStatus.map(s => (
                    <tr key={s.student_id}>
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        {s.profile_photo ? (
                          <img src={s.profile_photo} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-650 flex items-center justify-center font-bold text-xs">
                            {s.name?.charAt(0) || 'S'}
                          </div>
                        )}
                        <span>{s.name}</span>
                      </td>
                      <td className="p-4 font-semibold">{s.roll_number}</td>
                      <td className="p-4">{s.semester} • {s.department}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold text-[10px] ${
                          s.face_registered 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {s.face_registered ? 'Registered' : 'Requires Registration'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startAdminScan(s)}
                            className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 text-[10px] font-extrabold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            {s.face_registered ? 'Re-register Face' : 'Register Face'}
                          </button>
                          <button
                            onClick={() => handlePromoteStudent(s.username)}
                            disabled={s.semester === 'Graduate'}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-[10px] font-extrabold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            Promote
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-extrabold text-slate-800 mb-4">Biometric Face Audit Logs</h3>
            <div className="space-y-3">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs flex justify-between items-center font-semibold">
                  <div>
                    <span className="text-slate-400 mr-2">{new Date(log.timestamp).toLocaleString()}</span>
                    <strong className="text-slate-800">{log.student_name} ({log.roll_number})</strong>
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md ml-2 text-[10px] uppercase font-bold">{log.action}</span>
                  </div>
                  <span className="text-slate-500 font-medium">By: {log.performed_by}</span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-center font-bold text-slate-450 py-6">No audits reported.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Search Student</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Semester</label>
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none"
              >
                <option value="">All Semesters</option>
                {['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Global Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-800">Global Attendance Logs ({filterDate})</h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold">
                {filteredRecords.length} records matching
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-150">
                    <th className="p-4 font-bold">Student</th>
                    <th className="p-4 font-bold">Roll Number</th>
                    <th className="p-4 font-bold">Subject</th>
                    <th className="p-4 font-bold">Period</th>
                    <th className="p-4 font-bold">Method</th>
                    <th className="p-4 font-bold">Confidence</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{rec.student_name}</td>
                      <td className="p-4 font-semibold">{rec.roll_number}</td>
                      <td className="p-4 font-semibold">{rec.subject}</td>
                      <td className="p-4 font-bold">Period {rec.period}</td>
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
                      <td className="p-4 font-bold">{rec.confidence_score || 'N/A'}</td>
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
                          onClick={() => toggleAttendance(rec.id, rec.status)}
                          className="px-2.5 py-1 bg-slate-150 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 hover:border-indigo-200 text-[10px] font-bold rounded-lg transition-all"
                        >
                          Mark {rec.status === 'Present' ? 'Absent' : 'Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        No logs match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin Scanner Modal */}
      {showScanner && scanningStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-150 w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 text-white flex items-center gap-2">
              <Camera className="w-5 h-5 animate-pulse" />
              <h3 className="font-extrabold text-sm">Webcam Registration: {scanningStudent.name}</h3>
            </div>
            <div className="p-6 text-center space-y-6">
              {scannerStep === 'scanning' && (
                <div className="space-y-4">
                  <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden bg-slate-900 border-4 border-slate-150 shadow-inner flex items-center justify-center">
                    <video id="admin-video" className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" muted playsInline />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-2 pointer-events-none">
                      <Video className="w-8 h-8 animate-bounce text-indigo-500" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Camera Feed Initializing...</span>
                    </div>

                    <div className="absolute inset-0 border-[16px] border-slate-900/50 flex items-center justify-center pointer-events-none">
                      <div className={`w-40 h-48 rounded-full border-4 ${scannedSamples.length > 0 ? 'border-emerald-500 animate-pulse' : 'border-indigo-500'} flex items-center justify-center relative`}>
                        <div className="absolute top-0 bottom-0 left-0 right-0 rounded-full border border-dashed border-white/55 animate-spin" style={{ animationDuration: '8s' }} />
                      </div>
                    </div>
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80 animate-pulse" style={{ top: '50%' }} />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800 bg-indigo-50 border border-indigo-100 py-1.5 px-3 rounded-xl inline-block">
                      {scanPrompt}
                    </p>
                    <div className="flex justify-center gap-3">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${scannedSamples.length >= num ? 'bg-emerald-500 scale-110' : 'bg-slate-200'}`} />
                          <span className="text-[10px] font-bold text-slate-400">Sample {num}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {scannerStep === 'success' && (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm font-extrabold">Biometrics Overwritten!</h4>
                    <p className="text-xs text-slate-400 mt-1">Student's face template updated successfully in database.</p>
                  </div>
                  <button
                    onClick={() => setShowScanner(false)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
