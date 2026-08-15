import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Wallet, Users, BookOpen, Calculator } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.linkedId) {
      axios.get(`${API_URL}/teacher/${user.linkedId}/dashboard`)
        .then(res => setData(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    </div>
  );

  if (!data) return (
    <div className="text-center mt-20 text-slate-500">
      Failed to load dashboard. Ensure your teacher account is properly linked.
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome, {user.name}</h2>
        <p className="text-slate-500 font-medium mt-1">Teacher ID: {user.linkedId} • Subject: {data.teacher.subject}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stat Cards */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Total Classes</p>
            <p className="text-2xl font-black text-slate-800">{data.classes.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Active Students</p>
            <p className="text-2xl font-black text-slate-800">{data.totalStudents}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 rounded-3xl shadow-lg shadow-violet-200 flex items-center gap-4 text-white">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-violet-100 uppercase tracking-wider mb-1">Expected Income / Cut</p>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-4 gap-y-1">
              <span className="text-xl font-black">Rs. {(data.expectedWeeklyIncome || 0).toLocaleString()} <span className="text-xs font-medium text-violet-200">/week</span></span>
              <span className="text-xl font-black">Rs. {(data.expectedMonthlyIncome || 0).toLocaleString()} <span className="text-xs font-medium text-violet-200">/mo</span></span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
              <Calculator size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">My Classes & Commission Breakdown</h3>
          </div>
          <div className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Rate: {Math.round((data.teacher?.commissionRate > 1 ? data.teacher.commissionRate / 100 : (data.teacher?.commissionRate || 0.5)) * 100)}%
          </div>
        </div>
        
        <div className="p-6">
          {data.classes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.classes.map((cls) => {
                const commPct = Math.round((data.teacher?.commissionRate > 1 ? data.teacher.commissionRate / 100 : (data.teacher?.commissionRate || 0.5)) * 100);
                
                const nameStr = String(cls.name || '').toLowerCase();
                const gradeStr = String(cls.grade || '').toLowerCase();
                const clean = `${nameStr} ${gradeStr.replace(/general/g, '')}`;
                const isAL = cls.feeType === 'monthly' || (cls.feeType !== 'weekly' && (
                  clean.includes('12') || clean.includes('13') || clean.includes('a/l') || clean.includes(' a/l') || clean.includes('al ') || clean.includes(' al') || clean.includes('advanced level') || clean.includes('combined')
                ));
                const isWeekly = !isAL;

                let displayFee = 250;
                if (isWeekly) {
                  displayFee = cls.weeklyFee || (cls.fee && cls.fee <= 500 ? cls.fee : Math.round((cls.fee || 1000) / 4));
                  if (!displayFee || displayFee > 500) displayFee = 250;
                } else {
                  displayFee = cls.fee || 2500;
                }

                const feeUnit = isWeekly ? 'week' : 'mo';
                const expectedCut = cls.expectedCut !== undefined ? cls.expectedCut : (isWeekly ? Math.round((cls.expectedIncome || 0) / 4) : (cls.expectedIncome || 0));
                const cutUnit = isWeekly ? 'week' : 'mo';

                return (
                  <div key={cls.classId} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{cls.name}</h4>
                      <p className="text-sm font-medium text-slate-500 mb-4">{cls.schedule} • Grade: {cls.grade || 'General'}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-200 border-dashed">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Students</p>
                        <p className="font-bold text-slate-700">{cls.studentsCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Class Fee</p>
                        <p className="font-bold text-slate-700">
                          Rs. {displayFee.toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">/{feeUnit}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase">Est. Cut ({commPct}%)</p>
                        <p className="font-black text-violet-700">
                          Rs. {expectedCut.toLocaleString()} <span className="text-[10px] text-violet-400 font-medium">/{cutUnit}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">You don't have any classes assigned yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
