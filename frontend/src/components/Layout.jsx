import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, QrCode, Users, CreditCard, UserCog, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
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
    { name: 'Fees & Payments', href: '/finance', icon: CreditCard },
    { name: 'Faculty', href: '/teachers', icon: UserCog },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-white flex flex-col shadow-2xl relative z-20">
        <div className="p-6 border-b border-indigo-900/50 bg-indigo-950/50 backdrop-blur-md">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent flex items-center gap-2">
            <span className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <QrCode size={20} />
            </span>
            K-Connect
          </h1>
          <p className="text-xs font-medium text-indigo-300 mt-1 uppercase tracking-wider">Education Center</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
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
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-48 -mb-48 w-96 h-96 rounded-full bg-indigo-100/50 blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="flex-1 overflow-auto p-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
