import { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, X, Edit3, Trash2, Award } from 'lucide-react';

interface SubjectRecord {
  id: string;
  name: string;
  code: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | 'Final Year';
  department: string;
  faculty: string;
}

const DEFAULT_SUBJECTS: SubjectRecord[] = [
  { id: '1', name: 'Mathematics I', code: 'MATH101', year: '1st Year', department: 'Computer Science', faculty: 'Dr. Sarah Jenkins' },
  { id: '2', name: 'Applied Physics', code: 'PHYS204', year: '2nd Year', department: 'Computer Science', faculty: 'Prof. Alan Vance' },
  { id: '3', name: 'Mathematics III', code: 'MATH301', year: '3rd Year', department: 'Computer Science', faculty: 'Dr. Sarah Jenkins' },
  { id: '4', name: 'Data Structures', code: 'CS402', year: '3rd Year', department: 'Computer Science', faculty: 'Dr. Rajiv Sharma' },
  { id: '5', name: 'Machine Learning', code: 'CS501', year: 'Final Year', department: 'Computer Science', faculty: 'Dr. Rajiv Sharma' }
];

const UpdateSubjects = () => {
  const [subjects, setSubjects] = useState<SubjectRecord[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_subjects_catalog');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_SUBJECTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSub, setEditingSub] = useState<SubjectRecord | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [year, setYear] = useState<'1st Year' | '2nd Year' | '3rd Year' | 'Final Year'>('1st Year');
  const [dept, setDept] = useState('Computer Science');
  const [faculty, setFaculty] = useState('Dr. Rajiv Sharma');

  // Dynamic departments and instructors
  const [departments, setDepartments] = useState<any[]>([]);
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedDepts = localStorage.getItem('campus_ai_departments');
      if (savedDepts) {
        const parsed = JSON.parse(savedDepts);
        setDepartments(parsed);
        if (parsed.length > 0 && !editingSub) {
          setDept(parsed[0].name);
        }
      } else {
        // Fallbacks
        const defaults = [
          { id: '1', name: 'Computer Science', code: 'CSE' },
          { id: '2', name: 'Electrical Engineering', code: 'ECE' },
          { id: '3', name: 'Mechanical Engineering', code: 'ME' },
        ];
        setDepartments(defaults);
        if (!editingSub) setDept(defaults[0].name);
      }
    } catch { /* ignore */ }

    try {
      const savedAccs = localStorage.getItem('campus_ai_accounts');
      if (savedAccs) {
        const parsed = JSON.parse(savedAccs);
        const facs = parsed.filter((a: any) => a.role === 'faculty');
        setFacultyMembers(facs);
        if (facs.length > 0 && !editingSub) {
          setFaculty(facs[0].name);
        }
      }
    } catch { /* ignore */ }
  }, [editingSub]);

  useEffect(() => {
    localStorage.setItem('campus_ai_subjects_catalog', JSON.stringify(subjects));
  }, [subjects]);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const newSub: SubjectRecord = {
      id: Date.now().toString(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      year,
      department: dept,
      faculty
    };

    setSubjects([...subjects, newSub]);
    setName('');
    setCode('');
    setShowAddModal(false);
  };

  const handleEditClick = (sub: SubjectRecord) => {
    setEditingSub(sub);
    setName(sub.name);
    setCode(sub.code);
    setYear(sub.year);
    setDept(sub.department);
    setFaculty(sub.faculty);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub || !name || !code) return;

    setSubjects(prev =>
      prev.map(s =>
        s.id === editingSub.id
          ? {
              ...s,
              name: name.trim(),
              code: code.trim().toUpperCase(),
              year,
              department: dept,
              faculty
            }
          : s
      )
    );
    setEditingSub(null);
    setName('');
    setCode('');
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to remove this subject from the catalog?')) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    }
  };

  const filtered = subjects.filter(sub => {
    const matchesYear = selectedYear === 'All' || sub.year === selectedYear;
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.faculty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Subject & Curriculum Catalog
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage course lists, assign curriculum to study years, and define instructors.
          </p>
        </div>

        <button
          onClick={() => { setShowAddModal(true); setEditingSub(null); setName(''); setCode(''); }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject Details</span>
        </button>
      </header>

      {/* Catalog Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search code, name, faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Filter Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Years</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="Final Year">Final Year</option>
          </select>
        </div>
      </div>

      {/* Grid Catalog */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filtered.map(sub => (
          <div
            key={sub.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-700 font-bold rounded-2xl flex items-center justify-center text-xs shrink-0 shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {sub.code}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase">{sub.year}</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-base mt-1">{sub.name}</h3>
                <p className="text-xs text-slate-500 font-medium">Instructor: {sub.faculty} • {sub.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditClick(sub)}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => handleDeleteSubject(sub.id)}
                className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || editingSub) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={editingSub ? handleSaveEdit : handleAddSubject} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{editingSub ? 'Edit Subject Details' : 'Add Subject Details'}</h3>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setEditingSub(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS308"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Study Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value as any)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Department</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Assigned Instructor</label>
                <select
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  {facultyMembers.map(f => (
                    <option key={f.username} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                {editingSub ? 'Save Changes' : 'Create Subject'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setEditingSub(null); }}
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

export default UpdateSubjects;
