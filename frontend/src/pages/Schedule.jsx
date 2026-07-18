import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, BellRing, ChevronRight, MessageSquareWarning } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Schedule = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', teacherId: '', time: '', fee: 1000 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        axios.get(`${API_URL}/classes`),
        axios.get(`${API_URL}/teachers/commission`)
      ]);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
      if (teachersRes.data.length > 0) {
        setNewClass(prev => ({ ...prev, teacherId: teachersRes.data[0].teacherId }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedTeacher = teachers.find(t => t.teacherId === newClass.teacherId);
      await axios.post(`${API_URL}/classes`, {
        name: newClass.name,
        teacherId: newClass.teacherId,
        teacherName: selectedTeacher ? selectedTeacher.name : 'Unknown',
        time: newClass.time,
        fee: Number(newClass.fee)
      });
      setShowModal(false);
      setNewClass({ name: '', teacherId: teachers[0]?.teacherId || '', time: '', fee: 1000 });
      fetchData();
    } catch (error) {
      alert('Failed to add class');
    } finally {
      setSubmitting(false);
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
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <CalendarIcon size={18} className="mr-2" />
          Add Class
        </button>
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

      {/* Add Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center">
              <CalendarIcon className="mr-2 text-indigo-600" />
              Add New Class
            </h3>
            
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Class Name</label>
                <input 
                  type="text" 
                  required
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. A/L Science 2026"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Teacher</label>
                <select
                  required
                  value={newClass.teacherId}
                  onChange={(e) => setNewClass({...newClass, teacherId: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="" disabled>Select a teacher</option>
                  {teachers.map(t => (
                    <option key={t.teacherId} value={t.teacherId}>{t.name} ({t.subject})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Schedule Time</label>
                <input 
                  type="text" 
                  required
                  value={newClass.time}
                  onChange={(e) => setNewClass({...newClass, time: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Saturday 8:00 AM - 12:00 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Fee (Rs.)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={newClass.fee}
                  onChange={(e) => setNewClass({...newClass, fee: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Save Class'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Schedule;
