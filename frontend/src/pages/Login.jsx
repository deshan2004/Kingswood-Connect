import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, User, Eye, EyeOff, ArrowLeft, MailCheck, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Email or Student ID
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

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
      if (currentRole === 'admin') navigate('/');
      else if (currentRole === 'teacher') navigate('/teacher');
      else navigate('/student');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Format Student ID (e.g. kws-12345) as email
      let loginEmail = identifier.trim().toLowerCase();
      if (loginEmail.startsWith('kws-') && !loginEmail.includes('@')) {
        loginEmail = `${loginEmail}@kingswood.edu`;
      }

      await login(loginEmail, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google login failed.');
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
      setResetError(err.message || 'Failed to send reset link. Please check your email address.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100 font-sans">
      {/* Background decoration gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/60 border border-indigo-400/30">
            <span className="text-white font-black text-3xl tracking-tighter">KC</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-white tracking-tight">Kingswood Connect</h2>
        <p className="mt-2 text-center text-sm font-medium text-indigo-200/80">
          {isResetMode ? 'Reset your account password' : 'Enter your credentials to access your portal'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-indigo-950/40 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl shadow-indigo-950/80 sm:rounded-3xl border border-indigo-500/20">
          {isResetMode ? (
            /* Forgot Password Reset Form */
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              {resetError && (
                <div className="bg-red-950/50 border-l-4 border-red-500 p-4 rounded-xl backdrop-blur-md border border-red-900/40">
                  <p className="text-sm font-medium text-red-300">{resetError}</p>
                </div>
              )}

              {resetSuccess ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-3 backdrop-blur-md">
                  <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={28} />
                  </div>
                  <p className="text-sm font-bold text-emerald-200">{resetSuccess}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setResetSuccess('');
                    }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-white mt-2 transition-colors"
                  >
                    <ArrowLeft size={16} /> Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">
                      Email Address or Student ID
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-indigo-400">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        required
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-white placeholder-indigo-300/30"
                        placeholder="e.g. user@example.com or KWS-1002"
                      />
                    </div>
                    <p className="mt-2 text-xs text-indigo-300/60 font-medium">
                      Enter the email address or Student ID associated with your account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/60 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
                      className="inline-flex items-center gap-2 text-sm font-bold text-indigo-300/80 hover:text-white transition-colors"
                    >
                      <ArrowLeft size={16} /> Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* Standard Login Form */
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-950/50 border-l-4 border-red-500 p-4 rounded-xl backdrop-blur-md border border-red-900/40">
                  <p className="text-sm font-medium text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">
                  Email Address or Student ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-indigo-400">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-white placeholder-indigo-300/30"
                    placeholder="e.g. user@example.com or KWS-1002"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-indigo-400">
                    <Key size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-white placeholder-indigo-300/30"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/60 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={18} /> Sign In
                  </>
                )}
              </button>
            </form>
          )}

          {!isResetMode && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-indigo-900/60"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="px-3 bg-indigo-950/80 text-indigo-300/70 font-semibold rounded-full border border-indigo-800/40">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className="w-full bg-indigo-900/30 border border-indigo-700/50 hover:bg-indigo-900/60 hover:border-indigo-500 text-indigo-100 font-bold py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-indigo-300 border-t-white rounded-full animate-spin"></div>
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

              <div className="mt-8 text-center border-t border-indigo-900/60 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setResetIdentifier(identifier);
                    setIsResetMode(true);
                  }}
                  className="text-sm font-medium text-indigo-300/80 hover:text-white transition-colors"
                >
                  Forgot your password?{' '}
                  <span className="font-bold text-indigo-400 hover:text-indigo-300 underline">Reset Password</span>
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
