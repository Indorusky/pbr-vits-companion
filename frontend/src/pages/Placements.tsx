import { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Building, 
  Landmark, 
  GraduationCap, 
  Calendar, 
  Check, 
  Send, 
  Plus, 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  Search, 
  Filter, 
  Award, 
  ExternalLink, 
  Eye, 
  Trash2, 
  Edit3, 
  CalendarCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStudentAcademicProfile } from '../utils/academicData';

export interface JobOpening {
  id: string;
  role: string;
  company: string;
  package: string;
  eligibility: string;
  minCgpa: number;
  deadline: string;
  type: 'Full-time' | 'Internship';
  location: string;
  description: string;
  skills: string[];
  postedDate: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobRole: string;
  company: string;
  studentId: string | number;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  studentPhone: string;
  studentDept: string;
  studentCgpa: number;
  resumeFileName: string;
  resumeFileData?: string; // base64
  resumeUrl?: string;
  coverNote?: string;
  appliedAt: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted for Interview' | 'Interview Scheduled' | 'Not Shortlisted' | 'Selected';
  interviewDate?: string;
  interviewNotes?: string;
}

const INITIAL_JOBS: JobOpening[] = [
  {
    id: 'j1',
    role: 'Associate Software Development Engineer (ASDE)',
    company: 'Google DeepMind Technologies',
    package: '$145,000 / Year (₹32.5 LPA)',
    eligibility: 'CGPA >= 8.5, Computer Science / AI / IT Branch',
    minCgpa: 8.5,
    deadline: 'Sep 15, 2026',
    type: 'Full-time',
    location: 'Hyderabad / Bangalore (Hybrid)',
    description: 'Build core AI infrastructure, scalable backend APIs, and distributed deep learning training pipelines.',
    skills: ['Python', 'Distributed Systems', 'C++', 'PyTorch', 'Data Structures & Algorithms'],
    postedDate: 'Aug 20, 2026'
  },
  {
    id: 'j2',
    role: 'Applied AI Product Engineering Intern',
    company: 'OpenAI Corporation',
    package: '$8,500 / Month Stipend',
    eligibility: 'CGPA >= 8.0, Experience with LLMs and prompt chains',
    minCgpa: 8.0,
    deadline: 'Sep 05, 2026',
    type: 'Internship',
    location: 'Remote / Bangalore',
    description: 'Design generative workflows, evaluate transformer benchmarks, and build multimodal applications.',
    skills: ['Generative AI', 'Transformers', 'FastAPI', 'React', 'LangChain'],
    postedDate: 'Aug 22, 2026'
  },
  {
    id: 'j3',
    role: 'Cybersecurity Threat & Network Analyst',
    company: 'Stripe Payments Inc.',
    package: '$110,000 / Year (₹24 LPA)',
    eligibility: 'CGPA >= 7.5, Python proficiency, Linux systems foundational knowledge',
    minCgpa: 7.5,
    deadline: 'Sep 22, 2026',
    type: 'Full-time',
    location: 'Hyderabad Campus',
    description: 'Monitor threat vectors, analyze encrypted financial transaction flows, and maintain network zero-trust.',
    skills: ['Network Security', 'Cryptography', 'Python', 'Linux', 'SIEM'],
    postedDate: 'Aug 24, 2026'
  },
  {
    id: 'j4',
    role: 'Cloud Infrastructure & DevOps Engineer',
    company: 'Amazon Web Services (AWS)',
    package: '$125,000 / Year (₹28 LPA)',
    eligibility: 'CGPA >= 7.8, Cloud computing & container orchestration',
    minCgpa: 7.8,
    deadline: 'Sep 28, 2026',
    type: 'Full-time',
    location: 'Hyderabad / Chennai',
    description: 'Architect resilient serverless clusters, Kubernetes microservices, and CI/CD automated deployment pipelines.',
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    postedDate: 'Aug 25, 2026'
  }
];

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_101',
    jobId: 'j1',
    jobRole: 'Associate Software Development Engineer (ASDE)',
    company: 'Google DeepMind Technologies',
    studentId: 1,
    studentName: 'Ravi Prakash Bayireddy',
    studentRoll: '2273A01001',
    studentEmail: 'ravi.prakash@pbrvits.edu.in',
    studentPhone: '+91 98765 43210',
    studentDept: 'Computer Science and Engineering (CSE)',
    studentCgpa: 8.74,
    resumeFileName: 'Ravi_Prakash_CSE_Resume_2026.pdf',
    resumeUrl: 'https://github.com/Indorusky',
    coverNote: 'Passionate about distributed deep learning systems, transformer inference optimization, and full-stack web platforms.',
    appliedAt: 'Aug 26, 2026',
    status: 'Shortlisted for Interview',
    interviewDate: 'Sep 10, 2026 • 10:00 AM IST (Google Meet)',
    interviewNotes: 'Round 1 Technical Screening: Data Structures, Distributed Systems & LLM Architectures.'
  },
  {
    id: 'app_102',
    jobId: 'j2',
    jobRole: 'Applied AI Product Engineering Intern',
    company: 'OpenAI Corporation',
    studentId: 3,
    studentName: 'Priya Mohan',
    studentRoll: '2273A01003',
    studentEmail: 'priya.m@pbrvits.edu.in',
    studentPhone: '+91 98450 11223',
    studentDept: 'Computer Science and Engineering (CSE)',
    studentCgpa: 9.50,
    resumeFileName: 'Priya_Mohan_AI_CV.pdf',
    coverNote: 'Experienced in building Retrieval-Augmented Generation (RAG) pipelines and fine-tuning open-source LLMs.',
    appliedAt: 'Aug 27, 2026',
    status: 'Interview Scheduled',
    interviewDate: 'Sep 08, 2026 • 02:30 PM IST (Virtual)',
    interviewNotes: 'Round 1 Coding & AI System Design Interview.'
  }
];

const Placements = () => {
  const { user, viewMode } = useAuth();
  const isAdminOrFaculty = viewMode === 'admin' || viewMode === 'faculty';
  const isStudent = !isAdminOrFaculty;

  const [activeTab, setActiveTab] = useState<'openings' | 'my-applications' | 'admin-applicants'>(
    isAdminOrFaculty ? 'openings' : 'openings'
  );

  const [jobs, setJobs] = useState<JobOpening[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_jobs');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return INITIAL_JOBS;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_job_applications');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return INITIAL_APPLICATIONS;
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantFilterStatus, setApplicantFilterStatus] = useState('ALL');
  const [applicantFilterJob, setApplicantFilterJob] = useState('ALL');

  // Create/Edit job modal state (Admin)
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobPkg, setJobPkg] = useState('');
  const [jobEligibility, setJobEligibility] = useState('');
  const [jobMinCgpa, setJobMinCgpa] = useState(7.5);
  const [jobDeadline, setJobDeadline] = useState('');
  const [jobType, setJobType] = useState<'Full-time' | 'Internship'>('Full-time');
  const [jobLocation, setJobLocation] = useState('Hyderabad Campus / Remote');
  const [jobDesc, setJobDesc] = useState('');
  const [jobSkills, setJobSkills] = useState('Python, Data Structures, Machine Learning');

  // Student Application Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJobToApply, setSelectedJobToApply] = useState<JobOpening | null>(null);
  const [applName, setApplName] = useState('');
  const [applEmail, setApplEmail] = useState('');
  const [applPhone, setApplPhone] = useState('');
  const [applRoll, setApplRoll] = useState('');
  const [applDept, setApplDept] = useState('');
  const [applCgpa, setApplCgpa] = useState(8.5);
  const [applResumeName, setApplResumeName] = useState('');
  const [applResumeData, setApplResumeData] = useState<string | undefined>();
  const [applResumeUrl, setApplResumeUrl] = useState('');
  const [applCoverNote, setApplCoverNote] = useState('');

  // Admin Shortlist / Interview Scheduling Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppToSchedule, setSelectedAppToSchedule] = useState<JobApplication | null>(null);
  const [interviewDateInput, setInterviewDateInput] = useState('');
  const [interviewNotesInput, setInterviewNotesInput] = useState('');
  const [newStatusInput, setNewStatusInput] = useState<JobApplication['status']>('Shortlisted for Interview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('campus_ai_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('campus_ai_job_applications', JSON.stringify(applications));
  }, [applications]);

  // Open apply modal with pre-filled student details
  const handleOpenApplyModal = (job: JobOpening) => {
    setSelectedJobToApply(job);
    const academicProfile = getStudentAcademicProfile(user);

    setApplName(user?.name || user?.username || 'Student User');
    setApplEmail(user?.email || `${user?.username || 'student'}@pbrvits.edu.in`);
    setApplPhone('+91 98765 43210');
    setApplRoll(user?.roll_number || '2273A01001');
    setApplDept(user?.department || 'Computer Science and Engineering (CSE)');
    setApplCgpa(academicProfile.cgpa || 8.74);
    setApplResumeName(`${(user?.name || user?.username || 'Student').replace(/\s+/g, '_')}_Resume_2026.pdf`);
    setApplResumeUrl('');
    setApplCoverNote('');
    setShowApplyModal(true);
  };

  // Handle Resume File Upload
  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setApplResumeName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setApplResumeData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit Student Application
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobToApply || !applName.trim() || !applEmail.trim() || !applPhone.trim()) {
      alert("Please complete the required applicant fields.");
      return;
    }

    if (!applResumeName && !applResumeUrl.trim()) {
      alert("Please upload your resume file (.pdf/.docx) or provide a cloud portfolio link.");
      return;
    }

    // Check if already applied
    const alreadyApplied = applications.some(
      a => a.jobId === selectedJobToApply.id && 
      (a.studentRoll.toLowerCase() === applRoll.toLowerCase() || a.studentEmail.toLowerCase() === applEmail.toLowerCase())
    );

    if (alreadyApplied) {
      alert(`You have already submitted an application for ${selectedJobToApply.role} at ${selectedJobToApply.company}.`);
      setShowApplyModal(false);
      return;
    }

    const newApp: JobApplication = {
      id: `app_${Date.now()}`,
      jobId: selectedJobToApply.id,
      jobRole: selectedJobToApply.role,
      company: selectedJobToApply.company,
      studentId: user?.id || Date.now(),
      studentName: applName.trim(),
      studentRoll: applRoll.trim() || '2273A01001',
      studentEmail: applEmail.trim(),
      studentPhone: applPhone.trim(),
      studentDept: applDept.trim(),
      studentCgpa: applCgpa,
      resumeFileName: applResumeName || 'Candidate_Resume.pdf',
      resumeFileData: applResumeData,
      resumeUrl: applResumeUrl.trim(),
      coverNote: applCoverNote.trim(),
      appliedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Applied'
    };

    setApplications([newApp, ...applications]);
    setShowApplyModal(false);
    setSelectedJobToApply(null);
    alert(`🎉 Application for ${newApp.jobRole} at ${newApp.company} submitted successfully! The placement committee has received your resume.`);
    setActiveTab('my-applications');
  };

  // Admin Create / Update Job Opening
  const handleSaveJobOpening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole.trim() || !jobCompany.trim() || !jobPkg.trim()) {
      alert("Please fill in role, company name, and package details.");
      return;
    }

    const skillList = jobSkills.split(',').map(s => s.trim()).filter(Boolean);

    if (editingJobId) {
      setJobs(prev => prev.map(j => j.id === editingJobId ? {
        ...j,
        role: jobRole.trim(),
        company: jobCompany.trim(),
        package: jobPkg.trim(),
        eligibility: jobEligibility.trim() || `CGPA >= ${jobMinCgpa}`,
        minCgpa: jobMinCgpa,
        deadline: jobDeadline.trim() || 'TBD',
        type: jobType,
        location: jobLocation.trim(),
        description: jobDesc.trim(),
        skills: skillList
      } : j));
      alert(`Job listing for ${jobCompany} updated successfully!`);
    } else {
      const newJob: JobOpening = {
        id: `job_${Date.now()}`,
        role: jobRole.trim(),
        company: jobCompany.trim(),
        package: jobPkg.trim(),
        eligibility: jobEligibility.trim() || `CGPA >= ${jobMinCgpa}, CSE/IT Branches`,
        minCgpa: jobMinCgpa,
        deadline: jobDeadline.trim() || 'Oct 15, 2026',
        type: jobType,
        location: jobLocation.trim() || 'Hyderabad Campus',
        description: jobDesc.trim() || 'Exciting software engineering role at a leading technology partner.',
        skills: skillList.length > 0 ? skillList : ['Java', 'Python', 'Web Technologies'],
        postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      };
      setJobs([newJob, ...jobs]);
      alert(`🎉 New campus recruitment drive for "${newJob.company}" published!`);
    }

    setShowAddJobModal(false);
    setEditingJobId(null);
    setJobRole('');
    setJobCompany('');
    setJobPkg('');
    setJobEligibility('');
    setJobDeadline('');
  };

  const openEditJobModal = (job: JobOpening, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingJobId(job.id);
    setJobRole(job.role);
    setJobCompany(job.company);
    setJobPkg(job.package);
    setJobEligibility(job.eligibility);
    setJobMinCgpa(job.minCgpa || 7.5);
    setJobDeadline(job.deadline);
    setJobType(job.type);
    setJobLocation(job.location);
    setJobDesc(job.description);
    setJobSkills(job.skills.join(', '));
    setShowAddJobModal(true);
  };

  const handleDeleteJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this recruitment opening?")) {
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setApplications(prev => prev.filter(a => a.jobId !== jobId));
    }
  };

  // Admin Change Status / Schedule Interview
  const handleUpdateApplicationStatus = (
    appId: string, 
    newStatus: JobApplication['status'],
    dateStr?: string,
    notesStr?: string
  ) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          status: newStatus,
          interviewDate: dateStr || app.interviewDate,
          interviewNotes: notesStr || app.interviewNotes
        };
      }
      return app;
    }));
  };

  const openScheduleInterviewModal = (app: JobApplication) => {
    setSelectedAppToSchedule(app);
    setNewStatusInput(app.status === 'Applied' ? 'Shortlisted for Interview' : app.status);
    setInterviewDateInput(app.interviewDate || 'Sep 12, 2026 • 11:00 AM IST (Virtual / Campus)');
    setInterviewNotesInput(app.interviewNotes || 'Round 1 Technical Interview: Core Fundamentals, Coding & System Logic.');
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    if (!selectedAppToSchedule) return;
    handleUpdateApplicationStatus(
      selectedAppToSchedule.id,
      newStatusInput,
      interviewDateInput,
      interviewNotesInput
    );
    alert(`Applicant ${selectedAppToSchedule.studentName} updated to status: "${newStatusInput}"!`);
    setShowScheduleModal(false);
    setSelectedAppToSchedule(null);
  };

  // Filtered jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'ALL' || job.type === filterType;
    return matchesSearch && matchesType;
  });

  // Filtered student applications (My Applications)
  const myApplications = applications.filter(a => {
    const userRoll = (user?.roll_number || '').toLowerCase();
    const userUname = (user?.username || '').toLowerCase();
    const userEmail = (user?.email || '').toLowerCase();
    return (
      a.studentRoll.toLowerCase() === userRoll ||
      a.studentName.toLowerCase().includes(userUname) ||
      a.studentEmail.toLowerCase() === userEmail ||
      (a.studentRoll.toLowerCase() === '2273a01001')
    );
  });

  // Filtered Admin applications
  const filteredAdminApplications = applications.filter(a => {
    const matchesSearch = !applicantSearch ||
      a.studentName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.studentRoll.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.company.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.jobRole.toLowerCase().includes(applicantSearch.toLowerCase());
    const matchesStatus = applicantFilterStatus === 'ALL' || a.status === applicantFilterStatus;
    const matchesJob = applicantFilterJob === 'ALL' || a.jobId === applicantFilterJob;
    return matchesSearch && matchesStatus && matchesJob;
  });

  // User academic profile for eligibility check
  const studentAcademic = getStudentAcademicProfile(user);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen pb-28">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
              Campus Placement & Training Cell
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Career & Placement Portal
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Verified corporate recruitment drives, resume attachments, application tracking, and interview management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrFaculty && (
            <button
              onClick={() => {
                setEditingJobId(null);
                setJobRole('');
                setJobCompany('');
                setJobPkg('');
                setJobEligibility('');
                setJobDeadline('');
                setShowAddJobModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job Opening</span>
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs flex gap-2">
        <button
          onClick={() => setActiveTab('openings')}
          className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'openings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Campus Recruitment Drives ({jobs.length})
        </button>

        {isStudent && (
          <button
            onClick={() => setActiveTab('my-applications')}
            className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'my-applications'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Applications ({myApplications.length})
          </button>
        )}

        {isAdminOrFaculty && (
          <button
            onClick={() => setActiveTab('admin-applicants')}
            className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin-applicants'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Applicant Review & Interview Approval ({applications.length})
          </button>
        )}
      </div>

      {/* 1. Job Openings Tab */}
      {activeTab === 'openings' && (
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search job roles, companies, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Opportunity Types</option>
                <option value="Full-time">Full-time Roles</option>
                <option value="Internship">Internships</option>
              </select>
            </div>
          </div>

          {/* Job Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => {
              const hasApplied = applications.some(
                a => a.jobId === job.id && 
                (a.studentRoll.toLowerCase() === (user?.roll_number || '').toLowerCase() || 
                 a.studentEmail.toLowerCase() === (user?.email || '').toLowerCase() ||
                 (a.studentRoll.toLowerCase() === '2273a01001' && (user?.roll_number || '').toLowerCase() === '2273a01001'))
              );
              const userApp = applications.find(a => a.jobId === job.id && (a.studentRoll.toLowerCase() === (user?.roll_number || '').toLowerCase() || a.studentRoll.toLowerCase() === '2273a01001'));
              const isEligible = (studentAcademic.cgpa || 8.74) >= job.minCgpa;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                        job.type === 'Full-time'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {job.type}
                      </span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline: {job.deadline}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors leading-snug">
                        {job.role}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-800">{job.company}</span> • <span>{job.location}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="space-y-1.5 text-xs font-bold text-slate-700 pt-1">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-emerald-600" />
                        <span>Compensation: <strong className="text-emerald-700">{job.package}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        <span>Eligibility: <strong className="text-slate-900">{job.eligibility}</strong></span>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.map((sk, sIdx) => (
                        <span key={sIdx} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {hasApplied ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Status: {userApp?.status || 'Applied'}</span>
                        </span>
                      ) : isEligible ? (
                        <span className="text-xs font-bold text-blue-600">Eligible to Apply (CGPA {studentAcademic.cgpa.toFixed(2)})</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600">Min CGPA required: {job.minCgpa}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdminOrFaculty ? (
                        <>
                          <button
                            onClick={(e) => openEditJobModal(job, e)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                            title="Edit Job"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteJob(job.id, e)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all"
                            title="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenApplyModal(job)}
                          disabled={hasApplied}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs ${
                            hasApplied
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {hasApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Applied</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Apply with Resume</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="col-span-full p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 font-bold space-y-2">
                <Briefcase className="w-8 h-8 mx-auto text-slate-300" />
                <p>No job listings match your query.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. My Applications Tab (Student View) */}
      {activeTab === 'my-applications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {myApplications.map((app) => (
              <div key={app.id} className="p-5 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Application #{app.id} • Applied {app.appliedAt}</span>
                    <h3 className="text-base font-black text-slate-900 leading-snug">{app.jobRole}</h3>
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {app.company}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold self-start sm:self-auto border ${
                    app.status === 'Shortlisted for Interview' || app.status === 'Interview Scheduled'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : app.status === 'Selected'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : app.status === 'Not Shortlisted'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {app.status}
                  </span>
                </div>

                {/* Resume Attached & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Attached Resume File:</span>
                      <span className="font-bold text-slate-800">{app.resumeFileName}</span>
                    </div>
                  </div>

                  {app.resumeUrl && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">Portfolio / Link:</span>
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline truncate block max-w-[200px]">
                          {app.resumeUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interview Information Banner if Scheduled */}
                {(app.status === 'Shortlisted for Interview' || app.status === 'Interview Scheduled') && app.interviewDate && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1 text-xs text-emerald-900">
                    <div className="flex items-center gap-1.5 font-black text-emerald-800">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <span>Interview Scheduled: {app.interviewDate}</span>
                    </div>
                    {app.interviewNotes && (
                      <p className="text-emerald-700 font-medium pl-5.5">
                        Instructions: {app.interviewNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {myApplications.length === 0 && (
              <div className="p-12 text-center text-slate-400 font-bold space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p>You haven't submitted any job applications yet.</p>
                <button
                  onClick={() => setActiveTab('openings')}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Browse Campus Drives
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Recruiter / Admin Applicant Review Tab */}
      {isAdminOrFaculty && activeTab === 'admin-applicants' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by student name or roll..."
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={applicantFilterJob}
                onChange={(e) => setApplicantFilterJob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Recruitment Drives</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.company} - {j.role}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={applicantFilterStatus}
                onChange={(e) => setApplicantFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted for Interview">Shortlisted for Interview</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Not Shortlisted">Not Shortlisted</option>
                <option value="Selected">Selected</option>
              </select>
            </div>
          </div>

          {/* Applicant Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200">
                    <th className="p-3.5 font-bold">Candidate Name</th>
                    <th className="p-3.5 font-bold">Roll Number</th>
                    <th className="p-3.5 font-bold">Applied Company & Role</th>
                    <th className="p-3.5 font-bold">CGPA</th>
                    <th className="p-3.5 font-bold">Resume Attachment</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-center">Recruiter Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAdminApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-black text-slate-900">
                        <div>{app.studentName}</div>
                        <span className="text-[10px] text-slate-400 font-medium">{app.studentEmail}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">{app.studentRoll}</td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900">{app.company}</div>
                        <span className="text-[10px] text-slate-500 font-medium">{app.jobRole}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                          {app.studentCgpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-blue-600">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[140px]" title={app.resumeFileName}>{app.resumeFileName}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                          app.status === 'Shortlisted for Interview' || app.status === 'Interview Scheduled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.status === 'Selected'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : app.status === 'Not Shortlisted'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openScheduleInterviewModal(app)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 transition-all flex items-center gap-1"
                          >
                            <CalendarCheck className="w-3.5 h-3.5" />
                            <span>Review & Schedule</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredAdminApplications.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">
                        No candidate applications match the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student Apply Modal with Resume Upload */}
      {showApplyModal && selectedJobToApply && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if(e.target === e.currentTarget) setShowApplyModal(false); }}
        >
          <form 
            onSubmit={handleSubmitApplication}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">Placement Application</span>
                <h3 className="text-base font-black text-slate-900">{selectedJobToApply.role}</h3>
                <p className="text-xs text-slate-500 font-bold">{selectedJobToApply.company} • Package: {selectedJobToApply.package}</p>
              </div>
              <button type="button" onClick={() => setShowApplyModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Profile Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={applName}
                  onChange={(e) => setApplName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Roll Number</label>
                <input
                  type="text"
                  value={applRoll}
                  onChange={(e) => setApplRoll(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={applEmail}
                  onChange={(e) => setApplEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={applPhone}
                  onChange={(e) => setApplPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={applDept}
                  onChange={(e) => setApplDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Current Cumulative CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={applCgpa}
                  onChange={(e) => setApplCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="border border-blue-200 bg-blue-50/40 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Attach Resume Document (.pdf, .docx)
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                >
                  Choose File
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleResumeFileUpload}
                className="hidden"
              />

              {applResumeName ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-blue-200 text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{applResumeName}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-extrabold">Ready</span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 font-medium">No file chosen yet. Click 'Choose File' above to attach your resume.</p>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Or Cloud Portfolio / Resume URL (GitHub / LinkedIn / Google Drive)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/your-resume-link or github.com/..."
                  value={applResumeUrl}
                  onChange={(e) => setApplResumeUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Cover Note */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Key Technical Highlights / Cover Note</label>
              <textarea
                rows={2}
                placeholder="Briefly describe your relevant projects and technical experience..."
                value={applCoverNote}
                onChange={(e) => setApplCoverNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit Job Application</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Post/Edit Job Modal */}
      {showAddJobModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if(e.target === e.currentTarget) setShowAddJobModal(false); }}
        >
          <form 
            onSubmit={handleSaveJobOpening}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingJobId ? 'Edit Job Opening' : 'Post Campus Recruitment Drive'}
                </h3>
                <p className="text-xs text-slate-500">Configure recruitment role, compensation, and eligibility criteria.</p>
              </div>
              <button type="button" onClick={() => setShowAddJobModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Job Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Associate Software Engineer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Microsoft India"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">CTC Package / Stipend</label>
                <input
                  type="text"
                  placeholder="e.g. ₹18.5 LPA or ₹45,000/mo"
                  value={jobPkg}
                  onChange={(e) => setJobPkg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Opportunity Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="Full-time">Full-time Placement</option>
                  <option value="Internship">Pre-Placement Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Minimum CGPA Required</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10.0"
                  value={jobMinCgpa}
                  onChange={(e) => setJobMinCgpa(parseFloat(e.target.value) || 7.0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Application Deadline</label>
                <input
                  type="text"
                  placeholder="e.g. Oct 15, 2026"
                  value={jobDeadline}
                  onChange={(e) => setJobDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Location & Work Mode</label>
              <input
                type="text"
                placeholder="e.g. Hyderabad / Bangalore (Hybrid)"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Required Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Java, Spring Boot, React, SQL, Cloud"
                value={jobSkills}
                onChange={(e) => setJobSkills(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Job Description</label>
              <textarea
                rows={2}
                placeholder="Describe role responsibilities and qualifications..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddJobModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                {editingJobId ? 'Save Changes' : 'Publish Drive'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recruiter Schedule Interview & Approval Modal */}
      {showScheduleModal && selectedAppToSchedule && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => { if(e.target === e.currentTarget) setShowScheduleModal(false); }}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 my-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">Candidate Review & Interview Approval</span>
                <h3 className="text-base font-black text-slate-900">{selectedAppToSchedule.studentName}</h3>
                <p className="text-xs text-slate-500 font-bold">
                  Roll: {selectedAppToSchedule.studentRoll} • CGPA: {selectedAppToSchedule.studentCgpa.toFixed(2)} • {selectedAppToSchedule.company}
                </p>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resume Details */}
            <div className="bg-slate-50 p-3.5 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-slate-800">Resume: {selectedAppToSchedule.resumeFileName}</span>
              </div>
              {selectedAppToSchedule.coverNote && (
                <p className="text-slate-600 italic pl-6 text-[11px]">"{selectedAppToSchedule.coverNote}"</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Update Candidate Status</label>
              <select
                value={newStatusInput}
                onChange={(e) => setNewStatusInput(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="Applied">Applied (Pending Review)</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted for Interview">Shortlisted for Interview</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Selected">Selected / Offer Extended</option>
                <option value="Not Shortlisted">Not Shortlisted / Rejected</option>
              </select>
            </div>

            {(newStatusInput === 'Shortlisted for Interview' || newStatusInput === 'Interview Scheduled') && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Interview Date, Time & Venue / Link</label>
                  <input
                    type="text"
                    value={interviewDateInput}
                    onChange={(e) => setInterviewDateInput(e.target.value)}
                    placeholder="e.g. Sep 10, 2026 • 10:00 AM IST (Google Meet)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Interview Round Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={interviewNotesInput}
                    onChange={(e) => setInterviewNotesInput(e.target.value)}
                    placeholder="e.g. Technical Round 1: Coding, Data Structures & System Design."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Save Candidate Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Placements;
