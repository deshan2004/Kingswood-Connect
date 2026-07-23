import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { QrCode, AlertCircle, CheckCircle2, XOctagon, Smartphone, X } from 'lucide-react';
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
  const [students, setStudents] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [activeClass, setActiveClass] = useState(() => localStorage.getItem('scanner_active_class') || '');
  const [sessionId, setSessionId] = useState(null);
  const [showMobileLink, setShowMobileLink] = useState(false);
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
          
          // The backend now marks the attendance directly during the mobile scan and saves the result here!
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
            // Fallback for older sessions without result field
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

  useEffect(() => {
    axios.get(`${API_URL}/students`).then(res => setStudents(res.data)).catch(console.error);

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 20, 
        qrbox: { width: 250, height: 250 },
        disableFlip: false, // allow scanning mirrored/reflected codes
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
  }, []);

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
      setTimeout(() => setError(null), 3000);
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
    if (!manualId.trim()) return;
    
    let resolvedId = manualId.trim();
    const searchString = resolvedId.toLowerCase();
    const matchedStudent = students.find(s => 
      s.studentId.toLowerCase() === searchString || 
      s.name.toLowerCase() === searchString || 
      s.contact === searchString
    );
    if (matchedStudent) resolvedId = matchedStudent.studentId;

    processScan(resolvedId);
    setManualId('');
  };

  const onScanFailure = (error) => {
    // Ignore routine failures while seeking
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Class Selection */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
          Scanning Attendance For:
        </label>
        {classesList.length === 0 ? (
          <div className="text-sm text-amber-600 font-medium">Please add classes from the backend before scanning.</div>
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
                borderRadius: '0.75rem',
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
                borderRadius: '0.75rem',
                overflow: 'hidden',
                zIndex: 50
              })
            }}
          />
        )}
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-3">
          <QrCode className="text-indigo-600" size={32} /> Fast Scan
        </h2>
        <p className="text-slate-500 font-medium">Scan student ID card to mark attendance instantly</p>
      </div>
      
      <div className="flex justify-center mb-4">
        <button 
          onClick={() => setShowMobileLink(true)}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-full transition-colors"
        >
          <Smartphone size={20} className="text-indigo-600" />
          Link Mobile Scanner
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
              <p className="text-slate-500 font-medium mt-2">Scan this QR code with your phone to use it as a barcode scanner.</p>
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
              Keep this window open while scanning on your mobile device.
            </div>
          </div>
        </div>
      )}
      
      <div className="relative">
        <form onSubmit={handleManualSubmit} className="mb-6 relative z-10 flex gap-3">
           <input 
             type="text" 
             autoFocus
             list="scanner-students-list"
             value={manualId}
             onChange={(e) => setManualId(e.target.value)}
             placeholder="Scan physical ID, or type Name / Phone..." 
             className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-lg"
           />
           <datalist id="scanner-students-list">
             {students.map(s => (
               <option key={s.studentId} value={s.studentId}>{s.name} ({s.contact})</option>
             ))}
           </datalist>
           <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-indigo-200 text-lg">
             Submit
           </button>
        </form>

        {/* Glow effect behind scanner */}
        <div className="absolute inset-0 top-20 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[3rem] blur-xl opacity-20 animate-pulse"></div>
        
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 relative z-10">
          <style>{`
            #reader {
              border: none !important;
              position: relative;
            }
            #reader video {
              width: 100% !important;
              height: auto !important;
              border-radius: 1rem;
              max-height: 400px;
              object-fit: cover;
            }
            #reader canvas {
              max-width: 100% !important;
              height: auto !important;
            }
            #reader__dashboard_section_csr span {
              color: #64748b !important;
            }
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
            #reader button:hover {
              background-color: #4338ca !important;
            }
          `}</style>
          <div id="reader" className="w-full rounded-2xl overflow-hidden"></div>
        </div>
      </div>

      <div className="min-h-[160px]">
        {scanResult && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-5 rounded-2xl relative flex items-center shadow-lg shadow-emerald-100/50">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mr-4 shrink-0" />
              <div>
                <strong className="font-bold text-lg block text-emerald-900">Attendance Marked!</strong>
                <span className="block text-emerald-700">{scanResult.student} is marked present.</span>
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
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-5 rounded-2xl relative flex items-center shadow-lg shadow-rose-100/50 animate-in slide-in-from-bottom-4 fade-in duration-300" role="alert">
            <AlertCircle className="w-8 h-8 text-rose-500 mr-4 shrink-0" />
            <div>
              <strong className="font-bold text-lg block text-rose-900">Scan Error</strong>
              <span className="block text-rose-700">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
