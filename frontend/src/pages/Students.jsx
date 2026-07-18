import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Search, MoreVertical, QrCode, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
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
      alert("Missing contact number or QR code");
      return;
    }
    
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      try {
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        alert("QR Image copied to clipboard! Just press Paste (Ctrl+V) in the WhatsApp chat to send it.");
      } catch (clipboardErr) {
        console.warn("Clipboard copy failed, downloading fallback", clipboardErr);
        downloadQR(student.studentId, dataUrl);
      }

      let phone = student.contact.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '94' + phone.substring(1);
      }
      
      const text = encodeURIComponent(`Hello ${student.name},\n\nWelcome to Kingswood Connect! Your Student ID is *${student.studentId}*.\n\nPlease save the QR code image to mark your attendance.`);
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
      
    } catch (error) {
      console.error("WhatsApp error", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/students`, { name, email, grade, contact, password });
      const newStudent = response.data;
      
      if (newStudent.qrCodeUrl) {
        sendWhatsApp(newStudent, newStudent.qrCodeUrl);
      }
      
      setName('');
      setEmail('');
      setGrade('');
      setContact('');
      setPassword('');
      fetchStudents(); // Refresh list
    } catch (error) {
      alert('Failed to register student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
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
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">QR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student) => (
                      <tr key={student.studentId} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold mr-3 border border-blue-200/50">
                              {student.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-mono font-semibold text-slate-600">{student.studentId}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {student.grade}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-500">{student.contact}</td>
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
