import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import StudyMaterials from './pages/StudyMaterials';

// New Pages
import Timetable from './pages/Timetable';
import Attendance from './pages/Attendance';
import Marks from './pages/Marks';
import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import Events from './pages/Events';
import Placements from './pages/Placements';
import Notifications from './pages/Notifications';
import Announcements from './pages/Announcements';
import ManageStudents from './pages/ManageStudents';
import ManageUsers from './pages/ManageUsers';
import ManageDepartments from './pages/ManageDepartments';
import AcademicHistory from './pages/AcademicHistory';
import AcademicHealth from './pages/AcademicHealth';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Admin bypass
  if (user?.role === 'admin') return <>{children}</>;
  
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // If role is not allowed, redirect to default dashboards
    if (user.role === 'faculty') return <Navigate to="/faculty-dashboard" replace />;
    return <Navigate to="/profile" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated 
            ? (user?.role === 'admin' 
                ? <Navigate to="/admin-dashboard" replace /> 
                : (user?.role === 'faculty' 
                    ? <Navigate to="/faculty-dashboard" replace /> 
                    : <Navigate to="/dashboard" replace />))
            : <Login />
        } 
      />
      
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden">
              <Sidebar />
              <main className="flex-1 flex flex-col min-h-0 bg-slate-50 relative pb-24 md:pb-0 overflow-y-auto">
                {isAuthenticated && user && user.role === 'student' && (
                  <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 md:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs shrink-0 select-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Student Console</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-150 px-3 py-1 rounded-xl flex items-center justify-between sm:justify-start gap-2 sm:gap-4 flex-wrap">
                      <div>
                        Name: <span className="text-slate-900 font-extrabold">{user.name || user.username}</span>
                      </div>
                      <div className="hidden sm:block w-px h-3 bg-slate-350"></div>
                      <div>
                        Roll: <span className="text-slate-900 font-extrabold">{user.roll_number || '2373A01001'}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex-1 min-h-0 relative">
                  <Routes>
                    {/* Common Routes */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* Student Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute>} />
                    <Route path="/academic-health" element={<ProtectedRoute allowedRoles={['student']}><AcademicHealth /></ProtectedRoute>} />
                    <Route path="/timetable" element={<ProtectedRoute allowedRoles={['student']}><Timetable /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute allowedRoles={['student']}><Attendance /></ProtectedRoute>} />
                    <Route path="/marks" element={<ProtectedRoute allowedRoles={['student']}><Marks /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute allowedRoles={['student']}><AcademicHistory /></ProtectedRoute>} />
                    <Route path="/assignments" element={<ProtectedRoute allowedRoles={['student', 'faculty']}><Assignments /></ProtectedRoute>} />
                    <Route path="/study" element={<StudyMaterials />} />
                    <Route path="/events" element={<ProtectedRoute allowedRoles={['student']}><Events /></ProtectedRoute>} />
                    <Route path="/placements" element={<ProtectedRoute allowedRoles={['student']}><Placements /></ProtectedRoute>} />
                    <Route path="/chat" element={<ProtectedRoute allowedRoles={['student']}><Chatbot /></ProtectedRoute>} />
                    <Route path="/quizzes" element={<Quizzes />} />
                    <Route path="/notifications" element={<ProtectedRoute allowedRoles={['student']}><Notifications /></ProtectedRoute>} />
                    <Route path="/announcements" element={<Announcements />} />

                    {/* Faculty Routes */}
                    <Route path="/faculty-dashboard" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
                    <Route path="/manage-students" element={<ProtectedRoute allowedRoles={['faculty']}><ManageStudents /></ProtectedRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/manage-users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
                    <Route path="/manage-departments" element={<ProtectedRoute allowedRoles={['admin']}><ManageDepartments /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route 
                      path="*" 
                      element={
                        <Navigate 
                          to={
                            user?.role === 'admin' 
                              ? "/admin-dashboard" 
                              : (user?.role === 'faculty' 
                                  ? "/faculty-dashboard" 
                                  : "/dashboard")
                          } 
                          replace 
                        />
                      } 
                    />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
