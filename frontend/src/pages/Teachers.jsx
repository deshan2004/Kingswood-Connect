import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, UserCog, Briefcase, GraduationCap, Edit } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '', contact: '', subject: '', commissionRate: 50 });
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTeacher) {
        await axios.put(`${API_URL}/teachers/${editingTeacher.teacherId}`, {
          name: newTeacher.name,
          email: newTeacher.email,
          password: newTeacher.password,
          contact: newTeacher.contact,
          subject: newTeacher.subject,
          commissionRate: newTeacher.commissionRate / 100
        });
      } else {
        await axios.post(`${API_URL}/auth/signup`, {
          name: newTeacher.name,
          email: newTeacher.email,
          password: newTeacher.password,
          role: 'teacher',
          contact: newTeacher.contact,
          subject: newTeacher.subject,
          commissionRate: newTeacher.commissionRate
        });
      }
      setShowModal(false);
      setEditingTeacher(null);
      setNewTeacher({ name: '', email: '', password: '', contact: '', subject: '', commissionRate: 50 });
      fetchTeachers();
    } catch (error) {
      alert(`Failed to ${editingTeacher ? 'update' : 'add'} teacher: ` + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setNewTeacher({
      name: teacher.name,
      email: '', // Not editable via this modal
      password: '', // Not editable via this modal
      contact: teacher.contact,
      subject: teacher.subject,
      commissionRate: (teacher.commissionRate || 0) * 100
    });
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Faculty & Commissions</h2>
          <p className="text-slate-500 font-medium mt-1">Manage instructors and calculate monthly payouts</p>
        </div>
        <button 
          onClick={() => {
            setEditingTeacher(null);
            setNewTeacher({ name: '', email: '', password: '', contact: '', subject: '', commissionRate: 50 });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center justify-center sm:justify-start transition-all shadow-lg shadow-indigo-200 active:scale-95 w-full sm:w-auto"
        >
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
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
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
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => openEditModal(teacher)}
                        className="p-2 bg-slate-100 hover:bg-violet-100 text-slate-500 hover:text-violet-600 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      {/* Add Teacher Modal */}
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
              <UserCog className="mr-2 text-violet-600" />
              {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </h3>
            
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="e.g. Nimal Perera"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required={!editingTeacher} // Only required when adding
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder={editingTeacher ? "Leave blank to keep unchanged" : "e.g. nimal@example.com"}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required={!editingTeacher} // Only required when adding
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder={editingTeacher ? "Leave blank to keep unchanged" : "Minimum 6 characters"}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Contact No</label>
                <input 
                  type="text" 
                  required
                  value={newTeacher.contact}
                  onChange={(e) => setNewTeacher({...newTeacher, contact: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="e.g. 0771234567"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  value={newTeacher.subject}
                  onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder="e.g. Science"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Commission Percentage (%)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max="100"
                  value={newTeacher.commissionRate}
                  onChange={(e) => setNewTeacher({...newTeacher, commissionRate: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
                <p className="text-xs text-slate-500 mt-1">E.g. 50 means 50% from class fees.</p>
              </div>
              
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (editingTeacher ? 'Update Teacher' : 'Save Teacher')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Teachers;
