import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, Menu, X, LayoutDashboard, Award, ClipboardList, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeacherLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col shadow-2xl z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out shrink-0`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
              <span className="text-white font-black tracking-tighter text-lg">KC</span>
            </div>
            <div>
              <h1 className="font-black text-slate-800 text-lg tracking-tight leading-none">Kingswood</h1>
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">Faculty</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <NavLink
            to="/teacher"
            onClick={() => setIsMobileMenuOpen(false)}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                  ? 'bg-violet-50 text-violet-700 shadow-sm border border-violet-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <LayoutDashboard size={20} className="shrink-0" /> Dashboard
          </NavLink>
          <NavLink
            to="/teacher/exams"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                  ? 'bg-violet-50 text-violet-700 shadow-sm border border-violet-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <Award size={20} className="shrink-0" /> Exams & Marks
          </NavLink>
          <NavLink
            to="/teacher/attendance"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                  ? 'bg-violet-50 text-violet-700 shadow-sm border border-violet-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <ClipboardList size={20} className="shrink-0" /> Attendance Reports
          </NavLink>
          <NavLink
            to="/teacher/materials"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive 
                  ? 'bg-violet-50 text-violet-700 shadow-sm border border-violet-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <BookOpen size={20} className="shrink-0" /> Study Materials
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">{user?.linkedId || 'Teacher'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} className="shrink-0" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen flex flex-col overflow-hidden w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 relative shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-black tracking-tighter text-sm">KC</span>
            </div>
            <span className="font-black text-slate-800 tracking-tight">Kingswood Faculty</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-600 hover:text-violet-600 transition-colors">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3 hidden md:block"></div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
