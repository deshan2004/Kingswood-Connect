import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { io } from 'socket.io-client';
import { CheckCircle2, QrCode, Smartphone } from 'lucide-react';

const API_URL = 'http://localhost:5000'; // Or your backend URL

const MobileScanner = () => {
  const { sessionId } = useParams();
  const [socket, setSocket] = useState(null);
  const [scanStatus, setScanStatus] = useState('Waiting for scan...');
  const [lastScanned, setLastScanned] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket Connection
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to socket server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket server');
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    // Initialize Scanner
    const scanner = new Html5QrcodeScanner(
      "mobile-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [0], // Optional: focus on QR codes or standard barcodes depending on your ID format
        videoConstraints: {
          facingMode: "environment"
        }
      },
      false
    );

    const onScanSuccess = (decodedText) => {
      if (socket && isConnected) {
        setScanStatus('Sending...');
        // Send scan result to desktop session
        socket.emit('scan-result', {
          sessionId,
          studentId: decodedText
        });
        
        setLastScanned(decodedText);
        setScanStatus('Sent successfully!');
        
        // Reset status message after a short delay
        setTimeout(() => setScanStatus('Waiting for next scan...'), 2000);
      } else {
        setScanStatus('Error: Not connected to server.');
      }
    };

    const onScanFailure = (error) => {
      // Ignore routine scan failures while seeking
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [socket, sessionId, isConnected]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="text-indigo-600" size={28} />
          <h1 className="text-xl font-bold text-slate-800">Mobile Scanner</h1>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
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
