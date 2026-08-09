import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Wallet, Users, BookOpen, Calculator } from 'lucide-react';
import ChangePassword from '../components/ChangePassword';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.linkedId) {
      axios.get(`${API_URL}/teacher/${user.linkedId}/dashboard`)
        .then(res => setData(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [cardUpdating, setCardUpdating] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleUpdateCardType = async (studentId, cardType) => {
    setCardUpdating(prev => ({ ...prev, [studentId]: true }));
    try {
      const teacherName = user?.name ? `Eng. ${user.name}` : 'Teacher';
      const res = await axios.post(`${API_URL}/teacher/update-card-type`, {
        studentId,
        cardType,
        teacherName
      });
      setToast({ type: 'success', message: res.data.message });
      setTimeout(() => setToast(null), 5000);
      fetchStudents();
    } catch (err) {
      console.error('Card update error:', err);
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to update student card' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setCardUpdating(prev => ({ ...prev, [studentId]: false }));
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
    </div>
  );

  if (!data) return (
    <div className="text-center mt-20 text-slate-500">
      Failed to load dashboard. Ensure your teacher account is properly linked.
    </div>
  );

  const myClassIds = (data.classes || []).map(c => c.classId);
  const myStudents = students.filter(s => {
    const isEnrolled = s.enrolledClasses && s.enrolledClasses.some(cId => myClassIds.includes(cId));
    if (!isEnrolled) return false;
    if (studentSearch.trim() !== '') {
      const q = studentSearch.toLowerCase();
      return (s.name && s.name.toLowerCase().includes(q)) || (s.studentId && s.studentId.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 relative">
      
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
            toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
          }`}>
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome, {user.name}</h2>
        <p className="text-slate-500 font-medium mt-1">Teacher ID: {user.linkedId} • Subject: {data.teacher.subject}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stat Cards */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Total Classes</p>
            <p className="text-2xl font-black text-slate-800">{data.classes.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Active Students</p>
            <p className="text-2xl font-black text-slate-800">{data.totalStudents}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 rounded-3xl shadow-lg shadow-violet-200 flex items-center gap-4 text-white">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-violet-100">Expected Income (Rs.)</p>
            <p className="text-2xl font-black">{data.expectedIncome.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* TEACHER FREE CARD & SCHOLARSHIP MANAGEMENT SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 font-bold text-lg">
              🎁
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Student Scholarships & Free Cards</h3>
              <p className="text-xs text-slate-500">Grant or manage Free Cards and Half Cards directly for students in your classes</p>
            </div>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search student by name or ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          {myStudents.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Student Name</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">ID</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase">Current Card Status</th>
                  <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-right">Grant Scholarship</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myStudents.map(student => (
                  <tr key={student.studentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                      <div className="text-xs text-slate-500">Grade: {student.grade || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-600">
                      {student.studentId}
                    </td>
                    <td className="py-3.5 px-4">
                      {student.cardType === 'free' ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            🎁 Free Card (100% Free)
                          </span>
                          {student.cardGrantedBy && (
                            <span className="text-[10px] text-slate-400 font-medium">Approved by: {student.cardGrantedBy}</span>
                          )}
                        </div>
                      ) : student.cardType === 'half' ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            🌗 Half Card (50% Fee)
                          </span>
                          {student.cardGrantedBy && (
                            <span className="text-[10px] text-slate-400 font-medium">Approved by: {student.cardGrantedBy}</span>
                          )}
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          💳 Normal Card
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateCardType(student.studentId, 'free')}
                          disabled={cardUpdating[student.studentId] || student.cardType === 'free'}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                        >
                          🎁 Grant Free Card
                        </button>
                        <button
                          onClick={() => handleUpdateCardType(student.studentId, 'half')}
                          disabled={cardUpdating[student.studentId] || student.cardType === 'half'}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                        >
                          🌗 Half Card
                        </button>
                        {student.cardType !== 'normal' && (
                          <button
                            onClick={() => handleUpdateCardType(student.studentId, 'normal')}
                            disabled={cardUpdating[student.studentId]}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <Users size={36} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">No students found for scholarship management.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
              <Calculator size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">My Classes & Commission Breakdown</h3>
          </div>
          <div className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Rate: {data.teacher.commissionRate * 100}%
          </div>
        </div>
        
        <div className="p-6">
          {data.classes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.classes.map((cls) => (
                <div key={cls.classId} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{cls.name}</h4>
                    <p className="text-sm font-medium text-slate-500 mb-4">{cls.schedule} • Grade: {cls.grade}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-200 border-dashed">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Students</p>
                      <p className="font-bold text-slate-700">{cls.studentsCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase">Class Fee</p>
                      <p className="font-bold text-slate-700">Rs. {cls.fee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase">Est. Cut</p>
                      <p className="font-black text-violet-700">Rs. {cls.expectedIncome.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-medium">You don't have any classes assigned yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
