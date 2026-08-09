import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Search, MoreVertical, QrCode, MessageSquare, CheckCircle2, AlertCircle, X, Edit2, Filter, UserMinus, RefreshCw } from 'lucide-react';
import Select from 'react-select';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [cardType, setCardType] = useState('normal'); // 'normal', 'half', 'free'
  const [feeType, setFeeType] = useState('weekly'); // 'weekly' (Grade 6-11) or 'monthly' (Grade 12-13 A/L)
  const [defaultFee, setDefaultFee] = useState(250);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Edit State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editEnrolledClasses, setEditEnrolledClasses] = useState([]);
  const [editCardType, setEditCardType] = useState('normal');
  const [editFeeType, setEditFeeType] = useState('weekly');
  const [editDefaultFee, setEditDefaultFee] = useState(250);
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

  const handleCleanupInactive = async () => {
    setCleanupLoading(true);
    try {
      const response = await axios.post(`${API_URL}/students/cleanup-inactive`);
      const { removedEnrollmentsCount, updatedStudentsCount } = response.data;

      if (removedEnrollmentsCount > 0) {
        showToast('success', `Auto-cleaned ${removedEnrollmentsCount} inactive class enrollment(s) across ${updatedStudentsCount} student(s).`);
      } else {
        showToast('success', 'No inactive enrollments found! All student class registrations are active.');
      }
      fetchData();
    } catch (err) {
      console.error('Cleanup error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to run inactive student cleanup.';
      showToast('error', errMsg);
    } finally {
      setCleanupLoading(false);
    }
  };

  const sendWhatsApp = async (student, dataUrl) => {
    if (!dataUrl || !student.contact) {
      showToast('error', "Missing contact number or QR code");
      return;
    }
    
    try {
      const loginEmail = student.email || `${student.studentId.toLowerCase()}@kingswood.edu`;
      const loginPassword = student.password || student.contact.replace(/\s+/g, '');
      const qrImageUrl = `${window.location.origin}/images/QR-${student.studentId}.png`;
      const autoLoginLink = `${window.location.origin}/login?email=${encodeURIComponent(loginEmail)}&password=${encodeURIComponent(loginPassword)}`;
      
      let phone = student.contact.replace(/[^0-9]/g, '');
      if (phone.startsWith('0')) {
        phone = '94' + phone.substring(1);
      }

      const message = `🎓 *KINGSWOOD CONNECT STUDENT ADMISSION PASS*
Dear ${student.name}, welcome to Kingswood Connect Education!

🔐 *STUDENT PORTAL LOGIN DETAILS*
> 🆔 *Student ID:* \`${student.studentId}\`
> 📧 *Username:* \`${loginEmail}\`
> 🔒 *Password:* \`${loginPassword}\`

🌐 *Direct One-Tap Login Portal:*
${autoLoginLink}

📱 *YOUR ATTENDANCE QR CODE PASS*
> 📌 *QR Link:* ${qrImageUrl}

💡 _Note: Please save your QR Code pass to your photo gallery. Show this QR code to mark attendance at every class session._
───────────────────────────
🏛 *Kingswood Connect Student Management System*`;
      
      const text = encodeURIComponent(message);
      window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
      
    } catch (error) {
      console.error("WhatsApp error", error);
    }
  };

  const handleGradeChange = (val) => {
    setGrade(val);
    const g = String(val).toLowerCase();
    if (g.includes('12') || g.includes('13') || g.includes('a/l') || g.includes('al')) {
      setFeeType('monthly');
      setDefaultFee(3500);
    } else if (g) {
      setFeeType('weekly');
      setDefaultFee(250);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/students`, { 
        name, email, grade, contact, password, enrolledClasses,
        cardType, feeType, defaultFee: Number(defaultFee) || (feeType === 'monthly' ? 3500 : 250)
      });
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
      setCardType('normal');
      setFeeType('weekly');
      setDefaultFee(250);
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
    setEditCardType(student.cardType || 'normal');
    
    const g = String(student.grade || '').toLowerCase();
    const isAL = g.includes('12') || g.includes('13') || g.includes('a/l') || g.includes('al');
    const fType = student.feeType || (isAL ? 'monthly' : 'weekly');
    setEditFeeType(fType);
    setEditDefaultFee(student.defaultFee || (fType === 'monthly' ? 3500 : 250));
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(`${API_URL}/students/${editingStudent.studentId}`, {
        name: editName,
        grade: editGrade,
        contact: editContact,
        enrolledClasses: editEnrolledClasses,
        cardType: editCardType,
        feeType: editFeeType,
        defaultFee: Number(editDefaultFee) || (editFeeType === 'monthly' ? 3500 : 250)
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
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleCleanupInactive}
            disabled={cleanupLoading}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-sm"
            title="Auto-remove students from classes if inactive for 2+ months (no attendance & no payments)"
          >
            <RefreshCw size={16} className={cleanupLoading ? "animate-spin text-amber-600" : "text-amber-600"} />
            {cleanupLoading ? 'Cleaning Up...' : 'Auto-Cleanup Inactive (2+ Months)'}
          </button>

          <button 
            onClick={() => setShowRegisterModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <UserPlus size={20} /> Register Student
          </button>
        </div>
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
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none z-10">
                <Filter size={18} />
              </span>
              <Select
                value={{ value: filterClass, label: filterClass === 'all' ? 'All Classes' : classesList.find(c => c.classId === filterClass)?.name || 'Select Class' }}
                onChange={(selectedOption) => setFilterClass(selectedOption.value)}
                options={[
                  { value: 'all', label: 'All Classes' },
                  ...classesList.map(c => ({ value: c.classId, label: c.name }))
                ]}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    paddingLeft: '2rem',
                    minHeight: '44px',
                    borderRadius: '0.75rem',
                    borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                    '&:hover': {
                      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1'
                    },
                    backgroundColor: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#1e293b'
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : 'transparent',
                    color: state.isSelected ? '#ffffff' : '#1e293b',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    zIndex: 50
                  })
                }}
              />
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
                      <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Card Type</th>
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
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 items-start">
                            {student.cardType === 'free' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                🎁 Free Card
                              </span>
                            ) : student.cardType === 'half' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                🌗 Half Card (50%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                💳 Normal
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-slate-500">
                              {student.feeType === 'monthly' ? `📅 Monthly: Rs. ${student.defaultFee || 3500}` : `🗓️ Weekly: Rs. ${student.defaultFee || 250}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-700 max-w-[150px]">
                          {student.enrolledClasses && student.enrolledClasses.length > 0 ? (
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none truncate">
                              <option value="">{student.enrolledClasses.length} classes</option>
                              {student.enrolledClasses.map(classId => {
                                const cls = classesList.find(c => c.classId === classId);
                                return <option key={classId} value={classId}>{cls ? cls.name : classId}</option>
                              })}
                            </select>
                          ) : (
                            <span className="text-slate-400 font-medium px-2">0 classes</span>
                          )}
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
                  <p className="mt-1 text-xs text-slate-400 font-medium">If empty, system email (e.g. kws-1002@kingswood.edu) will be created.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Grade/Class</label>
                    <input 
                      type="text" 
                      required
                      value={grade}
                      onChange={(e) => handleGradeChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-800 text-sm"
                      placeholder="e.g. Grade 10 or Grade 12 (A/L)"
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

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Card Type</label>
                    <select
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value)}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-xs cursor-pointer"
                    >
                      <option value="normal">💳 Normal</option>
                      <option value="half">🌗 Half (50%)</option>
                      <option value="free">🎁 Free Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Fee Model</label>
                    <select
                      value={feeType}
                      onChange={(e) => {
                        setFeeType(e.target.value);
                        if (e.target.value === 'monthly') setDefaultFee(3500);
                        else setDefaultFee(250);
                      }}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-xs cursor-pointer"
                    >
                      <option value="weekly">🗓️ Weekly (Gr 6-11)</option>
                      <option value="monthly">📅 Monthly (Gr 12-13)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Fee Amount (Rs.)</label>
                    <input 
                      type="number" 
                      value={defaultFee}
                      onChange={(e) => setDefaultFee(e.target.value)}
                      disabled={cardType === 'free'}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 text-xs disabled:opacity-50"
                      placeholder="250"
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
                  <p className="mt-1 text-xs text-slate-400 font-medium">If empty, student's contact number will be set as their initial password.</p>
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

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Card Type</label>
                    <select
                      value={editCardType}
                      onChange={(e) => setEditCardType(e.target.value)}
                      className="w-full bg-slate-50 border-0 rounded-xl px-3 py-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="normal">💳 Normal</option>
                      <option value="half">🌗 Half (50%)</option>
                      <option value="free">🎁 Free Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fee Model</label>
                    <select
                      value={editFeeType}
                      onChange={(e) => {
                        setEditFeeType(e.target.value);
                        if (e.target.value === 'monthly') setEditDefaultFee(3500);
                        else setEditDefaultFee(250);
                      }}
                      className="w-full bg-slate-50 border-0 rounded-xl px-3 py-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="weekly">🗓️ Weekly (Gr 6-11)</option>
                      <option value="monthly">📅 Monthly (Gr 12-13)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fee Amount (Rs.)</label>
                    <input
                      type="number"
                      value={editDefaultFee}
                      onChange={(e) => setEditDefaultFee(e.target.value)}
                      disabled={editCardType === 'free'}
                      className="w-full bg-slate-50 border-0 rounded-xl px-3 py-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      placeholder="250"
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
