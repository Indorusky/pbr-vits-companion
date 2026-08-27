import { useState, useEffect } from 'react';
import { Users, Search, Edit2, CheckCircle2, AlertTriangle, Plus, X, Award } from 'lucide-react';
import { generateRollNumberLocal } from '../context/AuthContext';
import { API_BASE_URL } from '../config';


interface StudentRecord {
  id: string;
  name: string;
  roll: string;
  attendance: number;
  attendedClasses: number;
  totalClasses: number;
  marks: Record<string, number>;
  status: 'Good' | 'Warning';
  profilePhoto?: string;
}

const DEFAULT_ROSTER: StudentRecord[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    roll: '2373A01001',
    attendance: 87.5,
    attendedClasses: 35,
    totalClasses: 40,
    marks: { 'Math': 90, 'Physics': 85, 'CS': 95 },
    status: 'Good'
  },
  {
    id: '2',
    name: 'Beatrix Kiddo',
    roll: '2373A01002',
    attendance: 79.5,
    attendedClasses: 31,
    totalClasses: 39,
    marks: { 'Math': 72, 'Physics': 68, 'CS': 80 },
    status: 'Warning'
  },
  {
    id: '3',
    name: 'Charles Xavier',
    roll: '2373A01003',
    attendance: 94.0,
    attendedClasses: 47,
    totalClasses: 50,
    marks: { 'Math': 95, 'Physics': 96, 'CS': 98 },
    status: 'Good'
  }
];

const ManageStudents = () => {
  const [roster, setRoster] = useState<StudentRecord[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);

  // Edit fields
  const [attendedVal, setAttendedVal] = useState<number>(0);
  const [totalVal, setTotalVal] = useState<number>(0);
  const [mathVal, setMathVal] = useState<number>(0);
  const [physicsVal, setPhysicsVal] = useState<number>(0);
  const [csVal, setCsVal] = useState<number>(0);

  // Add student fields
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('Computer Science and Engineering (CSE)');
  const [newYear, setNewYear] = useState('3rd Year');

  const fetchRoster = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      if (response.ok) {
        const data = await response.json();
        const mapped: StudentRecord[] = data.map((st: any) => ({
          id: String(st.id),
          name: st.name || st.username,
          roll: st.roll_number || `ROLL-${st.id}`,
          attendance: st.attendance || 85,
          attendedClasses: 35,
          totalClasses: 40,
          marks: { 'Math': st.marks || 90, 'Physics': 85, 'CS': 95 },
          status: (st.attendance || 85.5) < 75 ? 'Warning' : 'Good',
          profilePhoto: st.profile_photo
        }));
        setRoster(mapped);
        return;
      }
    } catch (e) {
      console.warn("Backend fetch roster failed, local storage fallback", e);
    }
    const saved = localStorage.getItem('campus_ai_roster');
    if (saved !== null) {
      setRoster(JSON.parse(saved));
    } else {
      setRoster(DEFAULT_ROSTER);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  useEffect(() => {
    localStorage.setItem('campus_ai_roster', JSON.stringify(roster));
  }, [roster]);

  const handleEditClick = (student: StudentRecord) => {
    setEditingStudent(student);
    setAttendedVal(student.attendedClasses);
    setTotalVal(student.totalClasses);
    setMathVal(student.marks['Math'] || 0);
    setPhysicsVal(student.marks['Physics'] || 0);
    setCsVal(student.marks['CS'] || 0);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const newAttendancePct = totalVal > 0 ? parseFloat(((attendedVal / totalVal) * 100).toFixed(1)) : 0;
    const newStatus = newAttendancePct < 75 ? 'Warning' : 'Good';

    setRoster(prev =>
      prev.map(st =>
        st.id === editingStudent.id
          ? {
              ...st,
              attendedClasses: attendedVal,
              totalClasses: totalVal,
              attendance: newAttendancePct,
              status: newStatus,
              marks: {
                'Math': mathVal,
                'Physics': physicsVal,
                'CS': csVal
              }
            }
          : st
      )
    );
    setEditingStudent(null);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let currentAccounts = [];
    try {
      const saved = localStorage.getItem('campus_ai_accounts');
      if (saved) currentAccounts = JSON.parse(saved);
    } catch {}

    const rollToUse = generateRollNumberLocal(currentAccounts, newDept, newYear);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 100),
          password: 'student123',
          role: 'student',
          name: newName.trim(),
          email: `${newName.toLowerCase().replace(/\s+/g, '')}@campus.edu`,
          department: newDept,
          year: newYear,
          semester: '1-1',
          roll_number: '' // backend will generate it
        }),
      });

      if (response.ok) {
        fetchRoster();
        setNewName('');
        setShowAddModal(false);
        return;
      }
    } catch (e) {
      console.warn("Backend add student failed, local simulation only", e);
    }

    const newSt: StudentRecord = {
      id: Date.now().toString(),
      name: newName.trim(),
      roll: rollToUse,
      attendance: 100,
      attendedClasses: 10,
      totalClasses: 10,
      marks: { 'Math': 85, 'Physics': 85, 'CS': 85 },
      status: 'Good'
    };

    setRoster([...roster, newSt]);
    setNewName('');
    setShowAddModal(false);
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      const stToDelete = roster.find(st => st.id === id || st.roll === id);
      const nextRoster = roster.filter(st => st.id !== id && st.roll !== id);
      setRoster(nextRoster);
      localStorage.setItem('campus_ai_roster', JSON.stringify(nextRoster));

      // Also clean from user accounts cache
      const savedAccounts = localStorage.getItem('campus_ai_accounts');
      if (savedAccounts) {
        try {
          const parsed = JSON.parse(savedAccounts);
          const filtered = parsed.filter((acc: any) => acc.roll_number !== id && acc.username !== id && acc.roll_number !== stToDelete?.roll);
          localStorage.setItem('campus_ai_accounts', JSON.stringify(filtered));
        } catch { /* ignore */ }
      }

      try {
        await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' });
        if (stToDelete?.roll) {
          await fetch(`${API_BASE_URL}/users/${stToDelete.roll}`, { method: 'DELETE' });
        }
      } catch (e) {
        console.warn("Backend delete student failed", e);
      }
    }
  };

  const filtered = roster.filter(st =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Class Student Roster Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Review grade reports, presence ratios, and update scores.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student Profile</span>
        </button>
      </header>

      {/* Roster Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <span className="text-xs text-slate-400 font-bold uppercase">
          Total Students Active: {filtered.length}
        </span>
      </div>

      {/* Grid listing */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filtered.length > 0 ? (
          filtered.map(st => {
            const hasShortage = st.attendance < 75;
            return (
              <div
                key={st.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {st.profilePhoto ? (
                    <img src={st.profilePhoto} alt="Profile" className="w-11 h-11 rounded-2xl object-cover shadow-sm shrink-0 border border-slate-200" />
                  ) : (
                    <div className="w-11 h-11 bg-blue-100 text-blue-700 font-bold rounded-2xl flex items-center justify-center text-sm shadow-sm shrink-0">
                      {st.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{st.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Roll No: {st.roll} • Attendance: <strong className={hasShortage ? 'text-amber-600' : 'text-slate-800'}>{st.attendance}%</strong> ({st.attendedClasses}/{st.totalClasses})
                    </p>
                  </div>
                </div>

                {/* Course Marks */}
                <div className="flex flex-wrap items-center gap-3">
                  {Object.entries(st.marks).map(([subject, score]) => (
                    <span key={subject} className="bg-slate-100 border border-slate-150 text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <span>{subject}:</span>
                      <strong className="text-slate-800">{score}%</strong>
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(st)}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Record
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(st.id)}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 text-xs font-bold rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-slate-500 font-bold">
            No students found matching your search.
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Student Record</h3>
                <p className="text-xs text-slate-400 font-semibold">{editingStudent.name} ({editingStudent.roll})</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Attended Classes</label>
                <input
                  type="number"
                  value={attendedVal}
                  onChange={(e) => setAttendedVal(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Total Classes</label>
                <input
                  type="number"
                  value={totalVal}
                  onChange={(e) => setTotalVal(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Internal Scores (%)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Math</label>
                  <input
                    type="number"
                    max={100}
                    value={mathVal}
                    onChange={(e) => setMathVal(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Physics</label>
                  <input
                    type="number"
                    max={100}
                    value={physicsVal}
                    onChange={(e) => setPhysicsVal(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">CS</label>
                  <input
                    type="number"
                    max={100}
                    value={csVal}
                    onChange={(e) => setCsVal(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Save Details
              </button>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddStudent} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Student Profile</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Student Full Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Department</label>
              <select
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                {(() => {
                  try {
                    const saved = localStorage.getItem('campus_ai_departments');
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      if (parsed.length >= 6) {
                        return parsed.map((d: any) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ));
                      }
                    }
                  } catch {}
                  const fallbackDepts = [
                    'Computer Science and Engineering (CSE)',
                    'Electrical and Electronics Engineering (EEE)',
                    'CSE AI',
                    'CSE AIML',
                    'Electronics and Communication Engineering (ECE)',
                    'Civil Engineering',
                    'Mechanical Engineering'
                  ];
                  return fallbackDepts.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Year</label>
              <select
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Roll Number</label>
              <input
                type="text"
                value="Auto-Generated on Save"
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Create Profile
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
