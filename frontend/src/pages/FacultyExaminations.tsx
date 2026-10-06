import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Save, 
  Upload, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  BookOpen, 
  Beaker, 
  Check, 
  X, 
  RefreshCw, 
  Users, 
  Lock, 
  HelpCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  Settings,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '../config';

interface FilterSubject {
  id: number;
  code: string;
  name: string;
  department: string;
  semester: string;
  year: string;
  subject_type: 'THEORY' | 'LAB';
}

interface StudentRow {
  student_id: number;
  roll_number: string;
  name: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  mark_id?: number;
  marks?: number | null;
  is_published: number;
  updated_at?: string;
}

interface GradeScaleItem {
  grade: string;
  min_marks: number;
  max_marks: number;
  grade_points: number;
  description: string;
}

const FacultyExaminations = () => {
  const { user } = useAuth();

  // Active module tab
  const [activeModuleTab, setActiveModuleTab] = useState<'theory' | 'lab' | 'gradebook' | 'admin_grades'>('theory');

  // Filter selections
  const [departments, setDepartments] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<FilterSubject[]>([]);

  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('3rd Year');
  const [selectedSem, setSelectedSem] = useState<string>('3-1');
  const [selectedSection, setSelectedSection] = useState<string>('Section A');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('MID_1');

  // Examination data
  const [currentExamId, setCurrentExamId] = useState<number | null>(null);
  const [examMaxMarks, setExamMaxMarks] = useState<number>(30.0);
  const [examPublished, setExamPublished] = useState<number>(0);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  // Student marks state (spreadsheet-like editing)
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [markInputs, setMarkInputs] = useState<Record<number, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Loading & notification states
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);

  // Gradebook overview state
  const [gradebookData, setGradebookData] = useState<any>(null);
  const [loadingGradebook, setLoadingGradebook] = useState<boolean>(false);

  // Admin grade configuration state
  const [gradeScale, setGradeScale] = useState<GradeScaleItem[]>([]);
  const [savingGradeScale, setSavingGradeScale] = useState<boolean>(false);

  // 1. Fetch filter metadata
  useEffect(() => {
    setLoadingFilters(true);
    fetch(`${API_BASE_URL}/examinations/filters`, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        setDepartments(data.departments || []);
        setYears(data.years || ['1st Year', '2nd Year', '3rd Year', '4th Year']);
        setSemesters(data.semesters || ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2']);
        setSections(data.sections || ['Section A', 'Section B', 'Section C']);
        setSubjects(data.subjects || []);

        const initialDept = data.departments && data.departments.length > 0 ? data.departments[0] : 'Computer Science and Engineering (CSE)';
        setSelectedDept(initialDept);

        // Filter subjects for initial department
        const matchingSubjs = (data.subjects || []).filter((s: FilterSubject) => 
          s.department.toLowerCase().includes(initialDept.toLowerCase()) || 
          initialDept.toLowerCase().includes(s.department.toLowerCase())
        );
        if (matchingSubjs.length > 0) {
          setSelectedSubject(matchingSubjs[0].name);
        }
      })
      .catch(err => {
        console.error("Failed to load examination filters:", err);
        setErrorMessage("Failed to load examination filters.");
      })
      .finally(() => setLoadingFilters(false));

    // Also fetch grade config
    fetch(`${API_BASE_URL}/examinations/grade-config`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setGradeScale(data))
      .catch(() => {});
  }, []);

  // Filter available subjects based on selected department, semester, and active tab
  const availableSubjects = subjects.filter(s => {
    const deptMatch = !selectedDept || s.department.toLowerCase().includes(selectedDept.toLowerCase()) || selectedDept.toLowerCase().includes(s.department.toLowerCase());
    const semMatch = !selectedSem || s.semester === selectedSem;
    if (activeModuleTab === 'theory') return deptMatch && semMatch && s.subject_type === 'THEORY';
    if (activeModuleTab === 'lab') return deptMatch && semMatch && s.subject_type === 'LAB';
    return deptMatch && semMatch;
  });

  // Switch exam types when tab changes
  useEffect(() => {
    if (activeModuleTab === 'theory') {
      setSelectedExamType('MID_1');
    } else if (activeModuleTab === 'lab') {
      setSelectedExamType('LAB_INTERNAL');
    }
  }, [activeModuleTab]);

  // Keep selectedSubject in sync with availableSubjects whenever filters or tab change
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const match = availableSubjects.find(s => s.name === selectedSubject);
      if (!match) {
        setSelectedSubject(availableSubjects[0].name);
      }
    } else {
      setSelectedSubject('');
    }
  }, [selectedDept, selectedSem, activeModuleTab, subjects]);

  // Set default max marks
  useEffect(() => {
    if (['MID_1', 'MID_2', 'LAB_INTERNAL'].includes(selectedExamType)) {
      setExamMaxMarks(30.0);
    } else {
      setExamMaxMarks(70.0);
    }
  }, [selectedExamType]);

  // 2. Fetch or create Exam record and its student list
  const loadExamAndStudents = async () => {
    if (!selectedSubject || !selectedDept || !selectedSem) {
      setStudents([]);
      return;
    }

    setStudents([]);
    setLoadingStudents(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Step A: Create or fetch examination ID
      const subjectObj = subjects.find(s => s.name === selectedSubject);
      const examRes = await fetch(`${API_BASE_URL}/examinations`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: selectedSubject,
          subject_code: subjectObj?.code || null,
          subject_type: activeModuleTab === 'lab' ? 'LAB' : 'THEORY',
          exam_type: selectedExamType,
          department: selectedDept,
          year: selectedYear,
          semester: selectedSem,
          section: selectedSection,
          academic_session: '2025-2026',
          max_marks: ['MID_1', 'MID_2', 'LAB_INTERNAL'].includes(selectedExamType) ? 30.0 : 70.0
        })
      });

      if (!examRes.ok) {
        const errJson = await examRes.json();
        throw new Error(errJson.detail || 'Failed to initialize examination.');
      }

      const examData = await examRes.json();
      setCurrentExamId(examData.id);
      setExamMaxMarks(examData.max_marks);
      setExamPublished(examData.is_published);
      setPublishedAt(examData.published_at);

      // Step B: Fetch students and their current marks
      const studsRes = await fetch(`${API_BASE_URL}/examinations/${examData.id}/students`, {
        headers: getAuthHeaders()
      });

      if (!studsRes.ok) {
        const errJson = await studsRes.json();
        throw new Error(errJson.detail || 'Failed to load enrolled students.');
      }

      const studsData: StudentRow[] = await studsRes.json();
      setStudents(studsData);

      // Pre-fill input map
      const inputs: Record<number, string> = {};
      studsData.forEach(s => {
        inputs[s.student_id] = (s.marks !== null && s.marks !== undefined) ? String(s.marks) : '';
      });
      setMarkInputs(inputs);
      setHasUnsavedChanges(false);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error loading examination class.');
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (activeModuleTab === 'theory' || activeModuleTab === 'lab') {
      loadExamAndStudents();
    } else if (activeModuleTab === 'gradebook') {
      loadGradebook();
    }
  }, [selectedDept, selectedYear, selectedSem, selectedSection, selectedSubject, selectedExamType, activeModuleTab]);

  // Load gradebook overview
  const loadGradebook = async () => {
    if (!selectedSubject || !selectedDept || !selectedSem) {
      setGradebookData(null);
      return;
    }
    setGradebookData(null);
    setLoadingGradebook(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/faculty/examinations/overview?department=${encodeURIComponent(selectedDept)}&semester=${encodeURIComponent(selectedSem)}&section=${encodeURIComponent(selectedSection)}&subject=${encodeURIComponent(selectedSubject)}`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        setGradebookData(data);
      } else {
        setGradebookData(null);
      }
    } catch (err) {
      console.error("Failed to load gradebook overview:", err);
      setGradebookData(null);
    } finally {
      setLoadingGradebook(false);
    }
  };

  // Handle Mark Cell Change
  const handleMarkChange = (studentId: number, val: string) => {
    setMarkInputs(prev => ({ ...prev, [studentId]: val }));
    setHasUnsavedChanges(true);
  };

  // Save or Publish Marks
  const handleSaveMarks = async (action: 'save_draft' | 'publish') => {
    if (!currentExamId) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setActionLoading(true);

    try {
      // Validate all mark inputs
      const marksPayload: { student_id: number; marks: number | null }[] = [];

      for (const s of students) {
        const strVal = markInputs[s.student_id]?.trim();
        if (strVal !== '' && strVal !== undefined) {
          const numVal = parseFloat(strVal);
          if (isNaN(numVal)) {
            throw new Error(`Marks for ${s.name} (${s.roll_number}) must be numeric.`);
          }
          if (numVal < 0) {
            throw new Error(`Marks for ${s.name} cannot be negative.`);
          }
          if (numVal > examMaxMarks) {
            throw new Error(`Marks for ${s.name} cannot exceed maximum ${examMaxMarks}. (Entered: ${numVal})`);
          }
          marksPayload.push({ student_id: s.student_id, marks: numVal });
        } else {
          // Empty mark
          marksPayload.push({ student_id: s.student_id, marks: null });
        }
      }

      const res = await fetch(`${API_BASE_URL}/examinations/${currentExamId}/marks/bulk`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          marks: marksPayload,
          action: action
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to save marks.');
      }

      const resJson = await res.json();
      setHasUnsavedChanges(false);

      if (action === 'publish') {
        setExamPublished(1);
        setPublishedAt(new Date().toISOString());
        setSuccessMessage(`Success! Results published for ${selectedSubject} (${selectedExamType}). Students can now view their official marks.`);
        setShowPublishModal(false);
      } else {
        setSuccessMessage(`Draft saved successfully! ${resJson.saved_count} student marks updated. (Marks remain hidden from students until published)`);
      }

      // Reload fresh list
      loadExamAndStudents();

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to submit marks.');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Admin Grade Scale
  const handleSaveGradeScale = async () => {
    setSavingGradeScale(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/examinations/grade-config`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scale: gradeScale })
      });
      if (res.ok) {
        setSuccessMessage("University Grade Scale configuration updated successfully!");
      } else {
        const err = await res.json();
        setErrorMessage(err.detail || "Failed to update grade scale.");
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to save grade scale.");
    } finally {
      setSavingGradeScale(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen pb-28">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
              Faculty Examination Assessment Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Marks Entry & University Gradebook
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Bulk marks recording, draft saving, and official publication for Theory and Practical Laboratory courses.
          </p>
        </div>

        {/* User Role Indicator */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Authenticated Faculty: <strong className="text-slate-900">{user?.name || user?.username}</strong></span>
        </div>
      </header>

      {/* Primary Module Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveModuleTab('theory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeModuleTab === 'theory'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Theory Marks (Mid-1, Mid-2, Semester)
        </button>
        <button
          onClick={() => setActiveModuleTab('lab')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeModuleTab === 'lab'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Beaker className="w-4 h-4" />
          Lab Marks (Internal & External)
        </button>
        <button
          onClick={() => setActiveModuleTab('gradebook')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeModuleTab === 'gradebook'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Consolidated Class Gradebook
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveModuleTab('admin_grades')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeModuleTab === 'admin_grades'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Admin: Grade Scale Config
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="p-1 hover:bg-emerald-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-300 text-red-900 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-red-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION A & B: THEORY OR LAB MARKS ENTRY WORKFLOW */}
      {(activeModuleTab === 'theory' || activeModuleTab === 'lab' || activeModuleTab === 'gradebook') && (
        <>
          {/* Class Filters Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Select Class & Examination Parameters
                </h3>
              </div>
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Unsaved Changes
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
              {/* Department */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Academic Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Semester</label>
                <select
                  value={selectedSem}
                  onChange={(e) => setSelectedSem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {semesters.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sections.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Course / Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
                >
                  {availableSubjects.length === 0 ? (
                    <option value="">No authorized courses found</option>
                  ) : (
                    availableSubjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.code} - {sub.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Exam Component Selector (Only for entry tabs) */}
            {activeModuleTab !== 'gradebook' && (
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-600">Select Exam Component:</span>
                  {activeModuleTab === 'theory' ? (
                    <>
                      <button
                        onClick={() => setSelectedExamType('MID_1')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedExamType === 'MID_1'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Mid Examination 1 (Max 30)
                      </button>
                      <button
                        onClick={() => setSelectedExamType('MID_2')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedExamType === 'MID_2'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Mid Examination 2 (Max 30)
                      </button>
                      <button
                        onClick={() => setSelectedExamType('SEMESTER')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedExamType === 'SEMESTER'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Semester End Exam (Max 70)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setSelectedExamType('LAB_INTERNAL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedExamType === 'LAB_INTERNAL'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Continuous Lab Internal (Max 30)
                      </button>
                      <button
                        onClick={() => setSelectedExamType('LAB_EXTERNAL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedExamType === 'LAB_EXTERNAL'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        University External Lab (Max 70)
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                    examPublished === 1 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {examPublished === 1 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Status: Published ({new Date(publishedAt || '').toLocaleDateString()})
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Status: Draft (Students cannot see marks)
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SPREADSHEET BULK ENTRY TABLE (FOR THEORY & LAB) */}
          {(activeModuleTab === 'theory' || activeModuleTab === 'lab') && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
              {/* Table Action Bar */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-extrabold text-slate-800">
                    Enrolled Students ({students.length})
                  </span>
                  <span className="text-[11px] text-slate-400">• Maximum Awardable Marks: {examMaxMarks}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleSaveMarks('save_draft')}
                    disabled={actionLoading || loadingStudents}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 font-extrabold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-slate-600" />
                    Save Draft
                  </button>

                  <button
                    onClick={() => setShowPublishModal(true)}
                    disabled={actionLoading || loadingStudents}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    Upload / Publish Marks
                  </button>
                </div>
              </div>

              {loadingStudents ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs font-bold text-slate-500">Loading Enrolled Class Students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No enrolled students found for the selected department, semester, and section.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4">Roll Number</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4 text-center">Department / Class</th>
                        <th className="py-3 px-4 text-center w-36">Awarded Marks (/ {examMaxMarks})</th>
                        <th className="py-3 px-4 text-center">Publication Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((stud, idx) => {
                        const val = markInputs[stud.student_id] ?? '';
                        const numVal = parseFloat(val);
                        const isInvalid = val !== '' && (isNaN(numVal) || numVal < 0 || numVal > examMaxMarks);

                        return (
                          <tr key={stud.student_id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-4 font-mono font-black text-slate-900">{stud.roll_number}</td>
                            <td className="py-3 px-4 font-extrabold text-slate-800">{stud.name}</td>
                            <td className="py-3 px-4 text-center text-slate-500 font-medium">
                              {stud.semester} • {stud.section}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={examMaxMarks}
                                placeholder="—"
                                value={val}
                                onChange={(e) => handleMarkChange(stud.student_id, e.target.value)}
                                className={`w-28 text-center py-1.5 px-2 font-mono font-black text-sm rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                                  isInvalid
                                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-400'
                                    : 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500'
                                }`}
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              {stud.is_published === 1 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  <Check className="w-3 h-3" /> Published
                                </span>
                              ) : stud.marks !== null && stud.marks !== undefined ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                  Draft Saved
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic font-medium">Unentered</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONSOLIDATED CLASS GRADEBOOK */}
          {activeModuleTab === 'gradebook' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
              <div className="p-4.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    Consolidated Course Gradebook — {selectedSubject}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Continuous Internal Evaluation (80% High + 20% Low), Semester Result & Final Grade.
                  </p>
                </div>
                <button
                  onClick={loadGradebook}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                  title="Refresh Gradebook"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loadingGradebook ? (
                <div className="p-12 text-center text-xs font-bold text-slate-500">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Calculating live class grades...
                </div>
              ) : !gradebookData || !gradebookData.students || gradebookData.students.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No student records found for this course.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black text-[10px]">
                        <th className="py-3 px-4">Roll Number</th>
                        <th className="py-3 px-4">Student Name</th>
                        {gradebookData.is_lab ? (
                          <>
                            <th className="py-3 px-3 text-center bg-purple-50/50">Lab Internal (30M)</th>
                            <th className="py-3 px-3 text-center">Lab External (70M)</th>
                          </>
                        ) : (
                          <>
                            <th className="py-3 px-3 text-center">Mid-1 (30M)</th>
                            <th className="py-3 px-3 text-center">Mid-2 (30M)</th>
                            <th className="py-3 px-3 text-center bg-blue-50/50 text-blue-900">Internal (30M)</th>
                            <th className="py-3 px-3 text-center">Semester (70M)</th>
                          </>
                        )}
                        <th className="py-3 px-3 text-center font-black">Final Marks (100M)</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {gradebookData.students.map((st: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.roll_number}</td>
                          <td className="py-3 px-4 font-extrabold text-slate-800">{st.name}</td>
                          {gradebookData.is_lab ? (
                            <>
                              <td className="py-3 px-3 text-center bg-purple-50/30 font-bold text-purple-900">
                                {st.lab_internal !== null ? `${st.lab_internal} /30` : '—'}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-800">
                                {st.lab_external !== null ? `${st.lab_external} /70` : '—'}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-3 text-center font-bold text-slate-700">
                                {st.mid1 !== null ? `${st.mid1} /30` : '—'}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-700">
                                {st.mid2 !== null ? `${st.mid2} /30` : '—'}
                              </td>
                              <td className="py-3 px-3 text-center bg-blue-50/30 font-black text-blue-700">
                                {st.internal !== null ? `${st.internal} /30` : '—'}
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-slate-700">
                                {st.semester !== null ? `${st.semester} /70` : '—'}
                              </td>
                            </>
                          )}
                          <td className="py-3 px-3 text-center font-black text-sm text-slate-900">
                            {st.final_marks !== null ? `${st.final_marks} /100` : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {st.grade ? (
                              <span className="px-2 py-0.5 rounded text-xs font-black bg-blue-100 text-blue-800">
                                {st.grade}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 4: ADMIN GRADE SCALE CONFIGURATION */}
      {activeModuleTab === 'admin_grades' && user?.role === 'admin' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Centralized University Grading Scale Editor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure grade boundaries and grade points across all university theory and practical courses.
              </p>
            </div>
            <button
              onClick={handleSaveGradeScale}
              disabled={savingGradeScale}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingGradeScale ? 'Saving Changes...' : 'Save Configuration'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black text-[10px]">
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Min Marks</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Grade Points</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradeScale.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4 font-black text-sm text-slate-900">{item.grade}</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={item.min_marks}
                        onChange={(e) => {
                          const updated = [...gradeScale];
                          updated[idx].min_marks = parseFloat(e.target.value);
                          setGradeScale(updated);
                        }}
                        className="w-20 px-2 py-1 rounded border border-slate-300 font-bold text-xs"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={item.max_marks}
                        onChange={(e) => {
                          const updated = [...gradeScale];
                          updated[idx].max_marks = parseFloat(e.target.value);
                          setGradeScale(updated);
                        }}
                        className="w-20 px-2 py-1 rounded border border-slate-300 font-bold text-xs"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={item.grade_points}
                        onChange={(e) => {
                          const updated = [...gradeScale];
                          updated[idx].grade_points = parseInt(e.target.value);
                          setGradeScale(updated);
                        }}
                        className="w-16 px-2 py-1 rounded border border-slate-300 font-bold text-xs"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...gradeScale];
                          updated[idx].description = e.target.value;
                          setGradeScale(updated);
                        }}
                        className="w-full px-2 py-1 rounded border border-slate-300 font-medium text-xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL BEFORE PUBLISHING */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Publish Examination Marks</h3>
                <p className="text-xs text-slate-500">Official release to student academic portals</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Notice on Publication:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Clicking <strong>Confirm & Publish</strong> will instantly make these marks visible to all enrolled students for <strong>{selectedSubject} ({selectedExamType})</strong>. Any future edits will require explicit re-saving.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveMarks('publish')}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                {actionLoading ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyExaminations;
