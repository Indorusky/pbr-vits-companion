import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

import { Calendar, Clock, MapPin, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNormalizedDepartment } from '../utils/subjectsData';

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

const Timetable = () => {
  const { user } = useAuth();
  const userSem = user?.semester || '3-1';
  
  const [selectedSem, setSelectedSem] = useState<string>(userSem);
  const [activeDay, setActiveDay] = useState<string>('Monday');
  const [sessions, setSessions] = useState<TimetableRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine semesters allowed based on user's year
  const getSemestersByYear = (year?: string) => {
    switch (year) {
      case '1st Year': return ['1-1', '1-2'];
      case '2nd Year': return ['2-1', '2-2'];
      case '3rd Year': return ['3-1', '3-2'];
      case '4th Year': return ['4-1', '4-2'];
      default: return ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
    }
  };

  const availableSemesters = getSemestersByYear(user?.year);

  // Sync selected semester
  useEffect(() => {
    if (user?.semester) {
      setSelectedSem(user.semester);
    } else {
      const sems = getSemestersByYear(user?.year);
      setSelectedSem(sems[0]);
    }
  }, [user]);

  // Fetch timetable entries from backend database
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const normDept = getNormalizedDepartment(user?.department || 'Computer Science');
      const response = await fetch(`${API_BASE_URL}/timetable?department=${normDept}&semester=${selectedSem}`, {
        headers: {
          'x-requester-username': user?.username || '',
          'x-requester-role': user?.role || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (e) {
      console.warn("Failed to fetch database timetable", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [user?.department, selectedSem]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const activeDaySchedule = sessions
    .filter(s => s.day === activeDay)
    .sort((a, b) => a.period - b.period);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Weekly Academic Timetable
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Monitor class schedules, assigned lecture rooms, and instructor sessions directly from the database.
          </p>
        </div>

        {/* Semester Selection Tab */}
        {user?.role !== 'student' && (
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start sm:self-center">
            {availableSemesters.map((sem) => (
              <button
                key={sem}
                onClick={() => { setSelectedSem(sem); setActiveDay('Monday'); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedSem === sem ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Days Selector Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none pb-2 gap-2">
        {days.map((day) => {
          const hasClasses = sessions.some(s => s.day === day);
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
                activeDay === day
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{day}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${hasClasses ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-155 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-bold">Synchronizing database timetable entries...</p>
        </div>
      ) : (
        /* Timetable Content Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Day Schedule */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Schedule for <span className="text-blue-600">{activeDay}</span>
            </h3>

            {activeDaySchedule.length > 0 ? (
              <div className="space-y-4">
                {activeDaySchedule.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            Period {session.period}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Room: {session.room}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg mt-1">{session.subject}</h4>
                        <p className="text-sm text-slate-500 font-medium">Instructor: {session.faculty_username || 'No teacher assigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 py-2 px-3 rounded-xl border border-slate-100 w-fit">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{session.start_time} - {session.end_time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-200 p-12 text-center rounded-2xl">
                <Calendar className="w-12 h-12 text-slate-350 mx-auto mb-3 animate-pulse" />
                <p className="text-slate-650 font-bold text-slate-700">Not scheduled</p>
                <p className="text-slate-400 text-xs mt-1">No classes are scheduled for your department/semester on this day.</p>
              </div>
            )}
          </div>

          {/* Info Card / Tips */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Academic Smart Advice
              </h3>
              {sessions.length > 0 ? (
                <p className="text-sm text-blue-50 leading-relaxed font-medium">
                  Your department has active classes scheduled this week. Keep up the steady attendance pace to satisfy biometric targets!
                </p>
              ) : (
                <p className="text-sm text-blue-50 leading-relaxed font-medium">
                  No classes assigned to this semester. Admin may update the database shortly.
                </p>
              )}
              <div className="border-t border-blue-400/30 pt-4 flex justify-between items-center text-xs">
                <span>Overall Schedule Status</span>
                <span className={sessions.length > 0 ? "bg-emerald-500/80 px-2.5 py-0.5 rounded-full font-bold" : "bg-slate-500/80 px-2.5 py-0.5 rounded-full font-bold"}>
                  {sessions.length > 0 ? "ON SCHEDULE" : "NOT SCHEDULED"}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-sm">
              <h4 className="font-bold text-slate-800 text-sm">Timetable Locations Key</h4>
              <div className="space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>LH / Lab 2: Designated Lecture halls & lab rooms.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
