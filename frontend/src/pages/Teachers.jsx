import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, UserCog, Briefcase, GraduationCap, Edit, Trash2 } from 'lucide-react';
import { auth } from '../config/firebase';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '', confirmPassword: '', contact: '', subject: '', commissionRate: 50 });
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    variant: 'danger',
    loading: false,
    onConfirm: null
  });

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

  const handleDeleteTeacher = (teacherId, teacherName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Teacher?',
      message: `Are you sure you want to delete teacher "${teacherName}"? This action cannot be undone.`,
      confirmText: 'Delete Teacher',
      variant: 'danger',
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await axios.delete(`${API_URL}/teachers/${teacherId}`);
          fetchTeachers();
        } catch (error) {
          alert('Failed to delete teacher: ' + (error.response?.data?.error || error.message));
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
        }
      }
    });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if ((!editingTeacher || newTeacher.password) && newTeacher.password !== newTeacher.confirmPassword) {
      alert('Passwords do not match! Please make sure Password and Confirm Password are identical.');
      return;
    }

    let finalEmail = (newTeacher.email || '').trim();
    if (!finalEmail && newTeacher.contact) {
      finalEmail = newTeacher.contact.trim();
    }
    if (finalEmail && !finalEmail.includes('@')) {
      const cleanPhone = finalEmail.replace(/[^0-9a-zA-Z]/g, '');
      finalEmail = `${cleanPhone}@kingswood.edu`;
    }

    setSubmitting(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (editingTeacher) {
        await axios.put(`${API_URL}/teachers/${editingTeacher.teacherId}`, {
          name: newTeacher.name,
          email: finalEmail,
          password: newTeacher.password,
          contact: newTeacher.contact,
          subject: newTeacher.subject,
          commissionRate: newTeacher.commissionRate / 100
        }, { headers });
      } else {
        await axios.post(`${API_URL}/auth/signup`, {
          name: newTeacher.name,
          email: finalEmail,
          password: newTeacher.password,
          role: 'teacher',
          contact: newTeacher.contact,
          subject: newTeacher.subject,
          commissionRate: newTeacher.commissionRate / 100
        }, { headers });
      }
      setShowModal(false);
      setEditingTeacher(null);
      setNewTeacher({ name: '', email: '', password: '', confirmPassword: '', contact: '', subject: '', commissionRate: 50 });
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
      email: teacher.email || '',
      password: '',
      confirmPassword: '',
      contact: teacher.contact,
      subject: teacher.subject,
      commissionRate: teacher.commissionRate > 1 ? teacher.commissionRate : Math.round((teacher.commissionRate || 0.5) * 100)
    });
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Teachers Management</h2>
          <p className="text-slate-500 font-medium mt-1">Manage teachers and view active student counts</p>
        </div>
        <button 
          onClick={() => {
            setEditingTeacher(null);
            setNewTeacher({ name: '', email: '', password: '', confirmPassword: '', contact: '', subject: '', commissionRate: 50 });
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center justify-center sm:justify-start transition-all shadow-lg shadow-indigo-200 active:scale-95 w-full sm:w-auto"
        >
          <UserCog size={18} className="mr-2" />
          Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -z-10 translate-x-32 -translate-y-32"></div>
        
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center text-slate-800">
            <div className="bg-violet-100 p-2 rounded-lg text-violet-600 mr-3">
              <UserCog size={20} />
            </div>
            <h3 className="font-bold text-lg">Active Teachers</h3>
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
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Active Students</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((teacher) => (
                  <tr key={teacher.teacherId} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-sm font-mono font-bold text-slate-500">{teacher.teacherId}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-100 to-fuchsia-100 flex items-center justify-center text-violet-700 font-bold mr-3 border border-violet-200/50 shadow-inner shrink-0">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-violet-600 transition-colors">{teacher.name}</div>
                          <div className="text-xs font-medium text-slate-400">{teacher.email || 'No email registered'}</div>
                        </div>
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
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(teacher)}
                          title="Edit Teacher"
                          className="p-2 bg-slate-100 hover:bg-violet-100 text-slate-500 hover:text-violet-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTeacher(teacher.teacherId, teacher.name)}
                          title="Delete Teacher"
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
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
                <label className="block text-sm font-bold text-slate-700 mb-1">Email or Phone Number</label>
                <input 
                  type="text" 
                  required={!editingTeacher} // Only required when adding
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  placeholder={editingTeacher ? "Leave blank to keep unchanged" : "e.g. nimal@example.com or 0771234567"}
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
                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  required={!editingTeacher && !!newTeacher.password} // Required when adding or when entering new password
                  value={newTeacher.confirmPassword || ''}
                  onChange={(e) => setNewTeacher({...newTeacher, confirmPassword: e.target.value})}
                  className={`w-full px-4 py-2 bg-slate-50 border rounded-xl focus:ring-2 outline-none ${
                    newTeacher.confirmPassword && newTeacher.password !== newTeacher.confirmPassword
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 focus:ring-violet-500'
                  }`}
                  placeholder={editingTeacher ? "Re-type new password to confirm" : "Re-type password"}
                />
                {newTeacher.confirmPassword && newTeacher.password !== newTeacher.confirmPassword && (
                  <p className="text-xs font-bold text-rose-500 mt-1">Passwords do not match</p>
                )}
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Teachers;
