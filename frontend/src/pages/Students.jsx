import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Search, MoreVertical, QrCode, MessageSquare, CheckCircle2, AlertCircle, X } from 'lucide-react';

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
        sendWhatsApp(newStudent, newStudent.qrCodeUrl);
      }
      
      setName('');
      setEmail('');
      setGrade('');
      setContact('');
      setPassword('');
      setEnrolledClasses([]);
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

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Student Directory</h2>
          <p className="text-slate-500 font-medium mt-1">Manage enrollments and profiles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Registration Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10"></div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <UserPlus className="mr-3 text-blue-500" size={24} /> New Student
            </h3>
            
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                  placeholder="e.g. Kasun Perera"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email (Optional)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                  placeholder="student@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Grade/Class</label>
                <input 
                  type="text" 
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                  placeholder="e.g. 10-A"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Parent Contact</label>
                <input 
                  type="text" 
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                  placeholder="e.g. 0771234567"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Password (Optional)</label>
                <input 
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800"
                  placeholder="Leave empty to use phone number"
                />
              </div>

              {classesList.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Enroll in Classes</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {classesList.map(c => (
                      <label key={c.classId} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <input 
                          type="checkbox" 
                          checked={enrolledClasses.includes(c.classId)}
                          onChange={() => toggleClass(c.classId)}
                          className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-800">{c.name} - {c.teacherName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submitting ? 'Registering...' : 'Register Student'}
              </button>
            </form>
          </div>
        </div>

        {/* Student List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="relative w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search size={18} />
                </span>
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-medium text-slate-800"
                />
              </div>
              <div className="text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                {students.length} Total
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
                    {students.map((student) => (
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
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-slate-400">
                          <Users size={48} className="mx-auto mb-3 opacity-20" />
                          <p className="font-medium text-lg">No students found</p>
                          <p className="text-sm">Register a student to get started.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
