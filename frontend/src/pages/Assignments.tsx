import { useState, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Upload, Search, Filter, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS_DATABASE, getNormalizedDepartment } from '../utils/subjectsData';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Submitted';
  description: string;
  points: number;
  submittedFile?: string;
  feedback?: string;
}

const DEFAULT_ASSIGNMENTS: Assignment[] = []; // dynamically generated

const Assignments = () => {
  const { user, viewMode } = useAuth();
  const canCreate = viewMode === 'faculty' || viewMode === 'admin';

  // Calculate dynamic subjects based on logged-in student's info
  const studentDept = getNormalizedDepartment(user?.department || 'Computer Science');
  const studentSem = user?.semester || '3-1';
  const semesterSubjectsList = SUBJECTS_DATABASE[studentDept]?.[studentSem] || [];

  const getDynamicDefaultAssignments = () => {
    if (semesterSubjectsList.length === 0) return [];
    const mapped: Assignment[] = [];
    
    if (semesterSubjectsList[0]) {
      mapped.push({
        id: '1',
        title: `Introduction & Foundational Problems in ${semesterSubjectsList[0]}`,
        subject: semesterSubjectsList[0],
        dueDate: '2026-09-02',
        status: 'In Progress',
        description: `Complete the initial exercises and practical simulations for ${semesterSubjectsList[0]}. Submit your results as a PDF document showing step-by-step solutions.`,
        points: 100
      });
    }
    
    if (semesterSubjectsList[1]) {
      mapped.push({
        id: '2',
        title: `Advanced Modeling & Core Theory in ${semesterSubjectsList[1]}`,
        subject: semesterSubjectsList[1],
        dueDate: '2026-09-08',
        status: 'Not Started',
        description: `Derive the principal mathematical or architectural models for ${semesterSubjectsList[1]}. Write a Python implementation validating the theoretical bounds.`,
        points: 100
      });
    }
    
    if (semesterSubjectsList[2]) {
      mapped.push({
        id: '3',
        title: `Design Patterns & Project Implementation for ${semesterSubjectsList[2]}`,
        subject: semesterSubjectsList[2],
        dueDate: '2026-08-18',
        status: 'Submitted',
        description: `Build a modular prototype demonstrating the core design patterns of ${semesterSubjectsList[2]}. Include documentation and code repository.`,
        points: 100,
        submittedFile: 'project-submission.zip',
        feedback: 'Excellent implementation. Code is clean, well-documented, and fully follows formatting specifications. (95/100)'
      });
    }
    
    return mapped;
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssTitle, setNewAssTitle] = useState('');
  const [newAssSubject, setNewAssSubject] = useState('');
  const [newAssDueDate, setNewAssDueDate] = useState('');
  const [newAssDesc, setNewAssDesc] = useState('');
  const [newAssPoints, setNewAssPoints] = useState(100);

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (semesterSubjectsList.length > 0) {
      setNewAssSubject(semesterSubjectsList[0]);
    }
  }, [semesterSubjectsList]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('campus_ai_assignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filteredParsed = parsed.filter((ass: Assignment) => 
          semesterSubjectsList.includes(ass.subject)
        );
        if (filteredParsed.length > 0) {
          setAssignments(filteredParsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setAssignments(getDynamicDefaultAssignments());
  }, [user?.department, user?.semester]);

  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Submit modal state
  const [activeSubmitAss, setActiveSubmitAss] = useState<Assignment | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [comments, setComments] = useState<string>('');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssTitle.trim() || !newAssDesc.trim() || !newAssDueDate) return;
    const newAss: Assignment = {
      id: Date.now().toString(),
      title: newAssTitle.trim(),
      subject: newAssSubject || semesterSubjectsList[0] || 'Math',
      dueDate: newAssDueDate,
      status: 'Not Started',
      description: newAssDesc.trim(),
      points: newAssPoints,
    };
    setAssignments([newAss, ...assignments]);
    setNewAssTitle('');
    setNewAssDesc('');
    setNewAssDueDate('');
    setNewAssPoints(100);
    setShowCreateModal(false);
  };

  useEffect(() => {
    if (assignments.length > 0) {
      localStorage.setItem('campus_ai_assignments', JSON.stringify(assignments));
    }
  }, [assignments]);

  const handleStatusChange = (id: string, newStatus: 'Not Started' | 'In Progress' | 'Submitted', fileName?: string) => {
    setAssignments(prev =>
      prev.map(ass =>
        ass.id === id
          ? {
              ...ass,
              status: newStatus,
              submittedFile: fileName || ass.submittedFile
            }
          : ass
      )
    );
  };

  const handleOpenSubmitModal = (ass: Assignment) => {
    setActiveSubmitAss(ass);
    setUploadedFileName('');
    setComments('');
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitAss || !uploadedFileName) return;

    handleStatusChange(activeSubmitAss.id, 'Submitted', uploadedFileName);
    setActiveSubmitAss(null);
    setUploadedFileName('');
    setComments('');
  };

  const filtered = assignments.filter(ass => {
    const matchesSubject = selectedSubject === 'All' || ass.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'All' || ass.status === selectedStatus;
    const matchesSearch = ass.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ass.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    if (status === 'Submitted') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (status === 'In Progress') return <Clock className="w-5 h-5 text-blue-500" />;
    return <AlertCircle className="w-5 h-5 text-slate-400" />;
  };

  const getStatusClass = (status: string) => {
    if (status === 'Submitted') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'In Progress') return 'bg-blue-50 text-blue-700 border border-blue-100';
    return 'bg-slate-50 text-slate-600 border border-slate-100';
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            Academic Assignments
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            View coursework tasks, submit files, and review faculty grading feedback.
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </header>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By</span>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Subjects</option>
            {semesterSubjectsList.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg p-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
          </select>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(ass => (
            <div
              key={ass.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
                    {ass.subject}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Max Score: {ass.points} pts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${getStatusClass(ass.status)}`}>
                    {getStatusIcon(ass.status)}
                    <span>{ass.status}</span>
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">{ass.title}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed font-medium">
                  {ass.description}
                </p>
              </div>

              {ass.feedback && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-800">
                  👨‍🏫 Instructor Feedback: {ass.feedback}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Due by: {ass.dueDate}</span>
                </div>

                <div className="flex gap-2">
                  {ass.status !== 'Submitted' ? (
                    <>
                      {ass.status === 'Not Started' && (
                        <button
                          onClick={() => handleStatusChange(ass.id, 'In Progress')}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                        >
                          Mark In Progress
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenSubmitModal(ass)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" /> Submit Assignment
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold italic flex items-center gap-1">
                      Submitted File: <span className="underline select-all">{ass.submittedFile}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-dashed border-slate-250 p-12 text-center rounded-2xl">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No assignments matched your search.</p>
          </div>
        )}
      </div>

      {/* Upload/Submit Modal */}
      {activeSubmitAss && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSubmitAssignment} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Submit Assignment</h3>
              <button
                type="button"
                onClick={() => setActiveSubmitAss(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Target Task</p>
              <h4 className="font-bold text-slate-800 text-sm">{activeSubmitAss.title}</h4>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Upload File (Mock)</label>
              <input
                type="text"
                placeholder="e.g. project_file.pdf"
                value={uploadedFileName}
                onChange={(e) => setUploadedFileName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Remarks / Comments</label>
              <textarea
                rows={3}
                placeholder="Write any comments for the instructor..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Final Submit
              </button>
              <button
                type="button"
                onClick={() => setActiveSubmitAss(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {canCreate && showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateAssignment} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create New Assignment</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Assignment Title</label>
              <input type="text" placeholder="e.g. Binary Search Trees Lab" value={newAssTitle} onChange={(e) => setNewAssTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Subject</label>
                <select value={newAssSubject} onChange={(e) => setNewAssSubject(e.target.value)} className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none">
                  {semesterSubjectsList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Due Date</label>
                <input type="date" value={newAssDueDate} onChange={(e) => setNewAssDueDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Max Points</label>
              <input type="number" min="1" max="1000" value={newAssPoints} onChange={(e) => setNewAssPoints(parseInt(e.target.value) || 100)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Description / Instructions</label>
              <textarea rows={4} placeholder="Describe the assignment requirements..." value={newAssDesc} onChange={(e) => setNewAssDesc(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" required />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm">Publish Assignment</button>
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Assignments;
