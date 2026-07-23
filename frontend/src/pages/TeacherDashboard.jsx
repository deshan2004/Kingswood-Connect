import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Wallet, Users, BookOpen, Calculator } from 'lucide-react';
import ChangePassword from '../components/ChangePassword';

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
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-100">Expected Income (Rs.)</p>
            <p className="text-2xl font-black">{data.expectedIncome.toLocaleString()}</p>
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
            Rate: {data.teacher.commissionRate * 100}%
          </div>
        </div>
        
        <div className="p-6">
          {data.classes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.classes.map((cls) => (
                <div key={cls.classId} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{cls.name}</h4>
                    <p className="text-sm font-medium text-slate-500 mb-4">{cls.schedule} • Grade: {cls.grade}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-200 border-dashed">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Students</p>
                      <p className="font-bold text-slate-700">{cls.studentsCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Class Fee</p>
                      <p className="font-bold text-slate-700">Rs. {cls.fee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase">Est. Cut</p>
                      <p className="font-black text-violet-700">Rs. {cls.expectedIncome.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">You don't have any classes assigned yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
