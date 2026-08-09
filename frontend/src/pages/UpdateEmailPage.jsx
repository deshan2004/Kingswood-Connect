import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ShieldAlert, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, AlertCircle, ArrowLeft, Send, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChangePassword from '../components/ChangePassword';

const UpdateEmailPage = () => {
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

  // Poll for email verification in background if unverified
  useEffect(() => {
    if (isVerified) return;

    // Check immediately on mount
    checkVerificationStatus();

    const interval = setInterval(async () => {
      const verified = await checkVerificationStatus();
      if (verified) {
        setMessage({
          type: 'success',
          text: '🎉 Email verified successfully! Your account is now fully verified.'
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
          text: '🎉 Email verified successfully! Your account is now fully verified.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Email is not verified yet. Please check your email inbox and click the verification link, then click this button again.'
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to check verification status. Please try again.' });
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
      setMessage({ type: 'error', text: 'Please enter a real personal email address (e.g. Gmail, Outlook, Yahoo).' });
      setLoading(false);
      return;
    }

    // If user's account email is already equal to this email and just unverified, resend link
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
        text: 'Your email address has been updated! A verification link has been sent to your new email inbox.'
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
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Account & Security</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your email verification and update your account password.</p>
        </div>
        <Link 
          to="/student"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Email Verification Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Card Title */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="bg-indigo-50 p-2.5 rounded-2xl text-indigo-600">
            <Mail size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Email & Verification</h3>
            <p className="text-xs text-slate-400 font-medium">Link your personal email address for account recovery and alerts</p>
          </div>
        </div>

        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isVerified ? 'bg-emerald-100 text-emerald-600' : isDefaultEmail ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <Mail size={24} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current Account Email</span>
              <span className="text-base font-bold text-slate-800 truncate block">{user?.email || 'None'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isVerified ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck size={18} /> Verified Email
              </span>
            ) : isDefaultEmail ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <ShieldAlert size={18} /> System Default Email
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <AlertCircle size={18} /> Pending Verification
                </span>
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  disabled={checkingLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <RefreshCw size={14} className={checkingLoading ? "animate-spin" : ""} />
                  {checkingLoading ? 'Checking...' : 'Check Status'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Banner if System Default */}
        {isDefaultEmail && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <ShieldAlert size={20} className="text-amber-600" /> System Default Email Detected
            </div>
            <p className="text-sm text-amber-700 font-medium leading-relaxed">
              Your account currently uses a default generated system ID (<code>{user?.email}</code>). 
              Please enter your real personal email address below. Linking a personal email allows you to easily recover your password if forgotten, receive class fee receipts, and get instant attendance alerts!
            </p>
          </div>
        )}

        {/* Feedback Message */}
        {message.text && (
          <div className={`p-4 rounded-2xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
            {message.text}
          </div>
        )}

        {/* Update Email Form */}
        <form onSubmit={handleUpdateEmail} className="space-y-6 pt-2">
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">
              New Personal Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail size={20} />
              </span>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. student@gmail.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-base"
              />
            </div>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              We will send a verification link to this email address to verify ownership.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-base active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send size={18} /> Update & Send Verification Link
                </>
              )}
            </button>

            {!isVerified && !isDefaultEmail && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {resendLoading ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                Resend Link
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEmailPage;

