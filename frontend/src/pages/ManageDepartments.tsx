import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

import { Building, BookOpen, Plus, X, Trash2, Search, Edit3, Check } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  year: string;
  semester: string;
  facultyUsername?: string;
}

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Electrical and Electronics Engineering (EEE)', code: 'EEE' },
  { id: '2', name: 'CSE AI', code: 'CSE-AI' },
  { id: '3', name: 'CSE AIML', code: 'CSE-AIML' },
  { id: '4', name: 'Computer Science and Engineering (CSE)', code: 'CSE' },
  { id: '5', name: 'Electronics and Communication Engineering (ECE)', code: 'ECE' },
  { id: '6', name: 'Civil Engineering', code: 'CE' },
];

const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Data Structures', code: 'CS301', departmentId: '1', year: '2nd Year', semester: 'Semester 3' },
  { id: '2', name: 'Machine Learning', code: 'CS501', departmentId: '1', year: '3rd Year', semester: 'Semester 5' },
  { id: '3', name: 'Database Systems', code: 'CS401', departmentId: '1', year: '2nd Year', semester: 'Semester 4' },
  { id: '4', name: 'Operating Systems', code: 'CS402', departmentId: '1', year: '2nd Year', semester: 'Semester 4' },
  { id: '5', name: 'Digital Signal Processing', code: 'EC301', departmentId: '2', year: '2nd Year', semester: 'Semester 3' },
  { id: '6', name: 'VLSI Design', code: 'EC501', departmentId: '2', year: '3rd Year', semester: 'Semester 5' },
  { id: '7', name: 'Thermodynamics', code: 'ME201', departmentId: '3', year: '1st Year', semester: 'Semester 2' },
  { id: '8', name: 'Fluid Mechanics', code: 'ME301', departmentId: '3', year: '2nd Year', semester: 'Semester 3' },
];

const ManageDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_departments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length >= 6) return parsed;
      }
    } catch { /* ignore */ }
    return DEFAULT_DEPARTMENTS;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_subjects');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return DEFAULT_SUBJECTS;
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Department modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  // Add Subject states inside Department modal
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjYear, setNewSubjYear] = useState('1st Year');
  const [newSubjSemester, setNewSubjSemester] = useState('1-1');
  const [newSubjFaculty, setNewSubjFaculty] = useState('');
  const [faculties, setFaculties] = useState<any[]>([]);

  const [success, setSuccess] = useState('');

  useEffect(() => {
    localStorage.setItem('campus_ai_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('campus_ai_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users?role=faculty`);
        if (response.ok) {
          const data = await response.json();
          setFaculties(data);
        }
      } catch (e) {
        console.warn("Backend fetch faculties failed, falling back to local accounts", e);
        try {
          const saved = localStorage.getItem('campus_ai_accounts') || '[]';
          const accounts = JSON.parse(saved);
          setFaculties(accounts.filter((a: any) => a.role === 'faculty'));
        } catch { /* ignore */ }
      }
    };
    fetchFaculties();
  }, []);

  const getFacultyName = (username?: string) => {
    if (!username) return 'Unassigned';
    return faculties.find(f => f.username === username)?.name || username;
  };

  // Department handlers
  const openAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setShowDeptModal(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setShowDeptModal(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    if (editingDept) {
      setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, name: deptName.trim(), code: deptCode.trim().toUpperCase() } : d));
      setSuccess('Department updated successfully!');
    } else {
      const newDept: Department = {
        id: Date.now().toString(),
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
      };
      setDepartments(prev => [...prev, newDept]);
      setSuccess('Department added successfully!');
    }
    setShowDeptModal(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteDept = (id: string) => {
    if (window.confirm('Are you sure? This will also remove all subjects under this department.')) {
      setDepartments(prev => prev.filter(d => d.id !== id));
      setSubjects(prev => prev.filter(s => s.departmentId !== id));
    }
  };

  const handleAddSubjectToDept = () => {
    if (!newSubjName.trim() || !newSubjCode.trim() || !editingDept) return;
    
    const newSubj: Subject = {
      id: Date.now().toString(),
      name: newSubjName.trim(),
      code: newSubjCode.trim().toUpperCase(),
      departmentId: editingDept.id,
      year: newSubjYear,
      semester: newSubjSemester,
      facultyUsername: newSubjFaculty,
    };
    
    setSubjects(prev => [...prev, newSubj]);
    
    // Reset inputs
    setNewSubjName('');
    setNewSubjCode('');
    setNewSubjYear('1st Year');
    setNewSubjSemester('1-1');
    setNewSubjFaculty('');
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    }
  };

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getDeptName(s.departmentId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Building className="w-8 h-8 text-indigo-600" />
            Department & Subject Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Add, modify, and organize academic departments and their course offerings.
          </p>
        </div>

        <button
          onClick={openAddDept}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </header>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-100">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Tab Switcher (Removed Subjects Tab) */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm inline-flex gap-1">
        <div
          className="px-4 py-2 text-sm font-bold rounded-lg bg-indigo-600 text-white shadow-sm flex items-center gap-2"
        >
          <Building className="w-4 h-4" />
          Departments ({departments.length})
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Departments List (Subjects Tab List Removed) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredDepts.length > 0 ? filteredDepts.map(dept => (
          <div key={dept.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 font-bold rounded-2xl flex items-center justify-center text-xs shrink-0 shadow-sm">
                {dept.code.substring(0, 2)}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">{dept.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Code: <strong>{dept.code}</strong> • {subjects.filter(s => s.departmentId === dept.id).length} subjects
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditDept(dept)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDeleteDept(dept.id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        )) : (
          <div className="p-12 text-center">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No departments found.</p>
          </div>
        )}
      </div>

      {/* Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveDept} className={`bg-white rounded-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-all ${editingDept ? 'max-w-2xl' : 'max-w-md'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingDept ? 'Edit Department Workspace' : 'Add New Department'}
              </h3>
              <button type="button" onClick={() => setShowDeptModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Department Name</label>
              <input
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Department Code</label>
              <input
                type="text"
                placeholder="e.g. CSE"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>

            {editingDept && (
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Subjects in this Department</h4>
                
                {/* List of existing subjects */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {subjects.filter(s => s.departmentId === editingDept.id).length > 0 ? (
                    subjects.filter(s => s.departmentId === editingDept.id).map(subj => (
                      <div key={subj.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">{subj.code}</span>
                            <span className="text-xs font-bold text-slate-850">{subj.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {subj.year} • {subj.semester} • Faculty: <strong className="text-slate-700">{getFacultyName(subj.facultyUsername)}</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubject(subj.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No subjects added to this department yet.</p>
                  )}
                </div>

                {/* Add Subject form section */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700">Add New Subject</h5>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Subject Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Machine Learning"
                        value={newSubjName}
                        onChange={(e) => setNewSubjName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Subject Code</label>
                      <input
                        type="text"
                        placeholder="e.g. CS501"
                        value={newSubjCode}
                        onChange={(e) => setNewSubjCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Year</label>
                      <select
                        value={newSubjYear}
                        onChange={(e) => setNewSubjYear(e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Semester</label>
                      <select
                        value={newSubjSemester}
                        onChange={(e) => setNewSubjSemester(e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      >
                        {['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Assign Faculty</label>
                      <select
                        value={newSubjFaculty}
                        onChange={(e) => setNewSubjFaculty(e.target.value)}
                        className="w-full px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="">None</option>
                        {faculties.filter(f => f.department && f.department.split(',').map((d: string) => d.trim()).includes(editingDept.name)).map(f => (
                          <option key={f.username} value={f.username}>{f.name || f.username}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSubjectToDept}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Subject to Department
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                {editingDept ? 'Update Department' : 'Add Department'}
              </button>
              <button type="button" onClick={() => setShowDeptModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
