import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Users, 
  FileText, 
  Calendar, 
  Percent, 
  BarChart3, 
  ClipboardList, 
  Megaphone, 
  Sparkles, 
  HelpCircle, 
  Bell,
  Building,
  Menu,
  X,
  TrendingUp,
  Smartphone,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout, viewMode, setViewMode } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("📱 Mobile App Installation Guide:\n\n1. Open this website in Chrome (Android) or Safari (iOS).\n2. Tap the Menu (⋮) or Share button.\n3. Tap 'Add to Home Screen' or 'Install App'.\n\nYour PBR VITS Mobile App icon will be added to your phone's home screen!");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentNavItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Academic Health', icon: TrendingUp, path: '/academic-health' },
    { name: 'Timetable', icon: Calendar, path: '/timetable' },
    { name: 'Attendance', icon: Percent, path: '/attendance' },
    { name: 'Internal Marks', icon: BarChart3, path: '/marks' },
    { name: 'Academic History', icon: FileText, path: '/history' },
    { name: 'Assignments', icon: ClipboardList, path: '/assignments' },
    { name: 'Study Materials', icon: BookOpen, path: '/study' },
    { name: 'Announcements', icon: Megaphone, path: '/announcements' },
    { name: 'Events', icon: Sparkles, path: '/events' },
    { name: 'Placements', icon: FileText, path: '/placements' },
    { name: 'AI Chatbot', icon: MessageSquare, path: '/chat' },
    { name: 'Interactive Quizzes', icon: HelpCircle, path: '/quizzes' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
  ];

  const facultyNavItems = [
    { name: 'Dashboard', icon: Home, path: '/faculty-dashboard' },
    { name: 'Manage Students', icon: Users, path: '/manage-students' },
    { name: 'Assignments', icon: ClipboardList, path: '/assignments' },
    { name: 'Study Materials', icon: BookOpen, path: '/study' },
    { name: 'Manage Quizzes', icon: HelpCircle, path: '/quizzes' },
    { name: 'Announcements', icon: Megaphone, path: '/announcements' },
  ];

  const adminNavItems = [
    { name: 'Dashboard', icon: Home, path: '/admin-dashboard' },
    { name: 'Manage Users', icon: Users, path: '/manage-users' },
    { name: 'Manage Departments', icon: Building, path: '/manage-departments' },
  ];

  let navItems = studentNavItems;
  if (viewMode === 'faculty') navItems = facultyNavItems;
  else if (viewMode === 'admin') navItems = adminNavItems;

  // Bottom Nav items for Mobile App feel
  let bottomNavItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'Timetable', icon: Calendar, path: '/timetable' },
    { name: 'Attendance', icon: Percent, path: '/attendance' },
    { name: 'AI Chat', icon: MessageSquare, path: '/chat' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  if (viewMode === 'faculty') {
    bottomNavItems = [
      { name: 'Home', icon: Home, path: '/faculty-dashboard' },
      { name: 'Students', icon: Users, path: '/manage-students' },
      { name: 'Assignments', icon: ClipboardList, path: '/assignments' },
      { name: 'Materials', icon: BookOpen, path: '/study' },
      { name: 'Profile', icon: User, path: '/profile' },
    ];
  } else if (viewMode === 'admin') {
    bottomNavItems = [
      { name: 'Home', icon: Home, path: '/admin-dashboard' },
      { name: 'Users', icon: Users, path: '/manage-users' },
      { name: 'Depts', icon: Building, path: '/manage-departments' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ];
  }

  const renderNavContent = () => (
    <>
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src="/pbr_vits_logo.png" alt="PBR VITS Logo" className="w-9 h-9 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-slate-800 leading-tight truncate">PBR VITS</h1>
            <p className="text-[10px] font-bold text-blue-600 leading-none truncate">Student Companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0">Admin</span>
          )}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Admin Role/Portal Selector */}
      {user?.role === 'admin' && (
        <div className="p-3 bg-slate-50/80 border-b border-slate-100 space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Act As Portal</label>
          <select
            value={viewMode}
            onChange={(e) => {
              setViewMode(e.target.value as any);
              setMobileMenuOpen(false);
              if (e.target.value === 'admin') navigate('/admin-dashboard');
              else if (e.target.value === 'faculty') navigate('/faculty-dashboard');
              else navigate('/dashboard');
            }}
            className="w-full bg-white text-xs border border-slate-200 rounded-lg p-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="admin">⚙️ Admin Console</option>
            <option value="faculty">👨‍🏫 Faculty Portal</option>
            <option value="student">🎓 Student Portal</option>
          </select>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile and Settings */}
      <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50">
        {viewMode !== 'admin' && (
          <NavLink
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <User className="w-4 h-4" />
            <span>Profile Portal</span>
          </NavLink>
        )}
        <NavLink
          to="/settings"
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

        {/* PWA Mobile App Installer Button */}
        <button
          onClick={handleInstallApp}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-200 shadow-xs mb-1"
        >
          <span className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Install App</span>
          </span>
          <Download className="w-3.5 h-3.5 text-blue-600" />
        </button>

        <div className="pt-2 border-t border-slate-150 flex items-center space-x-2.5 px-3 py-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate">
              {user?.department || 'College Dept'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            setMobileMenuOpen(false);
            handleLogout();
          }}
          className="w-full flex items-center space-x-3 px-3 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 h-full hidden md:flex flex-col shadow-sm select-none shrink-0">
        {renderNavContent()}
      </aside>

      {/* 2. Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs select-none">
        <div className="flex items-center gap-2 min-w-0">
          <img src="/pbr_vits_logo.png" alt="PBR VITS Logo" className="w-7 h-7 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xs font-extrabold text-slate-900 leading-tight truncate">PBR VITS</h1>
            <p className="text-[9px] font-bold text-blue-600 leading-none truncate">Student Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user?.name && (
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg truncate max-w-[85px] xs:max-w-[110px] sm:max-w-[140px] shrink-0">
              {user.name}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. Mobile Slide-Over Drawer Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </div>
        </div>
      )}

      {/* 4. Mobile Bottom App Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-1.5 px-1 z-30 shadow-lg">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 font-extrabold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
