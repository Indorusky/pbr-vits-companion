import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Building, Plus, X, Trash2, Search, Edit3, Check, Filter } from 'lucide-react';

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

const FACULTY_POOL = [
  "Dr. DODLA SRUJAN CHANDRA REDDY",
  "Dr. GANUGULA VIJAY KUMAR",
  "Dr. KUNI VENKATA SUBBAIAH",
  "Dr. NUKAMREDDY SRINAD REDDY",
  "Dr. BONTHALA VAMSEE MOHAN",
  "Dr. POLEBOINA VENKATA N RAJESWARI",
  "Dr. RAMIREDDY KONDAIAH",
  "Dr. PATHAKAMURI SRINIVASULU",
  "Mr. SHAIK SHABBIR BASHA",
  "Mr. PUTTU ESWARAIAH",
  "Ms. THORAINELLORE MANJULA",
  "Mr. MENTA VIJAYABHASKAR",
  "Mrs. SIVADANAM USHA RANI",
  "Ms. AKSHAYAM PRASMITA",
  "Ms. KODALI BHARGAVI",
  "Mr. PERAM KAMALAKAR",
  "Mr. CHEEDELLA CHANDRA SEKHAR",
  "Mis. MALISETTY TEJASWINI",
  "Mrs. GUMMADI TIRUMALA",
  "Mrs. KANAMATHAREDDY RESHMA REDDY",
  "Ms. JARUGUMALLI MADHURI",
  "Mr. GUNUPATI VENKATESWARLU",
  "Ms. K V SUPRAJA",
  "Ms. NUNNA SAI SINDHURA",
  "Ms. KOPILA RAVI CHAND",
  "Mr. PEDDIREDDY VENKATESWARA REDDY",
  "Mr. PANDITAAJAYA KUMAR",
  "Ms. ALANKARAM SHOBITHA LAKSHMI",
  "Mr. ANGALAKUDURU SRINIVASA RAO",
  "Mr. THAMMINENI DAYAKAR",
  "Mr. RAJA BHARGAVA",
  "Mr. GUDAMSETTY RAJESH",
  "Mr. CH VENKATESWARLU",
  "Mr. RONDLA PRAPULLA KUMAR",
  "Mr. MODEM JEEVAN KUMAR",
  "Mr. PASUPULETI MOHAN",
  "Ms. GUNA GAYATHRI PRASEETHA K",
  "Ms. DARBALA PAVAN KUMAR",
  "Mr. PERAM MALLIKARJUNA",
  "Mr. KUNI SAI SUMANTH",
  "Ms. PONNURU VENKATA SUSHMA",
  "Mr. CHALLA AKHIL",
  "Ms. CHEVURI ROJA",
  "Mr. MUNAGALA VENKATESWARLU",
  "Mr. MANCHERLAPATI NEERJA",
  "Mr. METTA SATHYA SAI LAKSHMAN",
  "Mr. ADUSUMALLI PRASANNA KUMAR",
  "Mr. KATAMREDDI MAHENDRA",
  "Ms. KOMMURI SRAVANI",
  "Mrs. KUPPAM SAMEERA",
  "Ms. PASUPILETI VIMALASANYHI",
  "Mr. SINGAMANENI MALLIKARJUNA",
  "Mrs. NIDAMANURI V SOUNDARYA"
];

const MASTER_SUBJECTS_CATALOG: Record<string, Record<string, string[]>> = {
  "1": { // EEE
    "1-1": ['Mathematics-I', 'Engineering Chemistry', 'Programming in C', 'Engineering Graphics', 'C Programming Lab'],
    "1-2": ['Mathematics-II', 'Basic Electrical Engineering', 'Network Analysis', 'Data Structures', 'BEE Lab'],
    "2-1": ['Electrical Circuit Analysis', 'DC Machines & Transformers', 'Electromagnetic Fields', 'Electronic Circuits', 'Machines Lab'],
    "2-2": ['AC Machines', 'Control Systems', 'Power Systems-I', 'Digital Electronics', 'Control Lab'],
    "3-1": ['Power Electronics', 'Power Systems-II', 'Electrical Measurements', 'Microprocessors', 'Power Electronics Lab'],
    "3-2": ['Power System Analysis', 'DSP', 'Renewable Energy Systems', 'Drives & Control', 'DSP Lab'],
    "4-1": ['Switchgear & Protection', 'White Coal Processing', 'Smart Grid', 'Project Phase-I', 'Power Systems Lab'],
    "4-2": ['High Voltage Engineering', 'Industrial Automation', 'Major Project Phase-II', 'Seminar']
  },
  "2": { // CSE-AI
    "1-1": ['Mathematics-I', 'Engineering Chemistry', 'Programming in C', 'Communicative English', 'C Programming Lab'],
    "1-2": ['Mathematics-II', 'Data Structures', 'Python Programming', 'Basic Electronics', 'Python Lab'],
    "2-1": ['Discrete Mathematics', 'Intro to AI', 'DBMS', 'Knowledge Representation', 'AI Programming Lab'],
    "2-2": ['Machine Learning', 'Probability & Statistics', 'Operating Systems', 'Intelligent Systems', 'ML Lab'],
    "3-1": ['Deep Learning', 'Computer Vision', 'NLP', 'Data Mining', 'Deep Learning Lab'],
    "3-2": ['Reinforcement Learning', 'AI Ethics', 'Pattern Recognition', 'Neural Networks', 'RL Lab'],
    "4-1": ['Generative AI', 'Expert Systems', 'AI in Robotics', 'Project Phase-I', 'GenAI Lab'],
    "4-2": ['Advanced AI Elective', 'AI in Healthcare', 'Major Project Phase-II', 'Seminar']
  },
  "3": { // CSE-AIML
    "1-1": ['Mathematics-I', 'Applied Physics', 'Programming in C', 'English', 'C Programming Lab'],
    "1-2": ['Mathematics-II', 'Python Programming', 'Data Structures', 'Basic Electronics', 'Python Lab'],
    "2-1": ['Discrete Mathematics', 'Intro to ML', 'DBMS', 'Computer Organization', 'ML Lab'],
    "2-2": ['Deep Learning', 'Statistical Learning', 'Operating Systems', 'Algorithms', 'Deep Learning Lab'],
    "3-1": ['NLP', 'Computer Vision', 'Reinforcement Learning', 'Data Warehouse', 'NLP Lab'],
    "3-2": ['MLOps', 'Big Data Analytics', 'Generative AI', 'Optimization Techniques', 'MLOps Lab'],
    "4-1": ['Advanced ML', 'Predictive Modeling', 'AI in Finance', 'Project Phase-I', 'Project Lab'],
    "4-2": ['Business Intelligence', 'Ethics in AI/ML', 'Major Project Phase-II', 'Seminar']
  },
  "4": { // CSE
    "1-1": ['Mathematics-I', 'Engineering Physics', 'Programming in C', 'English', 'C Programming Lab'],
    "1-2": ['Mathematics-II', 'Data Structures', 'Basic Electrical', 'Python Programming', 'Data Structures Lab'],
    "2-1": ['Discrete Mathematics', 'DBMS', 'Operating Systems', 'OOP using Java', 'DBMS Lab'],
    "2-2": ['Design & Analysis of Algorithms', 'Computer Networks', 'Software Engineering', 'Automata Theory', 'Algorithms Lab'],
    "3-1": ['Compiler Design', 'Web Technologies', 'Artificial Intelligence', 'Cyber Security', 'Web Lab'],
    "3-2": ['Cloud Computing', 'Distributed Systems', 'Data Warehousing', 'Professional Elective-I', 'Cloud Lab'],
    "4-1": ['Cryptography', 'Big Data Analytics', 'DevOps', 'Project Phase-I', 'Big Data Lab'],
    "4-2": ['Management Science', 'Professional Elective-II', 'Major Project Phase-II', 'Seminar']
  },
  "5": { // ECE
    "1-1": ['Mathematics-I', 'Engineering Physics', 'Programming in C', 'Engineering Graphics', 'C Programming Lab'],
    "1-2": ['Mathematics-II', 'Network Analysis', 'Electronic Devices', 'Data Structures', 'Devices Lab'],
    "2-1": ['Signals & Systems', 'Digital Electronics', 'Analog Circuits', 'Random Variables', 'Analog Lab'],
    "2-2": ['Control Systems', 'Electromagnetic Waves', 'Analog Communications', 'Microprocessors', 'Microprocessor Lab'],
    "3-1": ['Digital Communications', 'VLSI Design', 'DSP', 'Antennas & Propagation', 'VLSI Lab'],
    "3-2": ['Embedded Systems', 'Computer Networks', 'Information Theory', 'DSP Lab', 'Embedded Lab'],
    "4-1": ['Microwave Engineering', 'Optical Communications', 'Satellite Communication', 'Project Phase-I', 'Microwave Lab'],
    "4-2": ['Wireless Networks', 'Radar Systems', 'Major Project Phase-II', 'Seminar']
  },
  "6": { // Civil Engineering
    "1-1": ['Mathematics-I', 'Engineering Physics', 'Engineering Mechanics', 'English', 'Engineering Drawing'],
    "1-2": ['Mathematics-II', 'Engineering Chemistry', 'Strength of Materials-I', 'Programming in C', 'C Programming Lab'],
    "2-1": ['Fluid Mechanics-I', 'Surveying-I', 'Strength of Materials-II', 'Building Materials', 'Surveying Lab'],
    "2-2": ['Fluid Mechanics-II', 'Surveying-II', 'Structural Analysis-I', 'Geotechnical Engineering-I', 'Geotech Lab'],
    "3-1": ['Structural Analysis-II', 'Geotechnical Engineering-II', 'Environmental Engineering-I', 'Transportation Engineering-I', 'Environmental Lab'],
    "3-2": ['RCC Design', 'Environmental Engineering-II', 'Transportation Engineering-II', 'Water Resources', 'RCC Lab'],
    "4-1": ['Steel Structures Design', 'Estimation & Costing', 'Construction Management', 'Project Phase-I', 'CAD Lab'],
    "4-2": ['Bridge Engineering', 'Prestressed Concrete', 'Major Project Phase-II', 'Seminar']
  }
};

function generateDefaultSubjects(): Subject[] {
  const result: Subject[] = [];
  let facIdx = 0;
  let idCounter = 1;

  const deptCodes: Record<string, string> = {
    "1": "EE",
    "2": "AI",
    "3": "ML",
    "4": "CS",
    "5": "EC",
    "6": "CE"
  };

  const semToYear: Record<string, string> = {
    "1-1": "1st Year", "1-2": "1st Year",
    "2-1": "2nd Year", "2-2": "2nd Year",
    "3-1": "3rd Year", "3-2": "3rd Year",
    "4-1": "4th Year", "4-2": "4th Year"
  };

  for (const [deptId, semMap] of Object.entries(MASTER_SUBJECTS_CATALOG)) {
    const codePrefix = deptCodes[deptId] || "SUB";
    for (const [sem, subjList] of Object.entries(semMap)) {
      subjList.forEach((subjName, idx) => {
        const code = `${codePrefix}${sem.replace('-', '')}${String(idx + 1).padStart(2, '0')}`;
        const facultyUsername = FACULTY_POOL[facIdx % FACULTY_POOL.length];
        facIdx++;

        result.push({
          id: String(idCounter++),
          name: subjName,
          code: code,
          departmentId: deptId,
          year: semToYear[sem] || "1st Year",
          semester: sem,
          facultyUsername: facultyUsername
        });
      });
    }
  }

  return result;
}

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length >= 50) return parsed;
      }
    } catch { /* ignore */ }
    return generateDefaultSubjects();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [modalSemFilter, setModalSemFilter] = useState('All');

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

  // Fetch subjects & faculty dynamically from backend
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/subjects`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setSubjects(data);
          }
        }
      } catch (e) {
        console.warn("Backend fetch subjects failed, using generated defaults", e);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users?role=faculty`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setFaculties(data);
            return;
          }
        }
      } catch (e) {
        console.warn("Backend fetch faculties failed, falling back to local pool", e);
      }
      setFaculties(FACULTY_POOL.map(name => ({ username: name, name: name })));
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
    setModalSemFilter('All');
    setShowDeptModal(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setModalSemFilter('All');
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

  const handleReassignFaculty = (subjectId: string, facultyUsername: string) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, facultyUsername } : s));
  };

  const handleDeleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSubjects(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredDepts = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDeptSubjects = (deptId: string) => {
    return subjects.filter(s => s.departmentId === deptId);
  };

  const getFilteredModalSubjects = (deptId: string) => {
    let list = getDeptSubjects(deptId);
    if (modalSemFilter !== 'All') {
      list = list.filter(s => s.semester === modalSemFilter);
    }
    return list;
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Building className="w-8 h-8 text-indigo-600" />
            Department & Subject Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage academic departments, full curriculum subjects, and faculty assignments across all semesters.
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

      {/* Tab Switcher Header */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm inline-flex gap-1">
        <div className="px-4 py-2 text-sm font-bold rounded-lg bg-indigo-600 text-white shadow-sm flex items-center gap-2">
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

      {/* Departments List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredDepts.length > 0 ? filteredDepts.map(dept => {
          const deptSubjects = getDeptSubjects(dept.id);
          return (
            <div key={dept.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-700 font-bold rounded-2xl flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {dept.code}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{dept.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Code: <strong>{dept.code}</strong> • <strong className="text-indigo-600">{deptSubjects.length} subjects</strong> assigned across 8 semesters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditDept(dept)}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Workspace
                </button>
                <button
                  onClick={() => handleDeleteDept(dept.id)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="p-12 text-center">
            <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No departments found.</p>
          </div>
        )}
      </div>

      {/* Department Workspace Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveDept} className={`bg-white rounded-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto transition-all ${editingDept ? 'max-w-3xl' : 'max-w-md'}`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingDept ? `Manage ${editingDept.name}` : 'Add New Department'}
                </h3>
                {editingDept && (
                  <p className="text-xs text-slate-500">View & modify curriculum subjects and assigned faculty members.</p>
                )}
              </div>
              <button type="button" onClick={() => setShowDeptModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            {editingDept && (
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Subjects Catalog ({getDeptSubjects(editingDept.id).length} Subjects Total)
                    </h4>
                  </div>
                  
                  {/* Semester Filter */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {['All', '1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'].map(sem => (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => setModalSemFilter(sem)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors shrink-0 ${
                          modalSemFilter === sem ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sem}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List of existing subjects under selected filter */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {getFilteredModalSubjects(editingDept.id).length > 0 ? (
                    getFilteredModalSubjects(editingDept.id).map(subj => (
                      <div key={subj.id} className="p-3 bg-slate-50 hover:bg-indigo-50/30 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md tracking-wide">{subj.code}</span>
                            <span className="text-xs font-extrabold text-slate-900">{subj.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">{subj.year} • Sem {subj.semester}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={subj.facultyUsername || ''}
                            onChange={(e) => handleReassignFaculty(subj.id, e.target.value)}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[200px]"
                          >
                            <option value="">Unassigned</option>
                            {faculties.map(f => (
                              <option key={f.username || f.name} value={f.username || f.name}>
                                {f.name || f.username}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(subj.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-400 italic">No subjects found for semester {modalSemFilter}.</p>
                    </div>
                  )}
                </div>

                {/* Add Subject form section */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-3">
                  <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Add New Subject to {editingDept.code}</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Subject Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Artificial Intelligence"
                        value={newSubjName}
                        onChange={(e) => setNewSubjName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Subject Code</label>
                      <input
                        type="text"
                        placeholder="e.g. CS303"
                        value={newSubjCode}
                        onChange={(e) => setNewSubjCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-1">Year</label>
                      <select
                        value={newSubjYear}
                        onChange={(e) => setNewSubjYear(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
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
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
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
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {faculties.map(f => (
                          <option key={f.username || f.name} value={f.username || f.name}>
                            {f.name || f.username}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSubjectToDept}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Subject to Department
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                {editingDept ? 'Save Department Details' : 'Add Department'}
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
