import React from 'react';
import { Shield, Key, Mail, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChangePassword from '../components/ChangePassword';

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Shield className="text-indigo-600" size={32} /> Security & Account Settings
        </h2>
        <p className="text-slate-500 font-medium mt-1">Manage your account security, login password, and verification details</p>
      </div>

      {/* Account Info Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{user?.name || 'User Account'}</h3>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail size={14} className="text-slate-400" /> {user?.email || 'No email attached'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
            <UserCheck size={14} /> Role: {user?.role || 'User'}
          </span>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-lg">
          <Key className="text-indigo-600" size={20} /> Password Security
        </div>
        <ChangePassword />
      </div>
    </div>
  );
};

export default SettingsPage;
