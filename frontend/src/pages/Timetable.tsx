import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  Plus,
  Trash2,
  BookOpen,
  Building,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNormalizedDepartment, SUBJECTS_DATABASE, getTimetableScheduleForDay } from '../utils/subjectsData';

interface TimetableRecord {
  id: number;
  department: string;
  semester: string;
  day: string;
  period: number;
  subject: string;
  subject_type: string;
  faculty_username: string | null;
  room: string;
  start_time: string;
  end_time: string;
}

const DEPARTMENTS = [
  'Computer Science and Engineering (CSE)',
  'CSE AI',
  'CSE AIML',
  'Electronics and Communication Engineering (ECE)',
  'Electrical and Electronics Engineering (EEE)',
  'Civil Engineering'
];

const ALL_SEMESTERS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];

const PERIOD_PRESETS = [
  { period: 1, label: 'Period 1 (Morning)', start: '9:00 AM', end: '10:30 AM' },
  { period: 2, label: 'Period 2 (Morning)', start: '10:45 AM', end: '12:15 PM' },
  { period: 3, label: 'Period 3 (Afternoon)', start: '1:00 PM', end: '2:30 PM' },
  { period: 4, label: 'Period 4 (Afternoon)', start: '2:45 PM', end: '4:15 PM' },
  { period: 5, label: 'Period 5 (Extra / Evening)', start: '4:30 PM', end: '5:30 PM' }
];

const Timetable = () => {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'admin';
  const canManage = isFaculty || isAdmin;

  // Selected Department & Semester
  const defaultDept = getNormalizedDepartment(user?.department || 'Computer Science and Engineering (CSE)');
  const [selectedDept, setSelectedDept] = useState<string>(defaultDept);
  const [selectedSem, setSelectedSem] = useState<string>(user?.semester || '1-1');
  const [activeDay, setActiveDay] = useState<string>('Monday');
  const [viewMode, setViewMode] = useState<'department' | 'my-classes'>(isFaculty ? 'department' : 'department');

  // Timetable records
  const [sessions, setSessions] = useState<TimetableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State for Adding / Scheduling Period
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allowOverwrite, setAllowOverwrite] = useState(true);

  // Form state
  const [formDept, setFormDept] = useState<string>(selectedDept);
  const [formSem, setFormSem] = useState<string>(selectedSem);
  const [formDay, setFormDay] = useState<string>(activeDay);
  const [formPeriod, setFormPeriod] = useState<number>(3); // Default to Afternoon Period 3
  const [formStartTime, setFormStartTime] = useState<string>('1:00 PM');
  const [formEndTime, setFormEndTime] = useState<string>('2:30 PM');
  const [formSubject, setFormSubject] = useState<string>('');
  const [formSubjectType, setFormSubjectType] = useState<string>('Lecture');
  const [formRoom, setFormRoom] = useState<string>('');
  const [formFaculty, setFormFaculty] = useState<string>(user?.name || user?.username || '');

  // Update preset time when formPeriod changes
  const handlePeriodChange = (pNum: number) => {
    setFormPeriod(pNum);
    const preset = PERIOD_PRESETS.find(p => p.period === pNum);
    if (preset) {
      setFormStartTime(preset.start);
      setFormEndTime(preset.end);
    }
  };

  // Auto-sync form defaults when modal opens
  const openAddModal = () => {
    setFormDept(selectedDept);
    setFormSem(selectedSem);
    setFormDay(activeDay);
    setFormFaculty(user?.name || user?.username || '');
    const shortDept = formDept.includes('CSE') ? 'CSE' : formDept.includes('ECE') ? 'ECE' : formDept.includes('EEE') ? 'EEE' : 'CIVIL';
    setFormRoom(`${shortDept} LH-101`);
    setShowAddModal(true);
  };

  // Fetch timetable entries
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/timetable`;
      const params = new URLSearchParams();

      if (viewMode === 'my-classes' && user?.username) {
        params.append('faculty_username', user.name || user.username);
      } else {
        params.append('department', selectedDept);
        params.append('semester', selectedSem);
      }

      url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'x-requester-username': user?.username || '',
          'x-requester-role': user?.role || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setSessions(data);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend timetable unreachable or loading, using local schedule generation", e);
    } finally {
      setLoading(false);
    }

    // High-fidelity fallback schedule if backend returns empty or cold-starts
    if (viewMode !== 'my-classes') {
      const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const generated: TimetableRecord[] = [];
      daysList.forEach(dayName => {
        const daySched = getTimetableScheduleForDay(selectedSem, dayName);
        daySched.forEach(item => {
          generated.push({
            id: Math.floor(Math.random() * 100000),
            department: selectedDept,
            semester: selectedSem,
            day: dayName,
            period: item.period,
            subject: item.subject,
            subject_type: item.period < 4 ? 'Lecture' : 'Laboratory',
            faculty_username: item.faculty,
            room: item.room,
            start_time: item.startTime,
            end_time: item.endTime
          });
        });
      });
      setSessions(generated);
    } else {
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedDept, selectedSem, viewMode, user]);

  // Handle Form Submit
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) {
      setNotification({ type: 'error', message: 'Please specify a subject name.' });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    const payload = {
      department: formDept,
      semester: formSem,
      day: formDay,
      period: Number(formPeriod),
      subject: formSubject.trim(),
      subject_type: formSubjectType,
      faculty_username: formFaculty.trim() || user?.name || user?.username,
      room: formRoom.trim() || `${formDept.slice(0, 4)} LH-101`,
      start_time: formStartTime,
      end_time: formEndTime
    };

    try {
      const response = await fetch(`${API_BASE_URL}/timetable?overwrite=${allowOverwrite}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-username': user?.username || '',
          'x-requester-role': user?.role || ''
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: `Successfully scheduled "${payload.subject}" for ${payload.day} Period ${payload.period} (${payload.department} - ${payload.semester})!`
        });
        setShowAddModal(false);
        fetchTimetable();
      } else {
        const err = await response.json();
        setNotification({
          type: 'error',
          message: err.detail || 'Failed to save timetable period.'
        });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Connection error while saving period.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Entry
  const handleDeleteEntry = async (id: number, subjectName: string, periodNum: number) => {
    if (!confirm(`Are you sure you want to remove Period ${periodNum} (${subjectName}) from the timetable?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/timetable/${id}`, {
        method: 'DELETE',
        headers: {
          'x-requester-username': user?.username || '',
          'x-requester-role': user?.role || ''
        }
      });

      if (res.ok) {
        setNotification({ type: 'success', message: `Period ${periodNum} (${subjectName}) removed.` });
        fetchTimetable();
      } else {
        setNotification({ type: 'error', message: 'Failed to delete timetable entry.' });
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Network error deleting timetable entry.' });
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const activeDaySchedule = sessions
    .filter(s => s.day === activeDay)
    .sort((a, b) => a.period - b.period);

  // Available subjects for the selected form dept/sem
  const suggestedSubjects = (SUBJECTS_DATABASE[formDept] && SUBJECTS_DATABASE[formDept][formSem]) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-md transition-all animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Academic Timetable
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {canManage
                  ? 'Manage, schedule, and assign periods for any department, semester, or afternoon slot.'
                  : 'Monitor class schedules, lecture halls, and instructor sessions.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls for Faculty / Admin */}
        <div className="flex flex-wrap items-center gap-3">
          {isFaculty && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('department')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'department' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dept Timetable
              </button>
              <button
                onClick={() => setViewMode('my-classes')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === 'my-classes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Teaching Classes
              </button>
            </div>
          )}

          {canManage && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule / Add Period</span>
            </button>
          )}
        </div>
      </header>

      {/* Filter / Selector Bar */}
      {viewMode === 'department' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Department Dropdown */}
            <div className="flex items-center gap-3 flex-1">
              <Building className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Department
                </label>
                {canManage ? (
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                    {selectedDept}
                  </span>
                )}
              </div>
            </div>

            {/* Semester Tabs */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Semester
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none gap-1">
                {ALL_SEMESTERS.map((sem) => (
                  <button
                    key={sem}
                    onClick={() => {
                      setSelectedSem(sem);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                      selectedSem === sem
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekday Selector Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none pb-2 gap-2">
        {days.map((day) => {
          const count = sessions.filter(s => s.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
                activeDay === day
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeDay === day
                    ? 'bg-white/20 text-white'
                    : count > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count} {count === 1 ? 'class' : 'classes'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-bold">Loading timetable schedule from database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Day Schedule List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>{activeDay} Schedule</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full">
                  {viewMode === 'my-classes' ? 'My Assigned Periods' : `${selectedDept} • ${selectedSem}`}
                </span>
              </h3>
            </div>

            {activeDaySchedule.length > 0 ? (
              <div className="space-y-3.5">
                {activeDaySchedule.map((session) => {
                  const isAfternoon = session.period >= 3 || session.start_time.includes('PM');
                  return (
                    <div
                      key={session.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`p-3 rounded-xl shrink-0 mt-0.5 ${
                            isAfternoon
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                              Period {session.period} {isAfternoon && '• Afternoon'}
                            </span>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              {session.subject_type || 'Lecture'}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {session.room}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">{session.subject}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Instructor: <strong className="text-slate-700">{session.faculty_username || 'Unassigned'}</strong></span>
                            {viewMode === 'my-classes' && (
                              <span className="text-indigo-600 font-bold ml-2">
                                ({session.department} - {session.semester})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 py-2 px-3 rounded-xl border border-slate-100">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{session.start_time} - {session.end_time}</span>
                        </div>

                        {canManage && (
                          <button
                            onClick={() => handleDeleteEntry(session.id, session.subject, session.period)}
                            title="Delete this period"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 p-12 text-center rounded-2xl space-y-3">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-700">No classes scheduled for {activeDay}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {canManage
                    ? 'Use the "+ Schedule / Add Period" button above to add morning or afternoon classes for this slot.'
                    : 'No sessions are scheduled for this semester/day.'}
                </p>
                {canManage && (
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Period for {activeDay}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Info Card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-800 text-white rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-300" />
                  Timetable Overview
                </h3>
                <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                  {sessions.length} Periods
                </span>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                {canManage
                  ? 'Faculty members have full access to schedule morning and afternoon periods for any department, semester, and subject.'
                  : 'Regular attendance across all assigned periods is mandatory for fulfilling course prerequisites.'}
              </p>

              <div className="border-t border-white/15 pt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-blue-200 block">Morning Slots</span>
                  <strong className="text-sm font-extrabold">09:00 - 12:15</strong>
                </div>
                <div>
                  <span className="text-blue-200 block">Afternoon Slots</span>
                  <strong className="text-sm font-extrabold">01:00 - 04:15</strong>
                </div>
              </div>
            </div>

            {/* Quick Department Switchers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Departments Directory
              </h4>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDept(dept);
                      setViewMode('department');
                    }}
                    className={`text-left px-3 py-2 rounded-xl transition-all font-semibold flex items-center justify-between ${
                      selectedDept === dept && viewMode === 'department'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{dept}</span>
                    {selectedDept === dept && viewMode === 'department' && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule / Add Period Modal for Faculty & Admin */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Schedule / Add Class Period
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add morning or afternoon slots for any department & semester.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              {/* Department & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester / Year *
                  </label>
                  <select
                    value={formSem}
                    onChange={(e) => setFormSem(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {ALL_SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day & Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Day of Week *
                  </label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Period / Time Slot *
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => handlePeriodChange(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {PERIOD_PRESETS.map((p) => (
                      <option key={p.period} value={p.period}>
                        {p.label} ({p.start} - {p.end})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. 1:00 PM"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. 2:30 PM"
                    required
                  />
                </div>
              </div>

              {/* Subject Name & Suggestions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Deep Learning / MLOps Lab / Special Lecture"
                  required
                />
                {suggestedSubjects.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">
                      Quick select for {formSem}:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                      {suggestedSubjects.map((subj) => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setFormSubject(subj)}
                          className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-medium px-2 py-1 rounded-md text-slate-700 transition-colors"
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Type & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject Type
                  </label>
                  <select
                    value={formSubjectType}
                    onChange={(e) => setFormSubjectType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Project">Project Work</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Room / Hall No.
                  </label>
                  <input
                    type="text"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. CSE LH-101 / Lab 2"
                    required
                  />
                </div>
              </div>

              {/* Assigned Faculty */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Faculty / Instructor
                </label>
                <input
                  type="text"
                  value={formFaculty}
                  onChange={(e) => setFormFaculty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Dr. DODLA SRUJAN CHANDRA REDDY"
                />
              </div>

              {/* Auto Replace / Overwrite option */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="allowOverwrite"
                  checked={allowOverwrite}
                  onChange={(e) => setAllowOverwrite(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="allowOverwrite" className="text-xs font-medium text-slate-600 cursor-pointer">
                  Replace existing period if this time slot is already occupied
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{submitting ? 'Saving...' : 'Save & Schedule Period'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
