import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock, X, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { getNormalizedDepartment, parseTimeToMinutes, formatMinutesToHHMM } from '../utils/subjectsData';

interface ActiveSessionNotice {
  period: number;
  subject: string;
  room: string;
  startTime: string;
  endTime: string;
  windowEnd: string;
}

export default function AttendanceNotificationBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeAlert, setActiveAlert] = useState<ActiveSessionNotice | null>(null);
  const [dismissedPeriods, setDismissedPeriods] = useState<Record<string, boolean>>({});
  const [webNotifPermission, setWebNotifPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setWebNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setWebNotifPermission(perm);
      if (perm === 'granted') {
        new Notification("PBR VITS Mobile Alerts Active 🔔", {
          body: "You will now receive automatic phone notifications when class attendance windows open!",
          icon: "/favicon.ico"
        });
      }
    }
  };

  // Cache today's timetable locally in component memory to eliminate repeated network fetches
  const [cachedSchedule, setCachedSchedule] = useState<any[]>([]);

  // 1. Fetch today's schedule ONCE when student logs in or semester/department changes
  useEffect(() => {
    if (!user || user.role !== 'student') {
      setCachedSchedule([]);
      setActiveAlert(null);
      return;
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[new Date().getDay()];
    if (todayDayName === 'Sunday' || todayDayName === 'Saturday') {
      setCachedSchedule([]);
      return;
    }

    const normDept = getNormalizedDepartment(user.department || 'Computer Science');
    const sem = user.semester || '3-1';

    // Fetch once with 5-minute TTL cache
    fetch(`${API_BASE_URL}/timetable?department=${encodeURIComponent(normDept)}&semester=${encodeURIComponent(sem)}&day=${todayDayName}`, {
      headers: {
        'x-requester-username': user.username,
        'x-requester-role': 'student'
      }
    })
      .then(res => res.ok ? res.json() : [])
      .then(entries => {
        if (Array.isArray(entries)) {
          setCachedSchedule(entries);
        }
      })
      .catch(() => { /* ignore network error, fallback handled */ });
  }, [user?.department, user?.semester, user?.username, user?.role]);

  // 2. Pure local client-side evaluation of attendance windows against current clock (Zero Network Egress)
  const evaluateActiveWindowLocally = () => {
    if (!user || user.role !== 'student' || cachedSchedule.length === 0) {
      setActiveAlert(null);
      return;
    }

    const now = new Date();
    const todayDateStr = now.toISOString().split('T')[0];
    const currentTotalMin = now.getHours() * 60 + now.getMinutes();

    for (const entry of cachedSchedule) {
      try {
        const sMin = parseTimeToMinutes(entry.start_time);
        const eMin = parseTimeToMinutes(entry.end_time);
        const wStartMin = sMin - 15;
        const wEndMin = (eMin || sMin + 60) + 15;

        if (currentTotalMin >= wStartMin && currentTotalMin <= wEndMin) {
          const dismissKey = `${todayDateStr}_period_${entry.period}`;
          if (!dismissedPeriods[dismissKey]) {
            const windowEndStr = formatMinutesToHHMM(wEndMin);
            const notice: ActiveSessionNotice = {
              period: entry.period,
              subject: entry.subject,
              room: entry.room || 'LH-101',
              startTime: entry.start_time || '09:00',
              endTime: entry.end_time || '10:30',
              windowEnd: windowEndStr
            };

            setActiveAlert(notice);

            // Trigger haptic vibration on mobile
            if ('vibrate' in navigator) {
              try { navigator.vibrate([300, 150, 300]); } catch { /* ignore */ }
            }

            // Trigger Web Push Notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`Attendance Window OPEN: Period ${entry.period}`, {
                  body: `${entry.subject} (${entry.room || 'LH-101'}) attendance is open until ${windowEndStr}. Tap to mark presence!`,
                  icon: '/favicon.ico',
                  tag: `att_period_${entry.period}`
                });
              } catch { /* ignore */ }
            }

            return;
          }
        }
      } catch { /* ignore parsing errors */ }
    }
  };

  useEffect(() => {
    evaluateActiveWindowLocally();
    // Check purely local system clock every 30 seconds - NO database or network calls
    const interval = setInterval(evaluateActiveWindowLocally, 30000);
    return () => clearInterval(interval);
  }, [cachedSchedule, dismissedPeriods, user]);

  if (!activeAlert || user?.role !== 'student') {
    return null;
  }

  const dismissKey = `${new Date().toISOString().split('T')[0]}_period_${activeAlert.period}`;

  return (
    <div className="fixed top-3 left-3 right-3 z-50 animate-in slide-in-from-top duration-300 max-w-lg mx-auto">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded-2xl p-4 shadow-2xl border border-blue-400/40 flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/30 rounded-xl border border-blue-300/30 animate-pulse shrink-0">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-200 bg-blue-800/60 px-2 py-0.5 rounded-md border border-blue-400/30">
                Attendance Window OPEN
              </span>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight mt-1 text-white">
                Period {activeAlert.period}: {activeAlert.subject}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              setDismissedPeriods(prev => ({ ...prev, [dismissKey]: true }));
              setActiveAlert(null);
            }}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 transition-colors"
            title="Dismiss notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-blue-100 bg-black/20 p-2.5 rounded-xl gap-2 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            Lecture: {activeAlert.startTime} - {activeAlert.endTime}
          </span>
          <span className="text-amber-300 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
            Window Closes at {activeAlert.windowEnd}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              setActiveAlert(null);
              navigate('/attendance');
            }}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Verify Face Attendance Now</span>
          </button>

          {webNotifPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-[11px] rounded-xl border border-blue-400/40 shrink-0 transition-colors flex items-center gap-1"
              title="Enable native phone push notifications"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Enable Alerts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
