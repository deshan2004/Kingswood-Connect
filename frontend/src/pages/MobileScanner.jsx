import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CheckCircle2, QrCode, Smartphone } from 'lucide-react';

const MobileScanner = () => {
  const { sessionId } = useParams();
  const [scanStatus, setScanStatus] = useState('Waiting for scan...');
  const [lastScanned, setLastScanned] = useState(null);

  useEffect(() => {
    // Initialize Scanner without UI
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const html5QrCode = new Html5Qrcode("mobile-reader");
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      const onScanSuccess = async (decodedText) => {
        setScanStatus('Sending...');
        try {
          const sessionRef = doc(db, 'scan_sessions', sessionId);
          // Try to update the session. If it doesn't exist, this might fail, but Scanner.jsx creates it.
          // Using setDoc with merge to be safe
          await setDoc(sessionRef, {
            studentId: decodedText,
            scannedAt: new Date().toISOString()
          }, { merge: true });
          
          setLastScanned(decodedText);
          setScanStatus('Sent successfully!');
        } catch (error) {
          console.error("Error updating scan session:", error);
          setScanStatus('Error: Could not connect to session.');
        }
        
        setTimeout(() => setScanStatus('Waiting for next scan...'), 2000);
      };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess
      ).catch(err => {
        console.error("Error starting scanner", err);
        setScanStatus("Error starting camera. Please check permissions.");
      });

      return () => {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
      };
    });
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="text-indigo-600" size={28} />
          <h1 className="text-xl font-bold text-slate-800">Mobile Scanner</h1>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
          Ready
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <p className="text-slate-500 font-medium mb-4 text-center">Scan a student's ID card</p>
        
        <div className="w-full max-w-sm bg-white p-4 rounded-3xl shadow-lg border border-slate-100 mb-6 relative">
          <style>{`
            #mobile-reader { border: none !important; }
            #mobile-reader video { border-radius: 1rem; width: 100% !important; }
            #mobile-reader button {
              background-color: #4f46e5 !important;
              color: white !important;
              border-radius: 0.5rem !important;
              padding: 0.75rem 1rem !important;
              font-weight: 600 !important;
              border: none !important;
              margin-top: 1rem !important;
              width: 100%;
            }
          `}</style>
          <div id="mobile-reader"></div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 w-full max-w-sm text-center">
          <p className="text-sm text-slate-500 uppercase tracking-wide font-bold mb-1">Status</p>
          <p className={`font-semibold ${scanStatus.includes('Error') ? 'text-rose-600' : 'text-indigo-600'}`}>
            {scanStatus}
          </p>
          {lastScanned && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-emerald-600">
              <CheckCircle2 size={20} />
              <span className="font-medium">Last: {lastScanned}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileScanner;
