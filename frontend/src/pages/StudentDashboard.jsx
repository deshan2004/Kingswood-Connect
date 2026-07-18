import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { QrCode, Calendar, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ attendance: [], payments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.studentId) {
      axios.get(`${API_URL}/student/${user.studentId}/dashboard`)
        .then(res => setData(res.data))
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
