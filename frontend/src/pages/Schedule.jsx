import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, BellRing, ChevronRight, MessageSquareWarning } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Schedule = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API_URL}/classes`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = (className) => {
    alert(`[MOCK] SMS/WhatsApp broadcast sent to all students in ${className} regarding schedule updates.`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Class Scheduler</h2>
          <p className="text-slate-500 font-medium mt-1">Manage timetables and broadcast urgent updates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Broadcast Panel (Moved to left for better UX hierarchy if needed, but keeping right as requested generally, let's keep it on right for desktop, top for mobile if reversed) */}
        
        {/* Class List */}
        <div className="xl:col-span-2 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-700 text-lg flex items-center">
              <CalendarIcon size={20} className="mr-2 text-indigo-500" /> Upcoming Classes
            </h3>
            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">This Week</span>
          </div>

          {loading ? (
             <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {classes.map(cls => (
                <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md hover:border-indigo-200 transition-all">
                  <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight">
                          {cls.name}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center">
                           {cls.teacher}
                        </p>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
                        <CalendarIcon size={20} />
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between mb-5 border border-slate-100">
                      <span className="flex items-center text-sm font-bold text-slate-600">
                        <Clock size={16} className="mr-2 text-slate-400" /> Time
                      </span>
                      <span className="text-sm font-bold text-indigo-700">
                        {cls.time}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleBroadcast(cls.name)}
                      className="w-full py-2.5 rounded-xl border-2 border-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center hover:bg-indigo-50 hover:border-indigo-200 transition-colors active:scale-95 group/btn"
                    >
                      <BellRing size={16} className="mr-2 group-hover/btn:animate-pulse" /> Broadcast Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Broadcast Panel */}
        <div className="xl:col-span-1">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[80px] -z-0 opacity-20 translate-x-10 -translate-y-10"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                <MessageSquareWarning className="mr-3 text-rose-400" size={24} /> Urgent Broadcast
              </h3>
              <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">
                Instantly dispatch SMS or WhatsApp alerts to specific student groups regarding schedule changes or emergencies.
              </p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Target Group</label>
                  <div className="relative">
                    <select className="w-full px-4 py-3.5 bg-slate-800/50 border border-slate-600 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-colors">
                      <option>All Grade 10 Students</option>
                      <option>All Grade 11 Students</option>
                      <option>All Students (Global)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Message Content</label>
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-32 resize-none placeholder-slate-600"
                    placeholder="E.g., Today's Science class is cancelled due to unavoidable circumstances..."
                  ></textarea>
                </div>
                <button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                  <BellRing size={18} /> Dispatch Alerts Now
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Schedule;
