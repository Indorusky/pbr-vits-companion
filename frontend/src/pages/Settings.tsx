import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Server, Shield, Check } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [aiTips, setAiTips] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState(API_BASE_URL);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          Settings & Preferences
        </h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Configure notifications, AI companion preferences, and backend server endpoints.
        </p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
        {/* Notifications Section */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-blue-600" /> Notifications & Smart Reminders
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-800">Email & Push Notifications</p>
                <p className="text-xs text-slate-500">Receive announcements, exam alerts, and deadline reminders.</p>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-800">Attendance Shortage Warnings</p>
                <p className="text-xs text-slate-500">Alert me when subject attendance drops below 80%.</p>
              </div>
              <input
                type="checkbox"
                checked={attendanceAlerts}
                onChange={(e) => setAttendanceAlerts(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-800">AI Daily Study Advice</p>
                <p className="text-xs text-slate-500">Receive personalized academic recommendations on dashboard.</p>
              </div>
              <input
                type="checkbox"
                checked={aiTips}
                onChange={(e) => setAiTips(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* System Endpoint */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Server className="w-5 h-5 text-purple-600" /> Backend API Server
          </h2>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">FastAPI Backend URL</label>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">Default local port: http://localhost:8000</p>
          </div>
        </div>

        {/* Security & Data */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-emerald-600" /> Security & Privacy
          </h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => alert('Academic record exported to PDF successfully!')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Export Academic Data
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences Saved!
            </span>
          ) : <span />}

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
