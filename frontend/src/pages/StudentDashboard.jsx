import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { QrCode, Calendar, Wallet, CheckCircle2, AlertCircle, BookOpen, Award, ShieldAlert, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ attendance: [], payments: [], classesStatus: [] });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.studentId) {
      Promise.all([
        axios.get(`${API_URL}/student/${user.studentId}/dashboard`),
        axios.get(`${API_URL}/exams/student/${user.studentId}`)
      ])
        .then(([dashRes, examsRes]) => {
          setData(dashRes.data);
          setExams(examsRes.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const downloadQR = () => {
    if (!user.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = user.qrCodeUrl;
    link.download = `QR-${user.studentId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome, {user.name}</h2>
        <p className="text-slate-500 font-medium mt-1">Student ID: {user.studentId} • Grade: {user.grade}</p>
      </div>

      {/* Default Email Warning Banner */}
      {user.email?.endsWith('@kingswood.edu') && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">System Default Email Assigned ({user.email})</p>
              <p className="text-xs font-medium text-amber-700 mt-0.5">Link your personal email address to receive password reset links and receipt alerts.</p>
            </div>
          </div>
          <Link
            to="/student/update-email"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm shrink-0"
          >
            Update Email <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-indigo-500 to-blue-600 p-1 rounded-3xl shadow-xl shadow-indigo-200">
            <div className="bg-white p-8 rounded-[22px] flex flex-col items-center text-center">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <QrCode className="text-indigo-500" size={20} /> Your Pass
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner mb-6">
                {user.qrCodeUrl ? (
                  <img src={user.qrCodeUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">No QR Code</div>
                )}
              </div>
              
              <button 
                onClick={downloadQR}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                Download ID
              </button>
              <p className="text-xs text-slate-400 mt-4 font-medium">Show this code at the entrance to mark your attendance.</p>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* My Classes Summary */}
          {data.classesStatus && data.classesStatus.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">My Enrolled Classes & Card Status</h3>
                </div>
                {data.studentCard?.cardType === 'free' && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    🎁 Free Card Holder
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.classesStatus.map(cls => (
                    <div key={cls.classId} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-800 text-lg">{cls.name}</h4>
                          {cls.isFreeCard ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              🎁 Free Pass
                            </span>
                          ) : cls.isHalfCard ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                              🌗 50% Card
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs font-medium text-slate-500 mb-3">{cls.teacherName}</p>
                        <p className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                          {cls.feeType === 'weekly' ? `🗓️ Weekly Fee: Rs. ${cls.fee}/session` : `📅 Monthly Fee: Rs. ${cls.fee}/month`}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 border-dashed">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                          {cls.isFreeCard ? (
                            <span className="flex items-center text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-100">
                              <CheckCircle2 size={12} className="mr-1" /> 100% Free
                            </span>
                          ) : cls.feeType === 'weekly' ? (
                            <span className="flex items-center text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md text-xs border border-indigo-100">
                              Pay per Session
                            </span>
                          ) : cls.isPaidThisMonth ? (
                            <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-100">
                              <CheckCircle2 size={12} className="mr-1" /> Monthly Paid
                            </span>
                          ) : (
                            <span className="flex items-center text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-md text-xs border border-rose-100">
                              Monthly Pending
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-500">
                          {cls.attendanceThisMonth} Sessions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Exam Marks / Progress */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                <Award size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">My Progress & Exam Marks</h3>
            </div>
            
            <div className="p-6">
              {exams.length > 0 ? (
                <div className="space-y-4">
                  {exams.map((exam, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{exam.title}</p>
                        <p className="text-xs font-semibold text-slate-500">{format(new Date(exam.date), 'MMMM do, yyyy')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-slate-200 rounded-full h-2.5 hidden sm:block">
                          <div className={`h-2.5 rounded-full ${exam.mark >= 75 ? 'bg-emerald-500' : exam.mark >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${exam.mark}%` }}></div>
                        </div>
                        <div className="text-lg font-black text-slate-700 w-12 text-right">
                          {exam.mark}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <Award size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No exam marks recorded yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Recent Attendance</h3>
            </div>
            
            <div className="p-6">
              {data.attendance.length > 0 ? (
                <div className="space-y-4">
                  {data.attendance.slice(0, 5).map((att, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={20} />
                        <div>
                          <p className="font-bold text-slate-800">{format(new Date(att.date), 'MMMM do, yyyy')}</p>
                          <p className="text-xs font-semibold text-slate-500">{att.className || 'General'} • {att.status}</p>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {format(new Date(att.timeIn), 'hh:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <Calendar size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No attendance records found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                <Wallet size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Recent Payments</h3>
            </div>
            
            <div className="p-6">
              {data.payments.length > 0 ? (
                <div className="space-y-4">
                  {data.payments.slice(0, 5).map((pay, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">Fee for {format(new Date(pay.month), 'MMMM yyyy')}</p>
                        <p className="text-xs font-semibold text-slate-500">{pay.className || 'General'} • Receipt: {pay.receiptNo}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-600">Rs. {pay.amount.toLocaleString()}</p>
                        <p className="text-xs font-semibold text-slate-400">{format(new Date(pay.datePaid), 'MMM do')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <AlertCircle size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No payment records found.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
