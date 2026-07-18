import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, UserX, Clock, Activity, TrendingUp, QrCode } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-start justify-between relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 bg-${color}-500`}></div>
    <div>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-end gap-3">
        <h3 className="text-4xl font-black text-slate-800">{value}</h3>
        {trend && (
          <span className="flex items-center text-sm font-medium text-emerald-500 mb-1">
            <TrendingUp size={16} className="mr-1" /> {trend}
          </span>
        )}
      </div>
    </div>
    <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 shadow-inner`}>
      <Icon size={28} strokeWidth={1.5} />
    </div>
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    recentScans: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance/dashboard`);
      setData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      let errorMessage = 'Cannot connect to backend.';
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(`Connection Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Total', value: data.totalStudents, fill: '#6366f1' },
    { name: 'Present', value: data.presentToday, fill: '#10b981' },
    { name: 'Absent', value: data.absentToday, fill: '#f43f5e' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time attendance metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Activity size={16} className="animate-pulse" /> Live Status
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-medium rounded-r-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Students" value={data.totalStudents} icon={Users} color="indigo" />
        <StatCard title="Present Today" value={data.presentToday} icon={UserCheck} color="emerald" trend="+12%" />
        <StatCard title="Absent Today" value={data.absentToday} icon={UserX} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity className="text-indigo-500" /> Attendance Overview
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500, fontSize: 14 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 500 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="text-blue-500" /> Recent Scans
            </h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase tracking-wide">Live</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
            {data.recentScans.map((scan) => (
              <div key={scan._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group">
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{scan.student.name}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{scan.student.grade}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 shadow-sm">
                    {scan.status}
                  </span>
                  <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center justify-end gap-1">
                    <Clock size={12} />
                    {new Date(scan.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {data.recentScans.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center justify-center text-slate-400">
                <QrCode size={48} className="mb-3 opacity-20" />
                <p className="font-medium">No scans recorded today yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
