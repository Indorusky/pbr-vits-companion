import { useState, useEffect } from 'react';
import { Megaphone, Calendar, Tag, Plus, X, Search, BellRing } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  important: boolean;
  postedBy: string;
}

const DEFAULT_NOTICES: Notice[] = [
  {
    id: '1',
    title: 'Midterm Schedules & Admit Cards Out',
    content: 'All students are requested to download their admit cards for the midterm examination commencing from Oct 15, 2026. Make sure your dues are cleared in the admin block.',
    date: 'Yesterday',
    important: true,
    postedBy: 'Dean Academics'
  },
  {
    id: '2',
    title: 'Extended Library Timing for Midterms',
    content: 'The campus library will remain open until 12:00 AM midnight starting next week to assist students with their self-study preparation. Security passes are mandatory post 9 PM.',
    date: '2 days ago',
    important: false,
    postedBy: 'Chief Librarian'
  },
  {
    id: '3',
    title: 'National AI Hackathon - Registration Deadline Extension',
    content: 'The registration deadline for the CodeRed AI hackathon is extended by 3 days. Students can apply via the portal until Sep 08, 2026.',
    date: '3 days ago',
    important: true,
    postedBy: 'CS HOD'
  }
];

const Announcements = () => {
  const { user, viewMode } = useAuth();
  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_notices');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_NOTICES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImportant, setNewImportant] = useState(false);

  useEffect(() => {
    localStorage.setItem('campus_ai_notices', JSON.stringify(notices));
  }, [notices]);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const notice: Notice = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      date: 'Just now',
      important: newImportant,
      postedBy: user?.name || 'Faculty Member'
    };

    setNotices([notice, ...notices]);
    setNewTitle('');
    setNewContent('');
    setNewImportant(false);
    setShowAddModal(false);
  };

  const filtered = notices.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canPost = viewMode === 'faculty' || viewMode === 'admin';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-blue-600" />
            College Bulletin Board
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Stay updated with college circulars, administrative releases, and department notices.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        )}
      </header>

      {/* Search notices */}
      <div className="relative max-w-md bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search circulars..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Notices Feed */}
      <div className="space-y-6">
        {filtered.length > 0 ? (
          filtered.map(notice => (
            <div
              key={notice.id}
              className={`bg-white rounded-3xl p-6 shadow-sm border transition-all flex flex-col justify-between gap-4 ${
                notice.important ? 'border-l-4 border-l-red-500 border-slate-100 shadow-red-50/20' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">By: {notice.postedBy}</span>
                  {notice.important && (
                    <span className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <BellRing className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {notice.date}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">{notice.title}</h3>
                <p className="text-sm text-slate-655 mt-2 leading-relaxed font-medium">
                  {notice.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-dashed border-slate-250 p-12 text-center rounded-2xl">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No circulars posted yet.</p>
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handlePostNotice} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Publish Announcement</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Notice Title</label>
              <input
                type="text"
                placeholder="e.g. Laboratory Maintenance Schedule"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Notice Body / Circular Details</label>
              <textarea
                rows={4}
                placeholder="Describe circular terms..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="important"
                checked={newImportant}
                onChange={(e) => setNewImportant(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <label htmlFor="important" className="text-xs font-bold text-slate-700">Mark as Important / Urgent Alert</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Publish Notice
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

export default Announcements;
