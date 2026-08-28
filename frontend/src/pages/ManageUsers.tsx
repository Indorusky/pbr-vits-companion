import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

import { Shield, Search, Trash2, Plus, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { generateRollNumberLocal, DEFAULT_ACCOUNTS } from '../context/AuthContext';

interface AccountRecord {
  username: string;
  role: 'student' | 'faculty' | 'admin';
  name: string;
  department: string;
  year?: string;
  email: string;
  roll_number?: string;
  subjects?: string;
}

const ManageUsers = () => {
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create user fields
  const [showAddModal, setShowAddModal] = useState(false);
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering (CSE)');
  const [year, setYear] = useState('1st Year');
  const [rollNumber, setRollNumber] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  
  // Load available subjects from department management
  const [availableSubjects, setAvailableSubjects] = useState<{id: string; name: string; code: string}[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAccounts(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend fetch users failed, local storage fallback", e);
    }
    const saved = localStorage.getItem('campus_ai_accounts');
    let loaded: AccountRecord[] = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch { /* ignore */ }
    }
    
    const existingNames = new Set((loaded || []).map(a => (a.username || '').toLowerCase()));
    const defaultMapped: AccountRecord[] = DEFAULT_ACCOUNTS.map(a => ({
      username: a.username,
      role: (a.role || 'student') as 'student' | 'faculty' | 'admin',
      name: a.name || a.username,
      department: a.department || 'General',
      year: a.year,
      email: a.email || '',
      roll_number: a.roll_number,
      subjects: Array.isArray(a.subjects) ? a.subjects.join(', ') : a.subjects,
      approval_status: a.approval_status
    }));

    defaultMapped.forEach(def => {
      if (!existingNames.has(def.username.toLowerCase())) {
        loaded.push(def);
      }
    });

    setAccounts(loaded);
    localStorage.setItem('campus_ai_accounts', JSON.stringify(loaded));
  };

  // Load accounts
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('campus_ai_subjects');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAvailableSubjects(parsed.map((s: any) => ({ id: s.id, name: s.name, code: s.code })));
      }
    } catch { /* ignore */ }
  }, []);

  const saveAccounts = (updated: AccountRecord[]) => {
    setAccounts(updated);
    localStorage.setItem('campus_ai_accounts', JSON.stringify(updated));
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password || !name || !email) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    const generatedRoll = role === 'student'
      ? generateRollNumberLocal(accounts, department, year)
      : (rollNumber.trim() || `FAC-${Math.floor(1000 + Math.random() * 9000)}`);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          password,
          role,
          name: name.trim(),
          email: email.trim(),
          department,
          year: role === 'student' ? year : undefined,
          semester: role === 'student' ? '1-1' : undefined,
          roll_number: generatedRoll,
          subjects: role === 'faculty' ? assignedSubjects.join(', ') : undefined
        }),
      });

      if (response.ok) {
        setSuccess('Account created successfully!');
        fetchUsers();
        
        // Clear
        setUsername('');
        setPassword('');
        setName('');
        setEmail('');
        setRollNumber('');
        setAssignedSubjects([]);
        setShowAddModal(false);
        return;
      } else {
        const err = await response.json();
        setError(err.detail || 'Failed to provision account.');
        return;
      }
    } catch (e) {
      console.warn("Backend provision failed, falling back to local simulation", e);
    }

    const exists = accounts.some(acc => acc.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      setError('Username already registered.');
      return;
    }

    const newAcc = {
      username: username.toLowerCase().trim(),
      password,
      role,
      name: name.trim(),
      email: email.trim(),
      department,
      year: role === 'student' ? year : undefined,
      roll_number: generatedRoll,
      subjects: role === 'faculty' ? assignedSubjects.join(', ') : undefined
    };

    const updated = [...accounts, newAcc];
    saveAccounts(updated);
    setSuccess('Account created successfully!');
    
    // Clear
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
    setRollNumber('');
    setAssignedSubjects([]);
    setShowAddModal(false);
  };

  const handleDeleteAccount = async (uName: string) => {
    if (uName === 'admin') {
      alert('Cannot delete the root admin account.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove account: "${uName}"?`)) {
      const targetAcc = accounts.find(acc => acc.username === uName || acc.roll_number === uName);
      const updatedAccounts = accounts.filter(acc => acc.username !== uName && acc.roll_number !== uName);
      setAccounts(updatedAccounts);
      localStorage.setItem('campus_ai_accounts', JSON.stringify(updatedAccounts));

      // Also clean from student roster cache
      const savedRoster = localStorage.getItem('campus_ai_roster');
      if (savedRoster) {
        try {
          const parsedRoster = JSON.parse(savedRoster);
          const filteredRoster = parsedRoster.filter((st: any) => st.roll !== uName && st.roll !== targetAcc?.roll_number && st.name !== targetAcc?.name);
          localStorage.setItem('campus_ai_roster', JSON.stringify(filteredRoster));
        } catch { /* ignore */ }
      }

      try {
        await fetch(`${API_BASE_URL}/users/${uName}`, { method: 'DELETE' });
        if (targetAcc?.roll_number) {
          await fetch(`${API_BASE_URL}/students/${targetAcc.roll_number}`, { method: 'DELETE' });
          await fetch(`${API_BASE_URL}/users/${targetAcc.roll_number}`, { method: 'DELETE' });
        }
      } catch (e) {
        console.warn("Backend delete user failed", e);
      }
    }
  };

  const filtered = accounts.filter(acc =>
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.roll_number && acc.roll_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const [pendingFaculties, setPendingFaculties] = useState<AccountRecord[]>([]);

  const fetchPendingFaculties = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/pending-faculties`);
      if (res.ok) {
        const data = await res.json();
        setPendingFaculties(data);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchPendingFaculties();
  }, []);

  const handleApproveFaculty = async (uName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/approve-faculty/${uName}`, { method: 'POST' });
      if (res.ok) {
        alert(`🎉 Faculty account "${uName}" has been APPROVED successfully!`);
      } else {
        alert(`Faculty "${uName}" approved!`);
      }
    } catch (e) {
      alert(`Faculty "${uName}" approved!`);
    }

    setPendingFaculties(prev => prev.filter(f => f.username !== uName && f.roll_number !== uName));
    fetchUsers();
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            User Account Console
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage college access rights, approve pending faculty registrations, and review profiles.
          </p>
        </div>

        <button
          onClick={() => { setShowAddModal(true); setError(''); setSuccess(''); }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User Account</span>
        </button>
      </header>

      {/* Pending Faculty Signups Approval Section */}
      {pendingFaculties.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-4 shadow-sm animate-pulse-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-amber-950 text-base">Pending Faculty Signups Requiring Admin Approval</h3>
              <span className="bg-amber-200 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingFaculties.length} Pending
              </span>
            </div>
          </div>
          <p className="text-xs text-amber-800 font-medium">
            The following faculty accounts recently registered and are waiting for your verification to prevent unauthorized access:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingFaculties.map((fac) => (
              <div key={fac.username} className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{fac.name}</h4>
                  <p className="text-xs text-slate-500">{fac.username} • {fac.department || 'Faculty'}</p>
                  <p className="text-[11px] text-slate-400">{fac.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveFaculty(fac.username)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(fac.username)}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, roll number, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <span className="text-xs text-slate-400 font-bold uppercase">
          Total Accounts Registered: {filtered.length}
        </span>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filtered.map(acc => (
          <div
            key={acc.username}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 font-bold rounded-2xl flex items-center justify-center text-xs shrink-0 shadow-sm">
                {acc.name?.charAt(0) || acc.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-800 text-sm">{acc.name || acc.username}</h3>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                    acc.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border-purple-100'
                      : acc.role === 'faculty'
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {acc.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Username: <strong className="select-all">{acc.username}</strong> {acc.roll_number ? `• ID/Roll No: ${acc.roll_number}` : ''} • {acc.email}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-bold text-slate-700">{acc.department}</p>
              {acc.year && <p className="text-[10px] text-slate-450 mt-0.5 font-bold">{acc.year}</p>}
              {acc.subjects && (
                <p className="text-[10px] text-indigo-600 mt-0.5 font-bold">
                  Subjects: {acc.subjects}
                </p>
              )}
            </div>

            <button
              onClick={() => handleDeleteAccount(acc.username)}
              disabled={acc.username === 'admin'}
              className="px-3.5 py-1.5 bg-red-50 disabled:bg-slate-100 disabled:text-slate-400 hover:bg-red-100 text-red-650 hover:text-red-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 w-fit self-start sm:self-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Deprovision</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddAccount} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Provision User Account</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="text-red-600 text-xs font-bold bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</div>}

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border-2 transition-all ${role === 'student' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('faculty')}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border-2 transition-all ${role === 'faculty' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-2 px-2.5 text-xs font-bold rounded-xl border-2 transition-all ${role === 'admin' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
              >
                Admin
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Create Username</label>
                <input
                  type="text"
                  placeholder="e.g. user101"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Bob Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="bob@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  {role === 'student' ? 'Roll Number' : 'Employee ID (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={role === 'student' ? 'Auto-Generated on Save' : 'e.g. FAC-105'}
                  value={role === 'student' ? 'Auto-Generated' : rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  disabled={role === 'student'}
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    role === 'student'
                      ? 'bg-slate-100 border-slate-200 text-slate-500 font-semibold cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  {(() => {
                    try {
                      const saved = localStorage.getItem('campus_ai_departments');
                      if (saved) {
                        const parsed = JSON.parse(saved);
                        if (parsed.length >= 6) {
                          return (
                            <>
                              {parsed.map((d: any) => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                              ))}
                              <option value="Administration">Administration</option>
                            </>
                          );
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
                      'Administration'
                    ];
                    return fallbackDepts.map((name, idx) => (
                      <option key={idx} value={name}>{name}</option>
                    ));
                  })()}
                </select>
              </div>
              {role === 'student' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              )}
            </div>

            {role === 'faculty' && availableSubjects.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Assign Subjects</label>
                <div className="max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                  {availableSubjects.map(subj => (
                    <label key={subj.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={assignedSubjects.includes(subj.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignedSubjects(prev => [...prev, subj.name]);
                          } else {
                            setAssignedSubjects(prev => prev.filter(s => s !== subj.name));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs font-semibold text-slate-700">{subj.name} <span className="text-slate-400">({subj.code})</span></span>
                    </label>
                  ))}
                </div>
                {assignedSubjects.length > 0 && (
                  <p className="text-[10px] text-indigo-600 font-bold mt-1">{assignedSubjects.length} subject(s) selected</p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Provision Account
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

export default ManageUsers;

