import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Clock, X, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { getNormalizedDepartment } from '../utils/subjectsData';

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

  const checkAttendanceWindow = async () => {
    if (!user || user.role !== 'student') {
      setActiveAlert(null);
      return;
    }

    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[now.getDay()];
    const todayDateStr = now.toISOString().split('T')[0];

    // If weekend, skip automatic checks
    if (todayDayName === 'Sunday' || todayDayName === 'Saturday') return;

    try {
      const normDept = getNormalizedDepartment(user.department || 'Computer Science');
      const sem = user.semester || '3-1';

      const res = await fetch(`${API_BASE_URL}/timetable?department=${normDept}&semester=${sem}&day=${todayDayName}`, {
        headers: {
          'x-requester-username': user.username,
          'x-requester-role': 'student'
        }
      });

      if (res.ok) {
        const entries = await res.json();
        if (Array.isArray(entries) && entries.length > 0) {
          for (const entry of entries) {
            try {
              const startClean = (entry.start_time || '08:00').substring(0, 5);
              const [sHour, sMin] = startClean.split(':').map(Number);
              
              // windowStart = start_time - 10 minutes
              let wStartTotalMin = sHour * 60 + sMin - 10;
              if (wStartTotalMin < 0) wStartTotalMin += 24 * 60;
              const wStartHH = String(Math.floor(wStartTotalMin / 60)).padStart(2, '0');
              const wStartMM = String(wStartTotalMin % 60).padStart(2, '0');
              const windowStartStr = `${wStartHH}:${wStartMM}`;

              // windowEnd = start_time + 15 minutes
              const wEndTotalMin = sHour * 60 + sMin + 15;
              const wEndHH = String(Math.floor(wEndTotalMin / 60)).padStart(2, '0');
              const wEndMM = String(wEndTotalMin % 60).padStart(2, '0');
              const windowEndStr = `${wEndHH}:${wEndMM}`;

              if (currentHHMM >= windowStartStr && currentHHMM <= windowEndStr) {
                const dismissKey = `${todayDateStr}_period_${entry.period}`;
                if (!dismissedPeriods[dismissKey]) {
                  const notice: ActiveSessionNotice = {
                    period: entry.period,
                    subject: entry.subject,
                    room: entry.room || 'LH-101',
                    startTime: startClean,
                    endTime: (entry.end_time || '09:00').substring(0, 5),
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
                        body: `${entry.subject} (${entry.room}) attendance is open now until ${windowEndStr}. Tap to mark presence!`,
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
        }
      }
    } catch { /* ignore network error */ }
  };

  useEffect(() => {
    checkAttendanceWindow();
    const interval = setInterval(checkAttendanceWindow, 12000); // Check every 12 seconds
    return () => clearInterval(interval);
  }, [user]);

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
