import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, Menu, X, LayoutDashboard, Award, ClipboardList, BookOpen, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeacherLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-indigo-950 text-white flex flex-col shadow-2xl z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0`}>
        <div className="p-6 border-b border-indigo-900/50 bg-indigo-950/50 backdrop-blur-md flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/60 border border-indigo-400/20 shrink-0">
              <span className="text-white font-black tracking-tighter text-lg">KC</span>
            </div>
            <div>
              <h1 className="font-black text-white text-lg tracking-tight leading-none">Kingswood</h1>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Faculty</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-indigo-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/teacher"
            onClick={() => setIsMobileMenuOpen(false)}
            end
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                  : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard size={20} className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-400'}`} />
                <span className="font-medium">Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/teacher/exams"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                  : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Award size={20} className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-400'}`} />
                <span className="font-medium">Exams & Marks</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/teacher/attendance"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                  : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ClipboardList size={20} className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-400'}`} />
                <span className="font-medium">Attendance Reports</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/teacher/materials"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                  : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <BookOpen size={20} className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-400'}`} />
                <span className="font-medium">Study Materials</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/teacher/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                  : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white hover:translate-x-1'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings size={20} className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-400'}`} />
                <span className="font-medium">Settings & Security</span>
              </>
            )}
          </NavLink>
        </nav>

        <div className="p-4 m-4 bg-indigo-900/30 rounded-2xl border border-indigo-800/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow-inner">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user?.linkedId || 'Teacher'}</p>
            </div>
            <button 
              onClick={handleLogout}
              title="Log Out"
              className="p-2 text-indigo-300 hover:text-white hover:bg-indigo-800/50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-indigo-950 border-b border-indigo-900/50 px-4 py-3 flex items-center justify-between z-10 relative shadow-sm shrink-0 text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md shrink-0">
              <span className="text-white font-black tracking-tighter text-xs">KC</span>
            </div>
            <span className="font-black text-white text-lg tracking-tight">Kingswood Faculty</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-indigo-300 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
        </header>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl -z-10 animate-pulse hidden lg:block -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-100/50 blur-3xl -z-10 animate-pulse hidden lg:block -ml-48 -mb-48" style={{ animationDelay: '2s' }}></div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
