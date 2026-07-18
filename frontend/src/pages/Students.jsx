import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Search, MoreVertical, QrCode, MessageSquare, CheckCircle2, AlertCircle, X, Edit2, Filter } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Edit State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editEnrolledClasses, setEditEnrolledClasses] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Filters
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 10000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/classes`)
      ]);
      setStudents(studentsRes.data);
      setClassesList(classesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (studentId, dataUrl) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QR-${studentId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendWhatsApp = async (student, dataUrl) => {
    if (!dataUrl || !student.contact) {
      showToast('error', "Missing contact number or QR code");
      return;
    }
    
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      try {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        showToast('success', "QR Image copied to clipboard! Just press Paste (Ctrl+V) in the WhatsApp chat to send it.");
      } catch (clipboardErr) {
        console.warn("Clipboard copy failed, downloading fallback", clipboardErr);
        downloadQR(student.studentId, dataUrl);
      }

      let phone = student.contact.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '94' + phone.substring(1);
      }
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${student.studentId}`;
      let message = `Hello ${student.name},\n\nWelcome to Kingswood Connect! Your Student ID is *${student.studentId}*.\n`;
      if (student.email && student.password) {
        message += `\n*Student Portal Login*\nLink: https://kingswood-connect.vercel.app/login\nEmail: ${student.email}\nPassword: ${student.password}\n`;
      }
      message += `\n*Your QR Code:*\n${qrImageUrl}\n\nPlease save this QR code image to mark your attendance. (You can also paste the image directly if it was copied).`;
      
      const text = encodeURIComponent(message);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      
    } catch (error) {
      console.error("WhatsApp error", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/students`, { name, email, grade, contact, password, enrolledClasses });
      const newStudent = response.data;
      
      if (newStudent.qrCodeUrl) {
        showToast('success', 'Student registered successfully!');
        sendWhatsApp(newStudent, newStudent.qrCodeUrl);
      }
      
      setName('');
      setEmail('');
      setGrade('');
      setContact('');
      setPassword('');
      setEnrolledClasses([]);
      setShowRegisterModal(false); // Close modal on success
      fetchData(); // Refresh list
    } catch (error) {
      alert('Failed to register student');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleClass = (classId) => {
    if (enrolledClasses.includes(classId)) {
      setEnrolledClasses(enrolledClasses.filter(id => id !== classId));
    } else {
      setEnrolledClasses([...enrolledClasses, classId]);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditGrade(student.grade || '');
    setEditContact(student.contact || '');
    setEditEnrolledClasses(student.enrolledClasses || []);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(`${API_URL}/students/${editingStudent.studentId}`, {
        name: editName,
        grade: editGrade,
        contact: editContact,
        enrolledClasses: editEnrolledClasses
      });
      showToast('success', 'Student updated successfully!');
      setEditingStudent(null);
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Update error:', error);
      showToast('error', 'Failed to update student');
    } finally {
      setUpdating(false);
    }
  };

  const filteredStudents = students.filter(student => {
    // Filter by class
    if (filterClass !== 'all') {
      if (!student.enrolledClasses || !student.enrolledClasses.includes(filterClass)) {
        return false;
      }
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        (student.name && student.name.toLowerCase().includes(query)) ||
        (student.studentId && student.studentId.toLowerCase().includes(query)) ||
        (student.contact && student.contact.includes(query));
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      
      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm border ${
            toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-100 shrink-0" /> : <AlertCircle size={24} className="text-rose-100 shrink-0" />}
            <div>
              <h4 className="font-bold text-lg mb-0.5">{toast.type === 'success' ? 'Success!' : 'Error'}</h4>
              <p className="opacity-90 leading-tight text-sm">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-2 p-1.5 hover:bg-black/10 rounded-full transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Directory</h2>
          <p className="text-slate-500 font-medium mt-1">Manage enrollments and profiles</p>
        </div>
        <button 
          onClick={() => setShowRegisterModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <UserPlus size={20} /> Register Student
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-slate-800"
              />
            </div>
            
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Filter size={18} />
              </span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-bold text-slate-800 appearance-none cursor-pointer"
              >
                <option value="all">All Classes</option>
                {classesList.map(c => (
                  <option key={c.classId} value={c.classId}>{c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 shadow-sm">
            {filteredStudents.length} Students
          </div>
        </div>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Classes</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{student.name}</div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5">{student.contact}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                            {student.studentId}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-700">
                          {student.grade}
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-700">
                          {student.enrolledClasses ? student.enrolledClasses.length : 0} classes
                        </td>
                        <td className="py-4 px-6 text-right flex items-center justify-end gap-1">
                          <button 
                            onClick={() => openEditModal(student)}
                            title="Edit Student"
                            className="text-blue-500 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button 
                            onClick={() => sendWhatsApp(student, student.qrCodeUrl)}
                            title="Send via WhatsApp"
                            className="text-emerald-500 hover:text-emerald-700 transition-colors p-2 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          >
                            <MessageSquare size={20} />
                          </button>
                          <button 
                            onClick={() => downloadQR(student.studentId, student.qrCodeUrl)}
                            title="Download QR Code"
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg cursor-pointer"
                          >
                            <QrCode size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400">
                          <Users size={48} className="mx-auto mb-3 opacity-20" />
                          <p className="font-medium text-lg">No students found</p>
                          <p className="text-sm">Try adjusting your search or filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      {/* Register Student Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 flex items-center">
                <UserPlus className="mr-3 text-blue-500" size={20} /> Register Student
              </h3>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 text-sm"
                    placeholder="e.g. Kasun Perera"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 text-sm"
                    placeholder="student@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Grade/Class</label>
                    <input 
                      type="text" 
                      required
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 text-sm"
                      placeholder="e.g. 10-A"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Parent Contact</label>
                    <input 
                      type="text" 
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 text-sm"
                      placeholder="e.g. 0771234567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Password (Optional)</label>
                  <input 
                    type="text" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 text-sm"
                    placeholder="Leave empty to use phone number"
                  />
                </div>

                {classesList.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Enroll in Classes</label>
                    <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto border border-slate-100 space-y-3">
                      {classesList.map(c => (
                        <label key={c.classId} className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={enrolledClasses.includes(c.classId)}
                              onChange={() => toggleClass(c.classId)}
                              className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-colors"
                            />
                            <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                            {c.name} <span className="text-slate-400 font-medium ml-1">({c.teacherName})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                  <button 
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                  >
                    {submitting ? 'Registering...' : 'Register Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800">Edit Student</h3>
              <button 
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUpdateStudent} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grade/Class</label>
                    <input
                      type="text"
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      required
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact</label>
                    <input
                      type="text"
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                      required
                      className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enrolled Classes</label>
                  <div className="bg-slate-50 rounded-xl p-4 max-h-48 overflow-y-auto border border-slate-100">
                    {classesList.length > 0 ? (
                      <div className="space-y-3">
                        {classesList.map(c => (
                          <label key={c.classId} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox"
                                checked={editEnrolledClasses.includes(c.classId)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditEnrolledClasses([...editEnrolledClasses, c.classId]);
                                  } else {
                                    setEditEnrolledClasses(editEnrolledClasses.filter(id => id !== c.classId));
                                  }
                                }}
                                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-colors"
                              />
                              <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                              {c.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-500 text-center py-4">No classes available.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
