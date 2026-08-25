import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, User, Eye, EyeOff, ArrowLeft, MailCheck, CheckCircle2, X, ShieldCheck, Lock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [identifier, setIdentifier] = useState(''); // Email or Student ID
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);

  // 2FA OTP State
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [pendingUserCredentials, setPendingUserCredentials] = useState(null);

  // Auto-fill login credentials if passed in URL query parameters (e.g. ?email=...&password=...)
  useEffect(() => {
    const emailParam = searchParams.get('email') || searchParams.get('identifier') || searchParams.get('studentId') || searchParams.get('id');
    const passwordParam = searchParams.get('password') || searchParams.get('pass');

    if (emailParam || passwordParam) {
      if (emailParam) setIdentifier(emailParam);
      if (passwordParam) setPassword(passwordParam);
      setAutoFilled(true);
    }
  }, [searchParams]);

  // Password Reset State
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const { login, loginWithGoogle, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect based on role
  useEffect(() => {
    if (user) {
      const currentRole = user.role ? user.role.toLowerCase() : 'student';
      if (currentRole === 'admin') navigate('/admin');
      else if (currentRole === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  }, [user, navigate]);

  // Format Firebase Auth errors into clean, user-friendly messages
  const formatAuthError = (err, fallbackMessage = 'Login failed. Please check your credentials.') => {
    if (!err) return fallbackMessage;

    const code = err.code || '';
    const msg = err.message || '';

    if (
      code === 'auth/invalid-credential' || 
      code === 'auth/wrong-password' || 
      msg.includes('invalid-credential') || 
      msg.includes('wrong-password')
    ) {
      return 'Incorrect Password or Email / Student ID. Please check your credentials and try again.';
    }
    if (code === 'auth/user-not-found' || msg.includes('user-not-found')) {
      return 'No account found with this Email or Student ID. Please check your ID and try again.';
    }
    if (code === 'auth/invalid-email' || msg.includes('invalid-email')) {
      return 'Invalid Email or Student ID format.';
    }
    if (code === 'auth/user-disabled' || msg.includes('user-disabled')) {
      return 'This account has been disabled. Please contact system admin.';
    }
    if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
      return 'Too many failed login attempts. Access temporarily locked for security. Please try again later or reset your password.';
    }
    if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in popup was closed.';
    }

    if (msg.startsWith('Firebase:')) {
      return fallbackMessage;
    }

    return msg || fallbackMessage;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let loginEmail = identifier.trim().toLowerCase();
      if (!loginEmail.includes('@')) {
        const cleanId = loginEmail.replace(/[^0-9a-z-]/g, '');
        loginEmail = `${cleanId}@kingswood.edu`;
      }

      // Direct Login for Admin, Teachers, and Students
      await login(loginEmail, password);
    } catch (err) {
      setError(formatAuthError(err, 'Incorrect Password or Email / Student ID. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the full 6-digit 2FA security code.');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/auth/verify-2fa-otp`, {
        email: pendingUserCredentials.email,
        otp: otpCode.trim()
      });

      if (res.data.verified) {
        // Complete Firebase login after 2FA verification
        await login(pendingUserCredentials.email, pendingUserCredentials.password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid 6-digit 2FA code. Please check and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(formatAuthError(err, 'Google login failed. Please try again.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    if (!resetIdentifier.trim()) {
      setResetError('Please enter your email address or Student ID.');
      setResetLoading(false);
      return;
    }

    try {
      await resetPassword(resetIdentifier);
      setResetSuccess('Password reset link sent! Please check your email inbox and spam folder.');
    } catch (err) {
      setResetError(formatAuthError(err, 'No account found with this Email or Student ID. Please check and try again.'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-800 font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Decorative Background Glowing Halos */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-400/5 via-indigo-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Back to Home & Close Buttons */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          to="/" 
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 shadow-sm text-xs font-bold text-slate-700 hover:text-indigo-600 transition-all duration-300 group hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4 mr-2 text-slate-500 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <Link 
          to="/" 
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/90 shadow-sm text-slate-500 hover:text-indigo-600 transition-all duration-300 hover:shadow-md"
          title="Return to Landing Page"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <div className="flex justify-center">
          <Link to="/" title="Go to Kingswood Education Center Home" className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl blur-md opacity-25 group-hover:opacity-60 transition duration-500" />
            <img src="/IMG_4244.png" alt="Kingswood Education Center Logo" className="relative w-16 h-16 rounded-2xl object-contain bg-white p-1 shadow-xl shadow-indigo-950/20 border border-indigo-700/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
          </Link>
        </div>
        <div>
          <Link to="/" className="block group">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              Kingswood Education Center
            </h2>
          </Link>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Premier Educational Institute
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-600">
          {isResetMode ? 'Reset your account password' : 'Sign in to access your digital learning portal'}
        </p>
      </div>

      {/* Form Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/90 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl shadow-indigo-950/10 rounded-3xl border border-white/80 relative overflow-hidden group/card">
          {isResetMode ? (
            /* Forgot Password Reset Form */
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              {resetError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl border border-red-200">
                  <p className="text-xs font-bold text-red-700">{resetError}</p>
                </div>
              )}

              {resetSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-xs font-bold text-emerald-900">{resetSuccess}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setResetSuccess('');
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2 transition-colors"
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address or Student ID
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        required
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all"
                        placeholder="e.g. user@example.com or KWS-1002"
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">
                      Enter the email address or Student ID associated with your account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <MailCheck size={18} /> Send Reset Link
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsResetMode(false)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : showOtpStep ? (
            /* 2FA Security Verification Form */
            <form className="space-y-6" onSubmit={handleVerify2FA}>
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={24} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-indigo-900 text-sm">Two-Factor Authentication</h4>
                  <p className="text-xs text-indigo-700 font-medium mt-0.5">{otpMessage}</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl border border-red-200">
                  <p className="text-xs font-bold text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-slate-900 font-mono font-black text-xl tracking-[0.4em] focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 transition-all"
                    placeholder="123456"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Verify 2FA & Continue
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpStep(false);
                    setOtpCode('');
                    setError('');
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Password Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Standard Login Form */
            <form className="space-y-5" onSubmit={handleLogin}>
              {autoFilled && (
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center gap-3 text-emerald-900 text-xs font-bold shadow-xs animate-fadeIn">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>Your credentials have been automatically filled from your login link!</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl border border-red-200 animate-fadeIn">
                  <p className="text-xs font-bold text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address or Student ID
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/80 border border-slate-300/90 rounded-2xl text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/15 transition-all shadow-inner/5"
                    placeholder="e.g. user@example.com or KWS-1002"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetIdentifier(identifier);
                      setIsResetMode(true);
                      setError('');
                      setResetSuccess('');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Key size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50/80 border border-slate-300/90 rounded-2xl text-slate-900 font-semibold text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/15 transition-all shadow-inner/5"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} className="transform scale-110" /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative group overflow-hidden w-full bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] border border-indigo-400/20"
              >
                <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={18} className="group-hover:rotate-12 transition-transform duration-300" /> Sign In to Portal
                  </>
                )}
              </button>
            </form>
          )}

          {!isResetMode && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="px-3 bg-white text-slate-500 font-bold rounded-full border border-slate-200">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              </div>

              <div className="mt-8 text-center border-t border-slate-200 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setResetIdentifier(identifier);
                    setIsResetMode(true);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Forgot your password?{' '}
                  <span className="font-bold text-indigo-600 hover:underline">Reset Password</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
