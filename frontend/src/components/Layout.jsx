import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, QrCode, Users, CreditCard, UserCog, Calendar, Award, LogOut, Menu, X, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Scanner', href: '/scanner', icon: QrCode },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Fees & Payments', href: '/finance', icon: CreditCard },
    { name: 'Faculty', href: '/teachers', icon: UserCog },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-indigo-950 text-white flex flex-col shadow-2xl z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-indigo-900/50 bg-indigo-950/50 backdrop-blur-md flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent flex items-center gap-2">
              <span className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <QrCode size={20} />
              </span>
              K-Connect
            </h1>
            <p className="text-xs font-medium text-indigo-300 mt-1 uppercase tracking-wider">Education Center</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-indigo-300 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                    : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white hover:translate-x-1'
                  }
                `}
              >
                <Icon size={20} className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-blue-400'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-4 bg-indigo-900/30 rounded-2xl border border-indigo-800/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm shadow-inner">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-indigo-300 truncate">Manager</p>
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
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden w-full">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 relative shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <QrCode size={18} />
            </div>
            <span className="font-black text-slate-800 text-lg tracking-tight">K-Connect</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-slate-600 hover:text-indigo-600 transition-colors">
            <Menu size={24} />
          </button>
        </header>

        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl -z-10 animate-pulse hidden lg:block -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-100/50 blur-3xl -z-10 animate-pulse hidden lg:block -ml-48 -mb-48" style={{ animationDelay: '2s' }}></div>
        
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
