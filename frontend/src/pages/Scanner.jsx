import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { QrCode, AlertCircle, CheckCircle2, XOctagon, Smartphone, X, UserCheck, Search, User, Check, BookOpen } from 'lucide-react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Select from 'react-select';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualId, setManualId] = useState('');
  const [selectedManualStudent, setSelectedManualStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [activeClass, setActiveClass] = useState(() => localStorage.getItem('scanner_active_class') || '');
  const [sessionId, setSessionId] = useState(null);
  const [showMobileLink, setShowMobileLink] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'manual'
  const [filterQuery, setFilterQuery] = useState('');

  const processScanRef = React.useRef();
  const lastScannedRef = React.useRef({ id: null, time: 0 });

  useEffect(() => {
    processScanRef.current = processScan;
  });

  useEffect(() => {
    fetchClasses();
    
    // Use a persistent session ID for this browser to keep the QR code the same
    let savedSessionId = localStorage.getItem('scanner_session_id');
    if (!savedSessionId) {
      savedSessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('scanner_session_id', savedSessionId);
    }
    setSessionId(savedSessionId);

    // Listen to Firestore for scan results in this session
    const sessionRef = doc(db, 'scan_sessions', savedSessionId);
    
    // Initialize session document
    setDoc(sessionRef, { createdAt: new Date().toISOString() }).catch(console.error);

    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.studentId && data.scannedAt && (!processScanRef.lastScannedAt || data.scannedAt > processScanRef.lastScannedAt)) {
          processScanRef.lastScannedAt = data.scannedAt;
          
          if (data.result) {
            setScanResult({
              success: true,
              message: data.result.message,
              student: data.result.student,
              paymentAlert: data.result.paymentAlert
            });
            setError(null);
            setTimeout(() => setScanResult(null), 5000);
          } else if (data.error) {
            setError(data.error);
            setScanResult(null);
            setTimeout(() => setError(null), 3000);
          } else {
            if (processScanRef.current) {
              processScanRef.current(data.studentId);
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Update session doc whenever activeClass changes so mobile scanner knows which class
  useEffect(() => {
    if (sessionId && activeClass) {
      const sessionRef = doc(db, 'scan_sessions', sessionId);
      setDoc(sessionRef, { classId: activeClass }, { merge: true }).catch(console.error);
    }
  }, [sessionId, activeClass]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${API_URL}/classes`);
      setClassesList(response.data);
      
      const savedClassId = localStorage.getItem('scanner_active_class');
      if (savedClassId && response.data.some(c => c.classId === savedClassId)) {
        setActiveClass(savedClassId);
      } else if (response.data.length > 0) {
        setActiveClass(response.data[0].classId);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const [isScannerActive, setIsScannerActive] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/students`).then(res => setStudents(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isScannerActive || activeTab !== 'qr') return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 20, 
        qrbox: { width: 250, height: 250 },
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment"
        }
      },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [isScannerActive, activeTab]);

  const processScan = async (studentId) => {
    if (!studentId || !activeClass) return;

    const now = Date.now();
    // Prevent duplicate rapid scans of the same student within 4 seconds
    if (lastScannedRef.current.id === studentId && (now - lastScannedRef.current.time) < 4000) {
      return;
    }
    lastScannedRef.current = { id: studentId, time: now };
    
    setLoading(true);
    setScanResult(null);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/attendance/scan`, { studentId, classId: activeClass });
      setScanResult({
        success: true,
        message: response.data.message,
        student: response.data.student,
        paymentAlert: response.data.paymentAlert
      });
      setTimeout(() => setScanResult(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to scan student');
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    if (processScanRef.current) {
      processScanRef.current(decodedText);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    let targetStudentId = '';

    if (selectedManualStudent) {
      targetStudentId = selectedManualStudent.value;
    } else if (manualId.trim()) {
      const searchString = manualId.trim().toLowerCase();
      // Try exact match or partial match
      const matchedStudent = students.find(s => 
        s.studentId.toLowerCase() === searchString || 
        s.name.toLowerCase() === searchString || 
        (s.contact && s.contact === searchString)
      ) || students.find(s => 
        s.studentId.toLowerCase().includes(searchString) || 
        s.name.toLowerCase().includes(searchString) || 
        (s.contact && s.contact.includes(searchString))
      );

      if (matchedStudent) {
        targetStudentId = matchedStudent.studentId;
      } else {
        targetStudentId = manualId.trim();
      }
    }

    if (!targetStudentId) return;

    processScan(targetStudentId);
    setManualId('');
    setSelectedManualStudent(null);
  };

  const onScanFailure = (error) => {
    // Ignore routine failures while seeking
  };

  // Filter enrolled students for currently active class
  const enrolledStudents = students.filter(s => 
    s.enrolledClasses && Array.isArray(s.enrolledClasses) && s.enrolledClasses.includes(activeClass)
  );

  const displayedEnrolledStudents = enrolledStudents.filter(s => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.studentId.toLowerCase().includes(q) ||
      (s.contact && s.contact.includes(q))
    );
  });

  const activeClassName = classesList.find(c => c.classId === activeClass)?.name || 'Selected Class';

  // Format options for react-select student picker
  const studentSelectOptions = students.map(s => {
    const isEnrolled = s.enrolledClasses && Array.isArray(s.enrolledClasses) && s.enrolledClasses.includes(activeClass);
    return {
      value: s.studentId,
      label: `${s.name} (${s.studentId}) ${s.contact ? `• ${s.contact}` : ''} ${isEnrolled ? '' : '⚠️ [Not Enrolled]'}`,
      studentName: s.name,
      isEnrolled
    };
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Class Selection Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
          1. Select Class for Attendance:
        </label>
        {classesList.length === 0 ? (
          <div className="text-sm text-amber-600 font-medium p-3 bg-amber-50 rounded-xl">Please add classes from the backend before scanning.</div>
        ) : (
          <Select
            value={activeClass ? { 
              value: activeClass, 
              label: classesList.find(c => c.classId === activeClass) 
                ? `${classesList.find(c => c.classId === activeClass).name} (${classesList.find(c => c.classId === activeClass).teacherName})` 
                : 'Select Class' 
            } : null}
            onChange={(selectedOption) => {
              setActiveClass(selectedOption.value);
              localStorage.setItem('scanner_active_class', selectedOption.value);
            }}
            options={classesList.map(c => ({ value: c.classId, label: `${c.name} (${c.teacherName})` }))}
            placeholder="Select a class"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: '52px',
                borderRadius: '0.85rem',
                borderColor: state.isFocused ? '#4f46e5' : '#e2e8f0',
                boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none',
                '&:hover': {
                  borderColor: state.isFocused ? '#4f46e5' : '#cbd5e1'
                },
                backgroundColor: '#ffffff',
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#1e293b'
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f1f5f9' : 'transparent',
                color: state.isSelected ? '#ffffff' : '#1e293b',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '0.85rem',
                overflow: 'hidden',
                zIndex: 50
              })
            }}
          />
        )}
      </div>

      {/* Navigation Tabs: QR Scanner vs Manual Attendance */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-2">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all text-sm ${
            activeTab === 'qr'
              ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <QrCode size={18} />
          QR Camera Scan
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all text-sm ${
            activeTab === 'manual'
              ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <UserCheck size={18} />
          Manual Attendance (Search & Mark)
        </button>
      </div>

      {/* Feedback Alerts */}
      <div className="min-h-[100px]">
        {scanResult && (
          <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-5 rounded-2xl relative flex items-center shadow-lg shadow-emerald-100/50">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mr-4 shrink-0" />
              <div>
                <strong className="font-bold text-lg block text-emerald-900">Attendance Marked!</strong>
                <span className="block text-emerald-700">{scanResult.student} is marked present for {activeClassName}.</span>
              </div>
            </div>
            
            {/* FEE ALERT UI */}
            {scanResult.paymentAlert?.outstanding ? (
              <div className="bg-rose-600 border border-rose-700 text-white px-6 py-5 rounded-2xl relative flex items-start shadow-xl shadow-rose-500/30 animate-pulse">
                <XOctagon className="w-8 h-8 text-white mr-4 shrink-0" />
                <div>
                  <strong className="font-bold text-xl block mb-1">OUTSTANDING DUES</strong>
                  <span className="block text-rose-100 font-medium">{scanResult.paymentAlert.message}. Please direct the student to the cashier.</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl flex items-center shadow-sm">
                <CheckCircle2 className="w-5 h-5 mr-3 text-slate-400" />
                <span className="font-medium">Account status: Fees are up to date.</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-5 rounded-2xl relative flex items-center shadow-lg shadow-rose-100/50 animate-in slide-in-from-top-4 fade-in duration-300" role="alert">
            <AlertCircle className="w-8 h-8 text-rose-500 mr-4 shrink-0" />
            <div>
              <strong className="font-bold text-lg block text-rose-900">Attendance Error</strong>
              <span className="block text-rose-700">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: QR CODE CAMERA SCANNER */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
              <QrCode className="text-indigo-600" size={32} /> Fast QR Scan
            </h2>
            <p className="text-slate-500 font-medium">Scan student ID card with camera or mobile bridge</p>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={() => setShowMobileLink(true)}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-5 py-2.5 rounded-full transition-colors border border-indigo-200"
            >
              <Smartphone size={20} className="text-indigo-600" />
              Link Phone Camera / Mobile Scanner
            </button>
          </div>

          {showMobileLink && sessionId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative animate-in zoom-in-95 duration-200">
                <button 
                  onClick={() => setShowMobileLink(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="text-center mb-6 mt-2">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
                    <Smartphone className="text-indigo-600" />
                    Mobile Scanner
                  </h3>
                  <p className="text-slate-500 font-medium mt-2">Scan this QR code with your phone to turn it into a scanner camera.</p>
                </div>
                
                <div className="flex justify-center bg-white p-4 rounded-2xl shadow-inner border border-slate-100 mb-6">
                  <QRCodeSVG 
                    value={`${window.location.protocol}//${window.location.host}/mobile-scan/${sessionId}`}
                    size={220}
                    bgColor={"#ffffff"}
                    fgColor={"#1e293b"}
                    level={"H"}
                    includeMargin={false}
                  />
                </div>
                
                <div className="bg-indigo-50 text-indigo-700 text-sm font-medium p-4 rounded-xl text-center border border-indigo-100">
                  Keep this modal open while scanning with your mobile device.
                </div>
              </div>
            </div>
          )}

          <div className="relative">
            {/* Glow effect behind scanner */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[3rem] blur-xl opacity-20 animate-pulse"></div>
            
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 relative z-10">
              <style>{`
                #reader { border: none !important; position: relative; }
                #reader video { width: 100% !important; height: auto !important; border-radius: 1rem; max-height: 400px; object-fit: cover; }
                #reader canvas { max-width: 100% !important; height: auto !important; }
                #reader__dashboard_section_csr span { color: #64748b !important; }
                #reader button {
                  background-color: #4f46e5 !important;
                  color: white !important;
                  border-radius: 0.5rem !important;
                  padding: 0.5rem 1rem !important;
                  font-weight: 500 !important;
                  border: none !important;
                  margin: 0.5rem !important;
                  cursor: pointer;
                }
                #reader button:hover { background-color: #4338ca !important; }
              `}</style>
              
              {!isScannerActive ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="bg-indigo-50 p-6 rounded-full mb-4">
                    <QrCode size={48} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Camera Scanner Inactive</h3>
                  <p className="text-slate-500 mb-6 max-w-sm">Click the button below to activate your computer/laptop camera for scanning.</p>
                  <button 
                    onClick={() => setIsScannerActive(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 text-lg"
                  >
                    <QrCode size={22} />
                    Open Camera
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex justify-end mb-4">
                    <button 
                      onClick={() => setIsScannerActive(false)}
                      className="text-slate-500 hover:text-slate-700 text-sm font-bold flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg"
                    >
                      <X size={16} /> Close Camera
                    </button>
                  </div>
                  <div id="reader" className="w-full rounded-2xl overflow-hidden"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL ATTENDANCE (SEARCH & MARK) */}
      {activeTab === 'manual' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Option A: Searchable Select */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <UserCheck className="text-indigo-600" size={28} />
              <div>
                <h3 className="text-xl font-black text-slate-800">Search & Mark Attendance</h3>
                <p className="text-xs text-slate-500 font-medium">Use this if the student's QR code isn't scanning or they forgot their card</p>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Select Student (Search by Name, Student ID, or Phone):
                </label>
                <Select
                  value={selectedManualStudent}
                  onChange={(option) => setSelectedManualStudent(option)}
                  options={studentSelectOptions}
                  isClearable
                  placeholder="Type student name or ID..."
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: '52px',
                      borderRadius: '0.85rem',
                      borderColor: state.isFocused ? '#4f46e5' : '#cbd5e1',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none',
                      backgroundColor: '#ffffff',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: '0.85rem',
                      overflow: 'hidden',
                      zIndex: 50
                    })
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase">or type directly:</span>
                <input 
                  type="text" 
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Student ID / Name / Phone..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || (!selectedManualStudent && !manualId.trim())}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-200 text-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={22} />
                {loading ? 'Marking...' : `Mark Attendance for ${activeClassName}`}
              </button>
            </form>
          </div>

          {/* Option B: Quick List of Enrolled Students */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="text-indigo-600" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Enrolled Students in {activeClassName}</h3>
                  <p className="text-xs text-slate-500 font-medium">Click "Mark Present" next to any student's name</p>
                </div>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter list..."
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
                />
              </div>
            </div>

            {displayedEnrolledStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <User size={36} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium text-sm">No enrolled students found for this class.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {displayedEnrolledStudents.map((s) => (
                  <div 
                    key={s.studentId}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                      <p className="text-xs font-semibold text-slate-400">ID: {s.studentId} • {s.contact || 'No contact'}</p>
                    </div>
                    <button
                      onClick={() => processScan(s.studentId)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                    >
                      <Check size={14} />
                      Mark Present
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;

