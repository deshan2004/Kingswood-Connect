import React, { useState, useEffect } from 'react';
import { Shield, Key, Mail, UserCheck, Layout, Save, CheckCircle2, AlertCircle, Phone, MapPin, Sparkles, Trophy, Compass, Globe } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChangePassword from '../components/ChangePassword';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SettingsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const [activeTab, setActiveTab] = useState(isAdmin ? 'cms' : 'security');

  // Landing Page CMS State
  const [cmsData, setCmsData] = useState({
    heroTagline: '',
    heroTitleLine1: '',
    heroTitleGradient: '',
    heroSubtitle: '',
    statsRanks: '',
    statsPassRate: '',
    statsStudents: '',
    statsExperience: '',
    visionText: '',
    missionText: '',
    address: '',
    phone: '',
    email: ''
  });

  const [loadingCms, setLoadingCms] = useState(true);
  const [savingCms, setSavingCms] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchCmsSettings();
    }
  }, [isAdmin]);

  const fetchCmsSettings = async () => {
    setLoadingCms(true);
    try {
      const res = await axios.get(`${API_URL}/landing-settings`);
      setCmsData(res.data);
    } catch (err) {
      console.error('Error loading CMS settings:', err);
    } finally {
      setLoadingCms(false);
    }
  };

  const handleSaveCms = async (e) => {
    e.preventDefault();
    setSavingCms(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await axios.put(`${API_URL}/landing-settings`, cmsData);
      setSuccessMsg('Landing Page content saved successfully! Changes are now live on the homepage.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save CMS settings:', err);
      setErrorMsg('Failed to save changes. Please try again.');
    } finally {
      setSavingCms(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Shield className="text-indigo-600" size={32} /> System Settings & CMS
        </h2>
        <p className="text-slate-500 font-medium mt-1">Manage landing page content, homepage details, and account security</p>
      </div>

      {/* Account Info Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{user?.name || 'User Account'}</h3>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail size={14} className="text-slate-400" /> {user?.email || 'No email attached'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
            <UserCheck size={14} /> Role: {user?.role || 'User'}
          </span>
        </div>
      </div>

      {/* Tabs Header (For Admins) */}
      {isAdmin && (
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('cms')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'cms'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layout size={18} /> Landing Page Management (CMS)
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Key size={18} /> Password & Security
          </button>
        </div>
      )}

      {/* TAB 1: Landing Page CMS (Admin Only) */}
      {isAdmin && activeTab === 'cms' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Globe className="text-indigo-600" size={24} /> Homepage Content Management
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Update text, titles, stat numbers, and contact details shown on the main Landing Page
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
                <AlertCircle size={20} className="text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loadingCms ? (
              <div className="py-12 text-center text-slate-400 font-medium text-sm">
                Loading current homepage settings...
              </div>
            ) : (
              <form onSubmit={handleSaveCms} className="space-y-8">
                
                {/* 1. Hero Banner Settings */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                    <Sparkles size={16} /> 1. Hero Banner Content
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Top Pill Badge Tagline</label>
                      <input
                        type="text"
                        value={cmsData.heroTagline}
                        onChange={(e) => setCmsData({ ...cmsData, heroTagline: e.target.value })}
                        placeholder="🏆 Premier A/L Physics & Combined Maths Institute"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hero Title Line 1</label>
                      <input
                        type="text"
                        value={cmsData.heroTitleLine1}
                        onChange={(e) => setCmsData({ ...cmsData, heroTitleLine1: e.target.value })}
                        placeholder="Empowering Academic Excellence &"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hero Title Gradient Text</label>
                      <input
                        type="text"
                        value={cmsData.heroTitleGradient}
                        onChange={(e) => setCmsData({ ...cmsData, heroTitleGradient: e.target.value })}
                        placeholder="Future Leaders"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Hero Subtitle / Description</label>
                      <textarea
                        rows="2"
                        value={cmsData.heroSubtitle}
                        onChange={(e) => setCmsData({ ...cmsData, heroSubtitle: e.target.value })}
                        placeholder="Master G.C.E. Advanced Level Physics..."
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Stat Highlights */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                    <Trophy size={16} /> 2. Stat Counter Numbers
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Island Ranks</label>
                      <input
                        type="text"
                        value={cmsData.statsRanks}
                        onChange={(e) => setCmsData({ ...cmsData, statsRanks: e.target.value })}
                        placeholder="150+"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">A/B Pass Rate</label>
                      <input
                        type="text"
                        value={cmsData.statsPassRate}
                        onChange={(e) => setCmsData({ ...cmsData, statsPassRate: e.target.value })}
                        placeholder="98%"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Active Students</label>
                      <input
                        type="text"
                        value={cmsData.statsStudents}
                        onChange={(e) => setCmsData({ ...cmsData, statsStudents: e.target.value })}
                        placeholder="5,000+"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Years Mastery</label>
                      <input
                        type="text"
                        value={cmsData.statsExperience}
                        onChange={(e) => setCmsData({ ...cmsData, statsExperience: e.target.value })}
                        placeholder="12+ Years"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Vision & Mission */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                    <Compass size={16} /> 3. Vision & Mission
                  </h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Institute Vision</label>
                      <textarea
                        rows="3"
                        value={cmsData.visionText}
                        onChange={(e) => setCmsData({ ...cmsData, visionText: e.target.value })}
                        placeholder="To become Sri Lanka's benchmark educational institute..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Institute Mission</label>
                      <textarea
                        rows="3"
                        value={cmsData.missionText}
                        onChange={(e) => setCmsData({ ...cmsData, missionText: e.target.value })}
                        placeholder="To unlock every student's highest potential..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Contact Information */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                    <Phone size={16} /> 4. Contact Details & Location
                  </h4>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Hotlines</label>
                      <input
                        type="text"
                        value={cmsData.phone}
                        onChange={(e) => setCmsData({ ...cmsData, phone: e.target.value })}
                        placeholder="+94 81 222 3456 / +94 77 123 4567"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Hotline / Support Number</label>
                      <input
                        type="text"
                        value={cmsData.whatsapp}
                        onChange={(e) => setCmsData({ ...cmsData, whatsapp: e.target.value })}
                        placeholder="+94 77 123 4567"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Auditorium / Location</label>
                      <input
                        type="text"
                        value={cmsData.address}
                        onChange={(e) => setCmsData({ ...cmsData, address: e.target.value })}
                        placeholder="Kingswood Education Complex, Peradeniya Road, Kandy"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingCms}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    {savingCms ? 'Saving Content...' : 'Save Landing Page Changes'}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Password & Security */}
      {(!isAdmin || activeTab === 'security') && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-lg">
            <Key className="text-indigo-600" size={20} /> Password Security
          </div>
          <ChangePassword />
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
