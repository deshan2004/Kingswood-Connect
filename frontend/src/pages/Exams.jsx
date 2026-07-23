import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Search, CheckCircle2, ChevronDown, User, Filter, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Exams = () => {
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [marks, setMarks] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      let classes = res.data;
      if (user?.role === 'teacher' && user?.linkedId) {
        classes = classes.filter(c => c.teacherId === user.linkedId);
      }
      setClassesList(classes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForClass = async (classId) => {
    if (!classId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/students`);
      const allStudents = res.data;
      const enrolled = allStudents.filter(s => s.enrolledClasses && s.enrolledClasses.includes(classId));
      setStudents(enrolled);
      setMarks({}); // reset marks
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const cid = e.target.value;
    setSelectedClass(cid);
    fetchStudentsForClass(cid);
  };

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !examTitle) {
      showToast('error', 'Please select a class and enter an exam title.');
      return;
    }
    setSubmitting(true);
    
    // Prepare marks array
    const marksArray = students.map(s => ({
      studentId: s.studentId,
      mark: marks[s.studentId] || 0
    }));

    try {
      await axios.post(`${API_URL}/exams`, {
        classId: selectedClass,
        title: examTitle,
        date: examDate,
        marks: marksArray
      });
      showToast('success', 'Exam marks saved successfully!');
      setExamTitle('');
      setExamDate('');
      setMarks({});
    } catch (error) {
      showToast('error', 'Failed to save exam marks.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative">
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
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Exam Marks</h2>
          <p className="text-slate-500 font-medium mt-1">Record and manage student performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-slate-700 text-lg mb-4 flex items-center">
              <Award className="mr-2 text-indigo-500" size={20} /> Exam Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Select Class</label>
                <select 
                  value={selectedClass}
                  onChange={handleClassChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                >
                  <option value="">-- Choose a Class --</option>
                  {classesList.map(c => (
                    <option key={c.classId} value={c.classId}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Exam Title</label>
                <input 
                  type="text" 
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Mid Term Test 1"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Date</label>
                <input 
                  type="date" 
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                />
              </div>

            </div>
          </div>
        </div>

        {/* Right Panel: Student List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-700 text-lg flex items-center">
                <User className="mr-2 text-blue-500" size={20} /> Input Marks
              </h3>
              <span className="text-sm font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                {students.length} Students
              </span>
            </div>

            {loading ? (
               <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
               </div>
            ) : !selectedClass ? (
              <div className="p-12 text-center text-slate-400">
                <Filter size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium text-lg">No Class Selected</p>
                <p className="text-sm">Please select a class to view enrolled students.</p>
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <User size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium text-lg">No Students Found</p>
                <p className="text-sm">There are no students enrolled in this class.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Marks (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map(student => (
                        <tr key={student.studentId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-6">
                            <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                              {student.studentId}
                            </span>
                          </td>
                          <td className="py-3 px-6 font-bold text-slate-800">
                            {student.name}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <input 
                              type="number"
                              min="0"
                              max="100"
                              required
                              value={marks[student.studentId] || ''}
                              onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                              className="w-24 text-right px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-slate-700"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                  >
                    {submitting ? 'Saving...' : 'Save All Marks'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;
