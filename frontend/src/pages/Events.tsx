import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Ticket, Check, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EventItem {
  id: string;
  title: string;
  category: 'Hackathon' | 'Cultural' | 'Workshop' | 'Seminar';
  date: string;
  location: string;
  registered: boolean;
  maxAttendees?: number;
  description: string;
  bannerGradient: string;
  entryFee?: string;
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'CodeRed National AI Hackathon 2026',
    category: 'Hackathon',
    date: 'Sep 10-12, 2026',
    location: 'Campus Auditorium & Labs',
    registered: false,
    maxAttendees: 500,
    description: '48-hour challenge to design AI agents solving real college ecosystems or sustainability issues. Grand prize is $5,000.',
    bannerGradient: 'from-blue-600 to-cyan-500',
    entryFee: '$10'
  },
  {
    id: 'e2',
    title: 'RhythmFest 2026 Annual Cultural Show',
    category: 'Cultural',
    date: 'Oct 02, 2026',
    location: 'Main Open Theater',
    registered: false,
    description: 'Celebration of music, dance, theatrical acts, and fashion shows representing universities nationwide.',
    bannerGradient: 'from-purple-600 to-pink-500',
    entryFee: '$5'
  },
  {
    id: 'e3',
    title: 'Advanced React & WebAssembly Masterclass',
    category: 'Workshop',
    date: 'Sep 05, 2026',
    location: 'Seminar Room 302',
    registered: true,
    maxAttendees: 80,
    description: 'Learn modern compiler toolchains, building rust targets, loading wasm in React rendering cycles, and optimizing paint timelines.',
    bannerGradient: 'from-emerald-600 to-teal-500',
    entryFee: 'Free'
  }
];

const Events = () => {
  const { viewMode } = useAuth();
  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem('campus_ai_events');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_EVENTS;
  });

  // Create event modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Hackathon' | 'Cultural' | 'Workshop' | 'Seminar'>('Hackathon');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [entryFeeInput, setEntryFeeInput] = useState('');

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activeRegisterEvent, setActiveRegisterEvent] = useState<EventItem | null>(null);
  const [regName, setRegName] = useState('');
  const [regYear, setRegYear] = useState('1st Year');
  const [regBranch, setRegBranch] = useState('');
  const [regMobile, setRegMobile] = useState('');

  useEffect(() => {
    localStorage.setItem('campus_ai_events', JSON.stringify(events));
  }, [events]);

  const handleRegisterClick = (evt: EventItem) => {
    if (evt.registered) {
      setEvents(prev =>
        prev.map(e =>
          e.id === evt.id ? { ...e, registered: false } : e
        )
      );
    } else {
      setActiveRegisterEvent(evt);
      setShowRegisterModal(true);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regBranch.trim() || !regMobile.trim() || !activeRegisterEvent) return;

    setEvents(prev =>
      prev.map(evt =>
        evt.id === activeRegisterEvent.id ? { ...evt, registered: true } : evt
      )
    );

    setRegName('');
    setRegYear('1st Year');
    setRegBranch('');
    setRegMobile('');
    setShowRegisterModal(false);
    setActiveRegisterEvent(null);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !location.trim()) return;

    const gradients = {
      Hackathon: 'from-blue-600 to-cyan-500',
      Cultural: 'from-purple-600 to-pink-500',
      Workshop: 'from-emerald-600 to-teal-500',
      Seminar: 'from-orange-600 to-amber-500'
    };

    const newEvt: EventItem = {
      id: Date.now().toString(),
      title: title.trim(),
      category,
      date: date.trim(),
      location: location.trim(),
      registered: false,
      description: desc.trim() || 'No description provided.',
      bannerGradient: gradients[category],
      entryFee: entryFeeInput.trim() || undefined
    };

    setEvents([newEvt, ...events]);
    setTitle('');
    setDate('');
    setLocation('');
    setDesc('');
    setEntryFeeInput('');
    setShowAddModal(false);
  };

  const isConfigurable = viewMode === 'admin';

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-blue-600" />
            Campus Events & Hackathons
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Explore cultural celebrations, webinars, and programming contests.
          </p>
        </div>

        {isConfigurable && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        )}
      </header>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
          >
            {/* Banner Header */}
            <div className={`p-6 bg-gradient-to-r ${evt.bannerGradient} text-white space-y-2`}>
              <span className="text-[10px] font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {evt.category}
              </span>
              <h3 className="font-extrabold text-xl leading-tight">{evt.title}</h3>
            </div>

            {/* Description & details */}
            <div className="p-6 space-y-4 flex-1">
              <p className="text-sm text-slate-655 leading-relaxed font-medium">
                {evt.description}
              </p>

              <div className="space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Date: {evt.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Location: {evt.location}</span>
                </div>
                {evt.entryFee && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">
                      Fee: {evt.entryFee}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-slate-55 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">
                {evt.registered ? '🎯 Successfully Registered' : 'Registration Open'}
              </span>

              <button
                onClick={() => handleRegisterClick(evt)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  evt.registered
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {evt.registered ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Registered</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Get Ticket / Register</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateEvent} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Event Bulletin</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Event Title</label>
              <input
                type="text"
                placeholder="e.g. CodeRed National AI Hackathon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Date Time</label>
                <input
                  type="text"
                  placeholder="e.g. Sep 10-12, 2026"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Location Venue</label>
              <input
                type="text"
                placeholder="e.g. Auditorium & Labs"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Entry Fee (optional)</label>
              <input
                type="text"
                placeholder="e.g. Free, $10, etc."
                value={entryFeeInput}
                onChange={(e) => setEntryFeeInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Event Description</label>
              <textarea
                rows={3}
                placeholder="Details about registration, prizes, scheduling..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Publish Event
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

      {/* Event Registration Modal */}
      {showRegisterModal && activeRegisterEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRegisterSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Event Registration</h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeRegisterEvent.title}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterModal(false);
                  setActiveRegisterEvent(null);
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
                placeholder="Enter your name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Academic Year</label>
                <select
                  value={regYear}
                  onChange={(e) => setRegYear(e.target.value)}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Branch</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Number</label>
              <input
                type="tel"
                placeholder="e.g. +1 234-567-8900"
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                required
              />
            </div>

            {activeRegisterEvent.entryFee && activeRegisterEvent.entryFee.toLowerCase() !== 'free' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
                <div className="font-semibold">Entry Fee Required</div>
                <div className="font-bold text-sm bg-amber-100 px-2 py-1 rounded-lg">{activeRegisterEvent.entryFee}</div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                {activeRegisterEvent.entryFee && activeRegisterEvent.entryFee.toLowerCase() !== 'free'
                  ? `Pay & Register`
                  : 'Register'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterModal(false);
                  setActiveRegisterEvent(null);
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

export default Events;
