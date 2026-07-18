import React, { useState } from 'react';
import axios from 'axios';
import { CreditCard, Receipt, Wallet, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Finance = () => {
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);

  React.useEffect(() => {
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
      if (classesRes.data.length > 0) {
        setSelectedClass(classesRes.data[0].classId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    let resolvedId = studentId.trim();
    const searchString = resolvedId.toLowerCase();
    
    const matchedStudent = students.find(s => 
      s.studentId.toLowerCase() === searchString || 
      s.name.toLowerCase() === searchString || 
      s.contact === searchString
    );

    if (matchedStudent) {
      resolvedId = matchedStudent.studentId;
    } else if (!resolvedId.toUpperCase().startsWith('KWS-')) {
      alert('Could not find a student matching that name or phone number.');
      return;
    }

    if (!selectedClass) {
      alert('Please select a class for this payment.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/payments`, {
        studentId: resolvedId,
        classId: selectedClass,
        amount: Number(amount),
        month
      });
      setReceipt(response.data.paymentData);
      setStudentId('');
      setAmount('');
    } catch (error) {
      alert(error.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Fee Management</h2>
          <p className="text-slate-500 font-medium mt-1">Record payments and generate receipts</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
          <Wallet size={18} /> Cashier Desk
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10"></div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <CreditCard className="mr-3 text-indigo-500" size={24} /> Record Payment
          </h3>
          
          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Student (ID, Name, or Phone)</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  list="students-list"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
                  placeholder="e.g. KWS-12345, Kamal, or 077..."
                />
                <datalist id="students-list">
                  {students.map(s => (
                    <option key={s.studentId} value={s.studentId}>{s.name} ({s.contact})</option>
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Payment For Class</label>
              <select
                required
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
              >
                <option value="" disabled>Select a class</option>
                {classesList.map(c => (
                  <option key={c.classId} value={c.classId}>
                    {c.name} ({c.teacherName}) - Rs. {c.fee}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Amount (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">Rs.</span>
                  <input 
                    type="number" 
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-800"
                    placeholder="2500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">For Month</label>
                <input 
                  type="month" 
                  required
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-800"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Process Payment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-400">
              <ShieldCheck size={14} /> Secured via 256-bit encryption
            </div>
          </form>
        </div>

        {/* Receipt Panel */}
        <div className="h-full">
          {receipt ? (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1 rounded-3xl shadow-xl shadow-emerald-200 animate-in zoom-in-95 duration-500">
              <div className="bg-white p-8 rounded-[22px] h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Receipt size={120} />
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Payment Successful</h3>
                </div>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-4">
                    <span className="text-sm font-medium text-slate-500">Receipt No</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">{receipt.receiptNo}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-4">
                    <span className="text-sm font-medium text-slate-500">Student ID</span>
                    <span className="font-bold text-slate-800">{receipt.studentId}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-4">
                    <span className="text-sm font-medium text-slate-500">Class</span>
                    <span className="font-bold text-slate-800">{receipt.className}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-4">
                    <span className="text-sm font-medium text-slate-500">Amount Paid</span>
                    <span className="text-xl font-black text-emerald-600">Rs. {receipt.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-dashed border-slate-200 pb-4">
                    <span className="text-sm font-medium text-slate-500">For Month</span>
                    <span className="font-bold text-slate-800">{format(new Date(receipt.month), 'MMMM yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-end pb-2">
                    <span className="text-sm font-medium text-slate-500">Date & Time</span>
                    <span className="text-sm font-bold text-slate-800">{new Date(receipt.datePaid).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3 border border-emerald-100">
                  <div className="bg-emerald-200/50 p-1 rounded text-emerald-700 shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Digital Receipt Sent</p>
                    <p className="text-xs font-medium text-emerald-600/80 mt-0.5">An SMS confirmation has been dispatched to the parent's registered mobile number.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center h-full text-slate-400 min-h-[400px]">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                <Receipt size={48} className="text-slate-300" />
              </div>
              <p className="font-semibold text-slate-500">Process a payment to generate a receipt</p>
              <p className="text-sm text-slate-400 mt-2 text-center max-w-xs">The digital receipt will appear here and an SMS will be sent automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;
