import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, UserCog, Briefcase, GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(`${API_URL}/teachers/commission`);
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Faculty & Commissions</h2>
          <p className="text-slate-500 font-medium mt-1">Manage instructors and calculate monthly payouts</p>
        </div>
        <button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center transition-all shadow-lg shadow-indigo-200 active:scale-95">
          <UserCog size={18} className="mr-2" />
          Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -z-10 translate-x-32 -translate-y-32"></div>
        
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center text-slate-800">
            <div className="bg-violet-100 p-2 rounded-lg text-violet-600 mr-3">
              <Calculator size={20} />
            </div>
            <h3 className="font-bold text-lg">Monthly Commission Calculator</h3>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <Briefcase size={16} className="text-slate-400" /> {teachers.length} Active Staff
          </div>
        </div>
        
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mb-4"></div>
            <span className="text-slate-500 font-medium">Crunching numbers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Member</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Active Students</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Comm. Rate</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider bg-violet-50/50 text-right">Expected Income (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher) => (
                  <tr key={teacher.teacherId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-sm font-mono font-bold text-slate-500">{teacher.teacherId}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-100 to-fuchsia-100 flex items-center justify-center text-violet-700 font-bold mr-3 border border-violet-200/50 shadow-inner">
                          {teacher.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <GraduationCap size={14} className="mr-1 text-slate-400" />
                        {teacher.subject}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-slate-700">{teacher.students}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700">
                        {teacher.commissionRate * 100}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right bg-violet-50/30 group-hover:bg-violet-50/50 transition-colors">
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-violet-700">
                          {teacher.expectedIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Est. Payout</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;
