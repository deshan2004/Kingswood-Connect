import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Key, Mail, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Everyone signs up as a student by default. Admins are upgraded manually in Firebase.
  const role = 'student';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
        role
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      const rawError = err.response?.data?.error || err.message || '';
      if (rawError.includes('email-already-in-use') || rawError.includes('already-exists')) {
        setError('An account with this email address already exists. Please login instead.');
      } else if (rawError.includes('weak-password')) {
        setError('Password should be at least 6 characters long.');
      } else if (rawError.startsWith('Firebase:')) {
        setError('Signup failed. Please check your information and try again.');
      } else {
        setError(rawError || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto h-24 w-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 backdrop-blur-md">
            <ShieldCheck size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white">Account Created!</h2>
          <p className="mt-2 text-indigo-200/80 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100 font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link to="/" title="Go to Kingswood Connect Home">
            <img src="/kc-logo.png" alt="Kingswood Connect Logo" className="h-16 w-16 rounded-2xl object-contain bg-white p-1 shadow-lg shadow-indigo-900/60 border border-indigo-400/30 transform hover:scale-105 transition-transform duration-300" />
          </Link>
        </div>
        <h2 className="text-center text-3xl font-black text-white tracking-tight">Create Account</h2>
        <p className="mt-2 text-center text-sm font-medium text-indigo-200/80">
          Register for Kingswood Connect
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-indigo-950/40 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl shadow-indigo-950/80 sm:rounded-3xl border border-indigo-500/20">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-950/50 border-l-4 border-red-500 p-4 rounded-xl backdrop-blur-md border border-red-900/40">
                <p className="text-sm font-medium text-red-300">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-indigo-400"><User size={18} /></span>
                <input
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-white placeholder-indigo-300/30"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-indigo-400"><Mail size={18} /></span>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-white placeholder-indigo-300/30"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-indigo-400"><Key size={18} /></span>
                <input
                  type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-white placeholder-indigo-300/30"
                  placeholder="Min 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/60 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>
          
          <div className="mt-6 text-center border-t border-indigo-900/60 pt-6">
            <p className="text-sm text-indigo-300/80">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-400 hover:text-white underline transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
