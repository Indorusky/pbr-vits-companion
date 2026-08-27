import { useState, useEffect } from 'react';
import { Briefcase, Building, Landmark, GraduationCap, Calendar, Check, Send, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface JobOpening {
  id: string;
  role: string;
  company: string;
  package: string;
  eligibility: string;
  deadline: string;
  applied: boolean;
  type: 'Full-time' | 'Internship';
}

const INITIAL_JOBS: JobOpening[] = [
  {
    id: 'j1',
    role: 'Associate Software Development Engineer (ASDE)',
    company: 'Google DeepMind Technologies',
    package: '$145,000 / Year',
    eligibility: 'CGPA >= 8.5, Computer Science / IT Branch',
    deadline: 'Sep 15, 2026',
    applied: false,
    type: 'Full-time'
  },
  {
    id: 'j2',
    role: 'Applied AI Product Intern',
    company: 'OpenAI Corporation',
    package: '$8,500 / Month stipend',
    eligibility: 'CGPA >= 8.0, Experience with LLMs and prompt chains',
    deadline: 'Sep 05, 2026',
    applied: true,
    type: 'Internship'
  },
  {
    id: 'j3',
    role: 'Cybersecurity Threat Analyst',
    company: 'Stripe Payments Inc.',
    package: '$110,005 / Year',
    eligibility: 'CGPA >= 7.5, Python proficiency, Linux systems foundational knowledge',
    deadline: 'Sep 22, 2026',
    applied: false,
    type: 'Full-time'
  }
];

const Placements = () => {
  const { viewMode } = useAuth();
  const [jobs, setJobs] = useState<JobOpening[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_jobs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_JOBS;
  });

  // Create job fields
  const [showAddModal, setShowAddModal] = useState(false);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [pkg, setPkg] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [deadline, setDeadline] = useState('');
  const [type, setType] = useState<'Full-time' | 'Internship'>('Full-time');

  // Application modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeApplyJob, setActiveApplyJob] = useState<JobOpening | null>(null);
  const [applName, setApplName] = useState('');
  const [applEmail, setApplEmail] = useState('');
  const [applPhone, setApplPhone] = useState('');
  const [applResumeName, setApplResumeName] = useState('');

  useEffect(() => {
    localStorage.setItem('campus_ai_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const handleApplyClick = (job: JobOpening) => {
    if (job.applied) {
      setJobs(prev =>
        prev.map(j =>
          j.id === job.id ? { ...j, applied: false } : j
        )
      );
    } else {
      setActiveApplyJob(job);
      setShowApplyModal(true);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applName.trim() || !applEmail.trim() || !applPhone.trim() || !activeApplyJob) return;

    setJobs(prev =>
      prev.map(j =>
        j.id === activeApplyJob.id ? { ...j, applied: true } : j
      )
    );

    setApplName('');
    setApplEmail('');
    setApplPhone('');
    setApplResumeName('');
    setShowApplyModal(false);
    setActiveApplyJob(null);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !company.trim() || !pkg.trim()) return;

    const newJob: JobOpening = {
      id: Date.now().toString(),
      role: role.trim(),
      company: company.trim(),
      package: pkg.trim(),
      eligibility: eligibility.trim() || 'Open to all branches',
      deadline: deadline.trim() || 'TBD',
      applied: false,
      type
    };

    setJobs([newJob, ...jobs]);
    setRole('');
    setCompany('');
    setPkg('');
    setEligibility('');
    setDeadline('');
    setShowAddModal(false);
  };

  const isConfigurable = viewMode === 'admin';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Career & Placement Portal
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Discover ongoing recruitment opportunities, review compensation criteria, and apply.
          </p>
        </div>

        {isConfigurable && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Listing</span>
          </button>
        )}
      </header>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between h-72 group"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  job.type === 'Full-time'
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'bg-purple-50 text-purple-700 border border-purple-100'
                }`}>
                  {job.type}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Deadline: {job.deadline}</span>
                </span>
              </div>

              <h3 className="font-extrabold text-lg text-slate-800 mt-4 leading-tight group-hover:text-blue-600 transition-colors">
                {job.role}
              </h3>
              <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{job.company}</span>
              </p>

              <div className="mt-4 space-y-1.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-slate-400" />
                  <span>Package: <strong className="text-slate-800">{job.package}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 text-purple-600" />
                  <span>Eligibility: <strong className="text-slate-800">{job.eligibility}</strong></span>
                </div>
              </div>
            </div>

            {/* Action Bottom */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-4">
              <span className="text-xs font-bold text-slate-400">
                {job.applied ? '🎉 Application Submitted' : 'Eligible'}
              </span>

              <button
                onClick={() => handleApplyClick(job)}
                className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                  job.applied
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {job.applied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateJob} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Job Listing</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Job Role Title</label>
              <input
                type="text"
                placeholder="e.g. Associate Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Job Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Salary Package</label>
                <input
                  type="text"
                  placeholder="e.g. $145,000 / Year"
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Application Deadline</label>
                <input
                  type="text"
                  placeholder="e.g. Sep 15, 2026"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Eligibility Criteria</label>
              <input
                type="text"
                placeholder="e.g. CGPA >= 8.5, Computer Science branch"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Publish Job
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

      {/* Apply Job Modal */}
      {showApplyModal && activeApplyJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleApplySubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Job Application</h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeApplyJob.role} at {activeApplyJob.company}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowApplyModal(false);
                  setActiveApplyJob(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={applName}
                onChange={(e) => setApplName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Email ID</label>
              <input
                type="email"
                placeholder="e.g. email@example.com"
                value={applEmail}
                onChange={(e) => setApplEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +1 (555) 000-0000"
                value={applPhone}
                onChange={(e) => setApplPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Upload Resume</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-colors relative cursor-pointer">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-10 w-10 text-slate-400 animate-pulse"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-slate-600 justify-center">
                    <span className="relative font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      Upload a file
                    </span>
                    <input
                      id="resume-upload"
                      name="resume-upload"
                      type="file"
                      className="sr-only absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setApplResumeName(e.target.files[0].name);
                        }
                      }}
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">PDF, DOC, DOCX up to 10MB</p>
                  {applResumeName && (
                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-200 inline-block mt-2">
                      Selected: {applResumeName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Submit Application
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowApplyModal(false);
                  setActiveApplyJob(null);
                }}
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

export default Placements;
