import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldAlert, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
  const { user, updateStudentEmail, sendVerification, checkVerificationStatus } = useAuth();
  
  const isDefaultEmail = user?.email?.endsWith('@kingswood.edu') || false;
  const isVerified = user?.emailVerified || false;

  const [newEmail, setNewEmail] = useState(isDefaultEmail ? '' : (user?.email || ''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [checkingLoading, setCheckingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Sync newEmail if user email changes
  useEffect(() => {
    if (!isDefaultEmail && user?.email) {
      setNewEmail(user.email);
    }
  }, [user?.email, isDefaultEmail]);

  // Poll for email verification status in background
  useEffect(() => {
    if (isVerified) return;

    checkVerificationStatus();

    const interval = setInterval(async () => {
      const verified = await checkVerificationStatus();
      if (verified) {
        setMessage({
          type: 'success',
          text: '🎉 Email verified successfully!'
        });
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isVerified]);

  const handleCheckStatus = async () => {
    setCheckingLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const verified = await checkVerificationStatus();
      if (verified) {
        setMessage({
          type: 'success',
          text: '🎉 Email verified successfully!'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Email is not verified yet. Please check your inbox and click the verification link first.'
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to check verification status.' });
    } finally {
      setCheckingLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid personal email address.' });
      setLoading(false);
      return;
    }

    if (trimmedEmail.endsWith('@kingswood.edu')) {
      setMessage({ type: 'error', text: 'Please enter a real personal email (e.g. Gmail, Outlook, Yahoo).' });
      setLoading(false);
      return;
    }

    if (trimmedEmail === user?.email?.toLowerCase() && !isVerified) {
      try {
        await sendVerification();
        setMessage({
          type: 'success',
          text: `Verification email resent to ${trimmedEmail}! Please check your inbox and spam folder.`
        });
      } catch (err) {
        setMessage({
          type: 'error',
          text: err.message || 'Failed to send verification email. Try again later.'
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      await updateStudentEmail(trimmedEmail);
      setMessage({
        type: 'success',
        text: 'Your email has been updated! A verification link has been sent to your new email inbox.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Failed to update email address.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await sendVerification();
      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox and spam folder.'
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to send verification email. Try again later.'
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isVerified ? 'bg-emerald-50 text-emerald-600' : isDefaultEmail ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
            <Mail size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Email & Verification</h3>
            <p className="text-xs text-slate-400 font-medium">Link your personal email for password reset & alerts</p>
          </div>
        </div>

        {/* Status Badge */}
        {isVerified ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <ShieldCheck size={14} /> Verified
          </span>
        ) : isDefaultEmail ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            <ShieldAlert size={14} /> System Default
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <AlertCircle size={14} /> Unverified
          </span>
        )}
      </div>

      {/* Current Email Display */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4 flex items-center justify-between">
        <div className="overflow-hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current Account Email</span>
          <span className="text-sm font-bold text-slate-700 truncate block">{user?.email || 'None'}</span>
        </div>
        {!isVerified && !isDefaultEmail && (
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checkingLoading}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={12} className={checkingLoading ? "animate-spin" : ""} />
              {checkingLoading ? 'Checking...' : 'Check Status'}
            </button>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              {resendLoading ? <RefreshCw size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Resend Code
            </button>
          </div>
        )}
      </div>

      {/* Alert banner if default email */}
      {isDefaultEmail && (
        <div className="bg-amber-50/80 border-l-4 border-amber-500 p-3.5 rounded-xl mb-4 text-xs text-amber-800 font-medium leading-relaxed">
          <strong>Action Recommended:</strong> Your account is currently assigned a system ID email (<code>{user?.email}</code>). Please update it to your real email address to ensure you never lose access to your account.
        </div>
      )}

      {/* Feedback Messages */}
      {message.text && (
        <div className={`p-3.5 rounded-xl mb-4 text-xs font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleUpdateEmail} className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
            New Personal Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Mail size={16} />
            </span>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              Update & Verify Email <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;
