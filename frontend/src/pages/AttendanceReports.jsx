import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { ClipboardList, Search, MessageCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AttendanceReports = () => {
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedMonth) {
      fetchReports();
    }
  }, [selectedClass, selectedMonth]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      let classes = res.data;
      if (user?.role === 'teacher' && user?.linkedId) {
        classes = classes.filter(c => c.teacherId === user.linkedId);
      }
      setClassesList(classes);
      if (classes.length > 0) {
        setSelectedClass(classes[0].classId);
      }
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/attendance/reports?classId=${selectedClass}&month=${selectedMonth}`);
      setReports(res.data);
    } catch (error) {
      console.error('Failed to fetch attendance reports', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppWarning = (student) => {
    const className = classesList.find(c => c.classId === selectedClass)?.name || 'the class';
    const message = `Kingswood Connect Alert: \nDear Parent, ${student.studentName}'s attendance for ${className} in ${selectedMonth} is low (${student.percentage}%). Please ensure regular attendance.`;
    const encodedMessage = encodeURIComponent(message);
    let contact = student.contact;
    if (contact.startsWith('0')) {
      contact = '94' + contact.substring(1);
    }
    window.open(`https://wa.me/${contact}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Attendance Reports</h2>
          <p className="text-slate-500 font-medium mt-1">Track student attendance and send low attendance warnings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-700 mb-1">Select Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          >
            <option value="">-- Choose Class --</option>
            {classesList.map(c => (
              <option key={c.classId} value={c.classId}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-700 mb-1">Select Month</label>
          <input 
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
          />
        </div>
      </div>

      {/* Report Table */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : reports.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Days Present</th>
                  <th className="py-4 px-6 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance %</th>
                  <th className="py-4 px-6 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((student, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold">
                          {student.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{student.studentName}</div>
                          <div className="text-xs text-slate-500">{student.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-slate-700">
                        {student.daysPresent} <span className="text-slate-400 text-sm font-normal">/ {student.totalClassDays}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {student.totalClassDays === 0 ? (
                        <span className="text-slate-400 font-medium">N/A</span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          student.percentage >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                          student.percentage >= 50 ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.percentage}%
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {(student.percentage < 50 && student.totalClassDays > 0) ? (
                        <button 
                          onClick={() => handleWhatsAppWarning(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 font-bold text-sm rounded-lg transition-colors border border-green-200"
                        >
                          <MessageCircle size={16} /> Warning
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-sm font-medium">
                          <CheckCircle2 size={16} /> Good
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No Attendance Data Found</h3>
          <p className="text-slate-500">There are no attendance records for the selected class and month.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;
