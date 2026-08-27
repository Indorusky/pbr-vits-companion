import { useState } from 'react';
import { Bell, Mail, Clock, Shield, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LiveNotification {
  id: string;
  title: string;
  category: 'Exam Alert' | 'Hackathon' | 'Event' | 'Placement';
  time: string;
  read: boolean;
  content: string;
}

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  sentTime: string;
  body: string;
}

const INITIAL_NOTIFS: LiveNotification[] = [
  {
    id: 'n1',
    title: 'Math Midterm Schedule Posted',
    category: 'Exam Alert',
    time: '2 hours ago',
    read: false,
    content: 'The Mathematics III midterm is scheduled for Oct 15, 2026, at 09:00 AM in LH-101. Bring calculators.'
  },
  {
    id: 'n2',
    title: 'New Google ASDE Job Listing',
    category: 'Placement',
    time: '5 hours ago',
    read: false,
    content: 'Google DeepMind ASDE full-time role registration deadline is Sep 15, 2026. Apply directly from the Placements portal.'
  },
  {
    id: 'n3',
    title: 'CodeRed Hackathon Registration Open',
    category: 'Hackathon',
    time: '1 day ago',
    read: true,
    content: 'Register for the CodeRed AI hackathon from the Events page. Tickets are free but seating is limited.'
  }
];

const INITIAL_EMAILS: EmailLog[] = [
  {
    id: 'e1',
    to: 'alex.j@campus.edu',
    subject: '[Exam Alert] Math Midterm Schedule Released',
    sentTime: '2 hours ago',
    body: 'Dear Student, The Mathematics III midterm schedule is out. Exam Date: Oct 15, 2026. Time: 09:00 AM. Venue: LH-101. Please be on time.'
  },
  {
    id: 'e2',
    to: 'alex.j@campus.edu',
    subject: '[Placement Alert] Google DeepMind Recruiting ASDE',
    sentTime: '5 hours ago',
    body: 'Dear Candidate, Google DeepMind Technologies is recruiting ASDE roles. Eligibility: CGPA >= 8.5. Compensation: $145,000. Apply via PBR VITS Student Companion before Sep 15.'
  }
];

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<LiveNotification[]>(INITIAL_NOTIFS);
  const [emails] = useState<EmailLog[]>(INITIAL_EMAILS);

  const studentEmail = user?.email || 'student.user@campus.edu';

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkSingleRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getCategoryColor = (cat: string) => {
    if (cat === 'Exam Alert') return 'bg-red-50 text-red-700 border-red-100';
    if (cat === 'Placement') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (cat === 'Hackathon') return 'bg-purple-50 text-purple-700 border-purple-100';
    return 'bg-amber-50 text-amber-700 border-amber-100';
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Alerts & Notification System
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Monitor real-time academic announcements and review automated emails dispatched to your registered address.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Mark All as Read
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Interactive Alerts Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Live Notification Feed</h3>

          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkSingleRead(n.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  n.read
                    ? 'bg-white border-slate-100 shadow-sm opacity-70'
                    : 'bg-white border-blue-200 shadow shadow-blue-50/55'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${getCategoryColor(n.category)}`}>
                    {n.category}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {n.time}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{n.content}</p>
                </div>

                {!n.read && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">New Alert</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Mock SMTP Email logs */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Email System Log</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Logged alerts sent to your profile</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-600">
              Active Registered Mailbox: <br />
              <span className="text-slate-800 font-bold select-all underline">{studentEmail}</span>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {emails.map((e) => (
                <div
                  key={e.id}
                  className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-2 text-xs font-medium"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>To: {e.to}</span>
                    <span>{e.sentTime}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{e.subject}</h4>
                    <p className="text-slate-500 font-semibold mt-1 leading-relaxed">{e.body}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Delivered Successfully</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
