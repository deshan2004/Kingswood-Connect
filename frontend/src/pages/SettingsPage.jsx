import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Shield, Key, Mail, UserCheck, Layout, Save, CheckCircle2, AlertCircle, 
  Phone, MapPin, Sparkles, Trophy, Compass, Globe, Plus, Trash2, BookOpen, 
  Users, Award, Zap, MessageSquare, ChevronDown, ChevronUp, Upload 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChangePassword from '../components/ChangePassword';
import TrashBin from './TrashBin';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getEmbedVideoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) {
    return url;
  }
  if (url.includes('embed/')) return url;
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('shorts/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  return url;
};

const ImageUploadInput = ({ label, value, onChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size is too large. Please select an image under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          onChange(compressedDataUrl);
        };
        img.onerror = () => {
          onChange(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">{label}</label>
      
      <div className="p-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/50 via-white to-indigo-50/20 shadow-xs hover:border-indigo-300 transition-all">
        {value ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl border-2 border-indigo-500/20 overflow-hidden bg-slate-100 shrink-0 group shadow-md transition-transform hover:scale-105">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-2 rounded-xl bg-red-600/90 text-white hover:bg-red-700 transition-all shadow-md transform scale-95 group-hover:scale-100"
                  title="Remove Photo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
                <CheckCircle2 size={13} className="text-emerald-600" /> Photo Ready & Optimized
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-indigo-200 transition-all active:scale-95">
                  <Upload size={14} /> Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer group flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl bg-white/80 hover:bg-indigo-50/40 transition-all text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5 transition-all transform group-hover:scale-110 shadow-xs">
              <Upload size={22} />
            </div>
            <span className="text-xs font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">
              Click to Choose / Upload Photo
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-1">
              Supports PNG, JPG, WEBP (auto-optimized for instant loading)
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
    </div>
  );
};

const VideoUploadInput = ({ label, value, onChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        alert('Video file size exceeds 25MB limit. Please select a video file under 25MB, or paste a YouTube / Vimeo link below.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isUploadedVideo = value && (value.startsWith('data:video') || value.endsWith('.mp4') || value.endsWith('.webm') || value.endsWith('.mov'));
  const embedUrl = getEmbedVideoUrl(value);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">{label}</label>
      
      <div className="p-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/50 via-white to-indigo-50/20 shadow-xs hover:border-indigo-300 transition-all space-y-3">
        {value ? (
          <div className="space-y-3">
            <div className="relative aspect-video max-h-48 rounded-2xl border border-slate-300 overflow-hidden bg-slate-950 shadow-md flex items-center justify-center">
              {isUploadedVideo ? (
                <video src={value} controls className="w-full h-full object-contain" />
              ) : (
                <iframe
                  src={embedUrl}
                  title="Video Preview"
                  className="w-full h-full border-0 pointer-events-none"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
                <CheckCircle2 size={13} className="text-emerald-600" />
                {isUploadedVideo ? 'Direct Video File Active' : 'YouTube / External Link Active'}
              </div>
              
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-indigo-200 transition-all active:scale-95">
                  <Upload size={14} /> Change Video
                  <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                </label>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 transition-all"
                >
                  Clear Video
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="cursor-pointer group flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl bg-white/80 hover:bg-indigo-50/40 transition-all text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5 transition-all transform group-hover:scale-110 shadow-xs">
                <Upload size={22} />
              </div>
              <span className="text-xs font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">
                Click to Choose / Upload Video File (up to 25MB)
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1">
                For long videos, paste YouTube or Vimeo link below
              </span>
              <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </label>

            <div className="flex items-center gap-2 my-1">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">OR PASTE YOUTUBE / VIMEO LINK</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-slate-300 font-medium text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const paramTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(paramTab === 'trash' ? 'trash' : (isAdmin ? 'cms' : 'security'));
  const [activeCmsSection, setActiveCmsSection] = useState('hero');

  useEffect(() => {
    if (paramTab === 'trash') {
      setActiveTab('trash');
    }
  }, [paramTab]);

  // Landing Page CMS Comprehensive State
  const [cmsData, setCmsData] = useState({
    heroTagline: '',
    heroTitleLine1: '',
    heroTitleGradient: '',
    heroSubtitle: '',
    heroBtn1Text: '',
    heroBtn2Text: '',
    heroBadge1Title: '',
    heroBadge1Sub: '',
    heroBadge2Title: '',
    heroBadge2Sub: '',
    heroImage: '',

    statsRanks: '',
    statsRanksLabel: '',
    statsPassRate: '',
    statsPassRateLabel: '',
    statsStudents: '',
    statsStudentsLabel: '',
    statsExperience: '',
    statsExperienceLabel: '',

    facultyBadge: '',
    facultyTitle: '',
    facultySub: '',
    teachers: [],

    classesBadge: '',
    classesTitle: '',
    classesSub: '',
    classes: [],

    resultsBadge: '',
    resultsTitle: '',
    resultsSub: '',
    resultsCtaTitle: '',
    resultsCtaSub: '',
    achievers: [],

    visionBadge: '',
    visionTitle: '',
    visionSub: '',
    visionText: '',
    missionText: '',

    featuresBadge: '',
    featuresTitle: '',
    featuresSub: '',
    features: [],

    testimonialsBadge: '',
    testimonialsTitle: '',
    testimonials: [],

    contactBadge: '',
    contactTitle: '',
    contactSub: '',
    address: '',
    phone: '',
    whatsapp: '',
    studentWhatsApp: '',
    email: '',

    showAnnouncement: true,
    announcementText: '',
    siteLogo: '',
    demoVideoUrl: '',
    prospectusUrl: '',

    facebookUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    telegramUrl: '',
    tiktokUrl: '',
    googleMapsUrl: ''
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
      if (res.data) {
        setCmsData({
          ...res.data,
          teachers: res.data.teachers || [],
          classes: res.data.classes || [],
          achievers: res.data.achievers || [],
          features: res.data.features || [],
          testimonials: res.data.testimonials || []
        });
      }
    } catch (err) {
      console.error('Error loading CMS settings:', err);
    } finally {
      setLoadingCms(false);
    }
  };

  const handleSaveCms = async (e) => {
    if (e) e.preventDefault();
    setSavingCms(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await axios.put(`${API_URL}/landing-settings`, cmsData);
      setSuccessMsg('All Landing Page changes saved successfully! Live website updated.');
      
      // Dispatch real-time update events for open tabs / landing page
      window.dispatchEvent(new Event('cms-updated'));
      localStorage.setItem('kingswood_cms_updated', Date.now().toString());

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save CMS settings:', err);
      const serverDetails = err?.response?.data?.details || err?.response?.data?.error || err.message;
      setErrorMsg(`Failed to save changes: ${serverDetails}`);
    } finally {
      setSavingCms(false);
    }
  };

  // Helper List Item Handlers
  const addTeacher = () => {
    setCmsData({
      ...cmsData,
      teachers: [
        ...cmsData.teachers,
        { name: 'New Teacher', subject: 'Subject Specialist', qualification: 'Degree', desc: 'Description of teaching style...', experience: '5+ Years', ranks: '50+ Ranks' }
      ]
    });
  };

  const removeTeacher = (index) => {
    const updated = cmsData.teachers.filter((_, i) => i !== index);
    setCmsData({ ...cmsData, teachers: updated });
  };

  const addClass = () => {
    setCmsData({
      ...cmsData,
      classes: [
        ...cmsData.classes,
        { name: '2026 Revision Class', grade: '2026 A/L', teacherName: 'Lecturer Name', schedule: 'Sunday 8:00 AM - 1:00 PM', location: 'Kandy Auditorium', fee: 3500, description: 'Class overview...' }
      ]
    });
  };

  const removeClass = (index) => {
    const updated = cmsData.classes.filter((_, i) => i !== index);
    setCmsData({ ...cmsData, classes: updated });
  };

  const addAchiever = () => {
    setCmsData({
      ...cmsData,
      achievers: [
        ...cmsData.achievers,
        { name: 'Student Name', rankBadge: '🏆 Island Rank 01', stream: 'Combined Mathematics', zScore: '2.8500', district: 'Kandy District' }
      ]
    });
  };

  const removeAchiever = (index) => {
    const updated = cmsData.achievers.filter((_, i) => i !== index);
    setCmsData({ ...cmsData, achievers: updated });
  };

  const addTestimonial = () => {
    setCmsData({
      ...cmsData,
      testimonials: [
        ...cmsData.testimonials,
        { name: 'Student Name', role: 'Engineering Faculty', text: '"Review quote..."' }
      ]
    });
  };

  const removeTestimonial = (index) => {
    const updated = cmsData.testimonials.filter((_, i) => i !== index);
    setCmsData({ ...cmsData, testimonials: updated });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30 shrink-0">
            <Shield size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-800">
              System Settings & CMS
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">
              Comprehensive granular control over landing page text, teachers, classes, results, and security
            </p>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-gradient-to-r from-white via-slate-50/70 to-indigo-50/40 rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-indigo-200">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-xs"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-800">{user?.name || 'User Account'}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Session
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail size={13} className="text-indigo-500" /> {user?.email || 'No email attached'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <span className="px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-2 shadow-2xs">
            <UserCheck size={15} className="text-indigo-600" /> Role: {user?.role || 'User'}
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      {isAdmin && (
        <div className="p-1.5 bg-slate-200/80 backdrop-blur-md rounded-2xl border border-slate-300/70 shadow-inner flex flex-wrap gap-2">
          {[
            { id: 'cms', label: '100% Landing Page CMS Editor', icon: Layout },
            { id: 'trash', label: 'Trash & Recycle Bin', icon: Trash2 },
            { id: 'security', label: 'Password & Security', icon: Key }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-300 scale-[1.02]'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70 font-extrabold'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* TAB: Landing Page CMS */}
      {isAdmin && activeTab === 'cms' && (
        <div className="space-y-6">
          
          {/* Action Header Banner */}
          <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-indigo-800/40">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 tracking-tight">
                <Globe className="text-amber-400 animate-pulse" size={26} /> Full Landing Page Content Editor
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/90 font-medium mt-1">Select any section below to customize text, headers, images, classes, teachers, or exam results.</p>
            </div>
            <button
              onClick={handleSaveCms}
              disabled={savingCms}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-indigo-950/50 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 relative z-10 cursor-pointer"
            >
              <Save size={18} />
              {savingCms ? 'Saving All...' : 'Save All Changes'}
            </button>
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

          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-2 bg-slate-100/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs">
            {[
              { id: 'hero', label: '📌 Hero & Badges' },
              { id: 'stats', label: '📊 Stat Counters' },
              { id: 'faculty', label: '👨‍🏫 Faculty (Sirs)' },
              { id: 'classes', label: '📚 Classes & Schedule' },
              { id: 'results', label: '🏆 Exam Results & Ranks' },
              { id: 'vision', label: '🎯 Vision & Mission' },
              { id: 'features', label: '💡 Tech Features' },
              { id: 'testimonials', label: '💬 Reviews' },
              { id: 'contact', label: '📞 Contact & WhatsApp' }
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveCmsSection(sec.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  activeCmsSection === sec.id
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200/60 shadow-2xs'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {loadingCms ? (
            <div className="py-12 text-center text-slate-400 font-medium text-sm">
              Loading CMS configuration...
            </div>
          ) : (
            <form onSubmit={handleSaveCms} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">

              {/* 1. HERO SECTION */}
              {activeCmsSection === 'hero' && (
                <div className="space-y-4">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">📌 1. Hero & Top Banner Content</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pill Tagline Badge</label>
                      <input
                        type="text"
                        value={cmsData.heroTagline}
                        onChange={(e) => setCmsData({ ...cmsData, heroTagline: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Main Headline Line 1</label>
                      <input
                        type="text"
                        value={cmsData.heroTitleLine1}
                        onChange={(e) => setCmsData({ ...cmsData, heroTitleLine1: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Headline Gradient Text</label>
                      <input
                        type="text"
                        value={cmsData.heroTitleGradient}
                        onChange={(e) => setCmsData({ ...cmsData, heroTitleGradient: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle / Paragraph</label>
                      <textarea
                        rows="2"
                        value={cmsData.heroSubtitle}
                        onChange={(e) => setCmsData({ ...cmsData, heroSubtitle: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Primary CTA Button Label</label>
                      <input
                        type="text"
                        value={cmsData.heroBtn1Text}
                        onChange={(e) => setCmsData({ ...cmsData, heroBtn1Text: e.target.value })}
                        placeholder="Meet Our Faculty (Sirs)"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Secondary CTA Button Label</label>
                      <input
                        type="text"
                        value={cmsData.heroBtn2Text}
                        onChange={(e) => setCmsData({ ...cmsData, heroBtn2Text: e.target.value })}
                        placeholder="View Exam Results"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <ImageUploadInput
                    label="Hero Main Graphic Banner Photo"
                    value={cmsData.heroImage}
                    onChange={(val) => setCmsData({ ...cmsData, heroImage: val })}
                    placeholder="Or paste image URL / path e.g. /images/sir_lecture.png"
                  />

                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <h5 className="text-xs font-bold text-slate-700">Floating Badge 1 (Top Left)</h5>
                      <input
                        type="text"
                        value={cmsData.heroBadge1Title}
                        onChange={(e) => setCmsData({ ...cmsData, heroBadge1Title: e.target.value })}
                        placeholder="Title: #1 Rated Institute"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
                      />
                      <input
                        type="text"
                        value={cmsData.heroBadge1Sub}
                        onChange={(e) => setCmsData({ ...cmsData, heroBadge1Sub: e.target.value })}
                        placeholder="Subtitle: Auditorium & Live Stream"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
                      />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <h5 className="text-xs font-bold text-slate-700">Floating Badge 2 (Bottom Right)</h5>
                      <input
                        type="text"
                        value={cmsData.heroBadge2Title}
                        onChange={(e) => setCmsData({ ...cmsData, heroBadge2Title: e.target.value })}
                        placeholder="Title: Smart QR Attendance"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
                      />
                      <input
                        type="text"
                        value={cmsData.heroBadge2Sub}
                        onChange={(e) => setCmsData({ ...cmsData, heroBadge2Sub: e.target.value })}
                        placeholder="Subtitle: Instant Parent SMS Alerts"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. STAT COUNTERS */}
              {activeCmsSection === 'stats' && (
                <div className="space-y-4">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">📊 2. Stat Counter Values & Labels</h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                      <label className="block text-xs font-bold text-indigo-900">Stat 1 Value</label>
                      <input
                        type="text"
                        value={cmsData.statsRanks}
                        onChange={(e) => setCmsData({ ...cmsData, statsRanks: e.target.value })}
                        placeholder="150+"
                        className="w-full px-3 py-2 font-bold text-indigo-700 rounded-lg bg-white border border-indigo-200 text-sm"
                      />
                      <label className="block text-[11px] font-bold text-slate-600 mt-2">Label</label>
                      <input
                        type="text"
                        value={cmsData.statsRanksLabel}
                        onChange={(e) => setCmsData({ ...cmsData, statsRanksLabel: e.target.value })}
                        placeholder="Island Ranks"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200"
                      />
                    </div>

                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                      <label className="block text-xs font-bold text-blue-900">Stat 2 Value</label>
                      <input
                        type="text"
                        value={cmsData.statsPassRate}
                        onChange={(e) => setCmsData({ ...cmsData, statsPassRate: e.target.value })}
                        placeholder="98%"
                        className="w-full px-3 py-2 font-bold text-blue-700 rounded-lg bg-white border border-blue-200 text-sm"
                      />
                      <label className="block text-[11px] font-bold text-slate-600 mt-2">Label</label>
                      <input
                        type="text"
                        value={cmsData.statsPassRateLabel}
                        onChange={(e) => setCmsData({ ...cmsData, statsPassRateLabel: e.target.value })}
                        placeholder="A/B Grade Pass Rate"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200"
                      />
                    </div>

                    <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-2">
                      <label className="block text-xs font-bold text-slate-900">Stat 3 Value</label>
                      <input
                        type="text"
                        value={cmsData.statsStudents}
                        onChange={(e) => setCmsData({ ...cmsData, statsStudents: e.target.value })}
                        placeholder="5,000+"
                        className="w-full px-3 py-2 font-bold text-slate-900 rounded-lg bg-white border border-slate-300 text-sm"
                      />
                      <label className="block text-[11px] font-bold text-slate-600 mt-2">Label</label>
                      <input
                        type="text"
                        value={cmsData.statsStudentsLabel}
                        onChange={(e) => setCmsData({ ...cmsData, statsStudentsLabel: e.target.value })}
                        placeholder="Active Students"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200"
                      />
                    </div>

                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
                      <label className="block text-xs font-bold text-emerald-900">Stat 4 Value</label>
                      <input
                        type="text"
                        value={cmsData.statsExperience}
                        onChange={(e) => setCmsData({ ...cmsData, statsExperience: e.target.value })}
                        placeholder="12+ Years"
                        className="w-full px-3 py-2 font-bold text-emerald-700 rounded-lg bg-white border border-emerald-200 text-sm"
                      />
                      <label className="block text-[11px] font-bold text-slate-600 mt-2">Label</label>
                      <input
                        type="text"
                        value={cmsData.statsExperienceLabel}
                        onChange={(e) => setCmsData({ ...cmsData, statsExperienceLabel: e.target.value })}
                        placeholder="Academic Mastery"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. FACULTY (SIRS) SECTION */}
              {activeCmsSection === 'faculty' && (
                <div className="space-y-6">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">👨‍🏫 3. Faculty & Teachers Management</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={cmsData.facultyTitle}
                        onChange={(e) => setCmsData({ ...cmsData, facultyTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Subtitle</label>
                      <textarea
                        rows="2"
                        value={cmsData.facultySub}
                        onChange={(e) => setCmsData({ ...cmsData, facultySub: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-slate-800">Teachers List ({cmsData.teachers.length})</h5>
                      <button
                        type="button"
                        onClick={addTeacher}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Plus size={14} /> Add Teacher
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {cmsData.teachers.map((t, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group">
                          <button
                            type="button"
                            onClick={() => removeTeacher(idx)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="grid sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600">Teacher Name</label>
                              <input
                                type="text"
                                value={t.name}
                                onChange={(e) => {
                                  const copy = [...cmsData.teachers];
                                  copy[idx].name = e.target.value;
                                  setCmsData({ ...cmsData, teachers: copy });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600">Subject Specialist</label>
                              <input
                                type="text"
                                value={t.subject}
                                onChange={(e) => {
                                  const copy = [...cmsData.teachers];
                                  copy[idx].subject = e.target.value;
                                  setCmsData({ ...cmsData, teachers: copy });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600">Qualification</label>
                              <input
                                type="text"
                                value={t.qualification}
                                onChange={(e) => {
                                  const copy = [...cmsData.teachers];
                                  copy[idx].qualification = e.target.value;
                                  setCmsData({ ...cmsData, teachers: copy });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                              />
                            </div>
                          </div>

                          <ImageUploadInput
                            label="Teacher Photo"
                            value={t.image || ''}
                            onChange={(val) => {
                              const copy = [...cmsData.teachers];
                              copy[idx].image = val;
                              setCmsData({ ...cmsData, teachers: copy });
                            }}
                            placeholder="Or paste image URL / path e.g. /images/sir_portrait.png"
                          />

                          <VideoUploadInput
                            label="Teacher Introduction / Class Demo Video"
                            value={t.videoUrl || ''}
                            onChange={(val) => {
                              const copy = [...cmsData.teachers];
                              copy[idx].videoUrl = val;
                              setCmsData({ ...cmsData, teachers: copy });
                            }}
                          />

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600">Bio Description</label>
                            <textarea
                              rows="2"
                              value={t.desc}
                              onChange={(e) => {
                                const copy = [...cmsData.teachers];
                                copy[idx].desc = e.target.value;
                                setCmsData({ ...cmsData, teachers: copy });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. CLASSES SECTION */}
              {activeCmsSection === 'classes' && (
                <div className="space-y-6">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">📚 4. Classes & Schedule Management</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={cmsData.classesTitle}
                        onChange={(e) => setCmsData({ ...cmsData, classesTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Subtitle</label>
                      <textarea
                        rows="2"
                        value={cmsData.classesSub}
                        onChange={(e) => setCmsData({ ...cmsData, classesSub: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-slate-800">Active Classes List ({cmsData.classes.length})</h5>
                      <button
                        type="button"
                        onClick={addClass}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Plus size={14} /> Add Class
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {cmsData.classes.map((c, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => removeClass(idx)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="grid sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600">Class Name</label>
                              <input
                                type="text"
                                value={c.name}
                                onChange={(e) => {
                                  const copy = [...cmsData.classes];
                                  copy[idx].name = e.target.value;
                                  setCmsData({ ...cmsData, classes: copy });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600">Lecturer Name</label>
                              <input
                                type="text"
                                value={c.teacherName}
                                onChange={(e) => {
                                  const copy = [...cmsData.classes];
                                  copy[idx].teacherName = e.target.value;
                                  setCmsData({ ...cmsData, classes: copy });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600">Schedule</label>
                              <input
                                type="text"
                                value={c.schedule}
                                onChange={(e) => {
                                  const copy = [...cmsData.classes];
                                  copy[idx].schedule = e.target.value;
                                  setCmsData({ ...cmsData, classes: copy });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600">Class Fee (Rs.)</label>
                              <input
                                type="text"
                                value={c.fee}
                                onChange={(e) => {
                                  const copy = [...cmsData.classes];
                                  copy[idx].fee = e.target.value;
                                  setCmsData({ ...cmsData, classes: copy });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 font-bold text-indigo-700"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. EXAM RESULTS & ACHIEVERS */}
              {activeCmsSection === 'results' && (
                <div className="space-y-6">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">🏆 5. Top Island Achievers & Exam Results</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={cmsData.resultsTitle}
                        onChange={(e) => setCmsData({ ...cmsData, resultsTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Subtitle</label>
                      <textarea
                        rows="2"
                        value={cmsData.resultsSub}
                        onChange={(e) => setCmsData({ ...cmsData, resultsSub: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-slate-800">Top Rankers Showcase ({cmsData.achievers.length})</h5>
                      <button
                        type="button"
                        onClick={addAchiever}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <Plus size={14} /> Add Ranker
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {cmsData.achievers.map((a, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => removeAchiever(idx)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600">Student Name</label>
                              <input
                                type="text"
                                value={a.name}
                                onChange={(e) => {
                                  const copy = [...cmsData.achievers];
                                  copy[idx].name = e.target.value;
                                  setCmsData({ ...cmsData, achievers: copy });
                                }}
                                className="w-full px-2.5 py-1 text-xs rounded-lg bg-white border border-amber-300 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600">Rank Badge</label>
                              <input
                                type="text"
                                value={a.rankBadge}
                                onChange={(e) => {
                                  const copy = [...cmsData.achievers];
                                  copy[idx].rankBadge = e.target.value;
                                  setCmsData({ ...cmsData, achievers: copy });
                                }}
                                placeholder="🏆 Island Rank 01"
                                className="w-full px-2.5 py-1 text-xs rounded-lg bg-white border border-amber-300 font-bold text-amber-700"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600">Z-Score</label>
                              <input
                                type="text"
                                value={a.zScore}
                                onChange={(e) => {
                                  const copy = [...cmsData.achievers];
                                  copy[idx].zScore = e.target.value;
                                  setCmsData({ ...cmsData, achievers: copy });
                                }}
                                placeholder="2.8942"
                                className="w-full px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-300 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600">District</label>
                              <input
                                type="text"
                                value={a.district}
                                onChange={(e) => {
                                  const copy = [...cmsData.achievers];
                                  copy[idx].district = e.target.value;
                                  setCmsData({ ...cmsData, achievers: copy });
                                }}
                                placeholder="Kandy District"
                                className="w-full px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-300"
                              />
                            </div>
                          </div>

                          <ImageUploadInput
                            label="Student Photo"
                            value={a.image || ''}
                            onChange={(val) => {
                              const copy = [...cmsData.achievers];
                              copy[idx].image = val;
                              setCmsData({ ...cmsData, achievers: copy });
                            }}
                            placeholder="Or paste image URL / path e.g. /images/top_student_male.png"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. VISION & MISSION */}
              {activeCmsSection === 'vision' && (
                <div className="space-y-4">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">🎯 6. Vision & Mission Statements</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Institute Vision Statement</label>
                      <textarea
                        rows="4"
                        value={cmsData.visionText}
                        onChange={(e) => setCmsData({ ...cmsData, visionText: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Institute Mission Statement</label>
                      <textarea
                        rows="4"
                        value={cmsData.missionText}
                        onChange={(e) => setCmsData({ ...cmsData, missionText: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. TECH FEATURES */}
              {activeCmsSection === 'features' && (
                <div className="space-y-6">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">💡 7. Technology Features Grid</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={cmsData.featuresTitle}
                        onChange={(e) => setCmsData({ ...cmsData, featuresTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Subtitle</label>
                      <textarea
                        rows="2"
                        value={cmsData.featuresSub}
                        onChange={(e) => setCmsData({ ...cmsData, featuresSub: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 8. REVIEWS & TESTIMONIALS */}
              {activeCmsSection === 'testimonials' && (
                <div className="space-y-6">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">💬 8. Reviews & Testimonials</h4>
                  
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-slate-800">Student & Parent Reviews ({cmsData.testimonials.length})</h5>
                    <button
                      type="button"
                      onClick={addTestimonial}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Plus size={14} /> Add Review
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {cmsData.testimonials.map((rev, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                        <button
                          type="button"
                          onClick={() => removeTestimonial(idx)}
                          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600">Reviewer Name</label>
                            <input
                              type="text"
                              value={rev.name}
                              onChange={(e) => {
                                const copy = [...cmsData.testimonials];
                                copy[idx].name = e.target.value;
                                setCmsData({ ...cmsData, testimonials: copy });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600">Role / Faculty / Batch</label>
                            <input
                              type="text"
                              value={rev.role}
                              onChange={(e) => {
                                const copy = [...cmsData.testimonials];
                                copy[idx].role = e.target.value;
                                setCmsData({ ...cmsData, testimonials: copy });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600">Review Quote Text</label>
                          <textarea
                            rows="2"
                            value={rev.text}
                            onChange={(e) => {
                              const copy = [...cmsData.testimonials];
                              copy[idx].text = e.target.value;
                              setCmsData({ ...cmsData, testimonials: copy });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. CONTACT & WHATSAPP */}
              {activeCmsSection === 'contact' && (
                <div className="space-y-4">
                  <h4 className="text-base font-extrabold text-indigo-900 border-b border-slate-200 pb-2">📞 9. Contact Info & WhatsApp Hotline</h4>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        📱 Student Messaging WhatsApp (Attendance & Receipts)
                      </label>
                      <input
                        type="text"
                        value={cmsData.studentWhatsApp || ''}
                        onChange={(e) => setCmsData({ ...cmsData, studentWhatsApp: e.target.value })}
                        placeholder="+94 77 987 6543"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-indigo-200 text-indigo-900 text-sm font-bold focus:bg-white transition-all"
                      />
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">Used for sending QR attendance scan alerts & payment receipts to students</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        🏢 Official Institute WhatsApp (Public Landing Page)
                      </label>
                      <input
                        type="text"
                        value={cmsData.whatsapp || ''}
                        onChange={(e) => setCmsData({ ...cmsData, whatsapp: e.target.value })}
                        placeholder="+94 77 123 4567"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white transition-all"
                      />
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">Displayed on the website & contact us page for general inquiries</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Hotlines</label>
                      <input
                        type="text"
                        value={cmsData.phone || ''}
                        onChange={(e) => setCmsData({ ...cmsData, phone: e.target.value })}
                        placeholder="+94 81 222 3456 / +94 77 123 4567"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Auditorium Address / Location</label>
                      <input
                        type="text"
                        value={cmsData.address || ''}
                        onChange={(e) => setCmsData({ ...cmsData, address: e.target.value })}
                        placeholder="Kingswood Education Complex, Kandy"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Announcement Bar & Branding */}
                  <div className="pt-6 border-t border-slate-200 space-y-4">
                    <h4 className="text-base font-extrabold text-indigo-900">📢 10. Announcement Bar & Media Links</h4>
                    
                    <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="showAnnouncement"
                          checked={cmsData.showAnnouncement === true}
                          onChange={(e) => setCmsData({ ...cmsData, showAnnouncement: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="showAnnouncement" className="text-xs font-bold text-indigo-900 cursor-pointer">
                          Show Top Emergency Announcement Bar on Website Header
                        </label>
                      </div>

                      <input
                        type="text"
                        value={cmsData.announcementText || ''}
                        onChange={(e) => setCmsData({ ...cmsData, announcementText: e.target.value })}
                        placeholder="e.g. 🚀 New G.C.E. O/L & A/L 2026/2027 Batches Registration Now Open!"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-900 text-sm font-medium"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">🎥 Institute Demo Video URL (YouTube / Vimeo)</label>
                        <input
                          type="text"
                          value={cmsData.demoVideoUrl || ''}
                          onChange={(e) => setCmsData({ ...cmsData, demoVideoUrl: e.target.value })}
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">📄 Class Prospectus / Time Table Link (PDF URL)</label>
                        <input
                          type="text"
                          value={cmsData.prospectusUrl || ''}
                          onChange={(e) => setCmsData({ ...cmsData, prospectusUrl: e.target.value })}
                          placeholder="e.g. https://example.com/timetable-2026.pdf"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media & Google Maps */}
                  <div className="pt-6 border-t border-slate-200 space-y-4">
                    <h4 className="text-base font-extrabold text-indigo-900">🌐 11. Social Media Links & Google Maps</h4>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page URL</label>
                        <input
                          type="text"
                          value={cmsData.facebookUrl || ''}
                          onChange={(e) => setCmsData({ ...cmsData, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/kingswoodconnect"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Channel URL</label>
                        <input
                          type="text"
                          value={cmsData.youtubeUrl || ''}
                          onChange={(e) => setCmsData({ ...cmsData, youtubeUrl: e.target.value })}
                          placeholder="https://youtube.com/@kingswoodconnect"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Instagram Profile URL</label>
                        <input
                          type="text"
                          value={cmsData.instagramUrl || ''}
                          onChange={(e) => setCmsData({ ...cmsData, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/kingswoodconnect"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Telegram Channel URL</label>
                        <input
                          type="text"
                          value={cmsData.telegramUrl || ''}
                          onChange={(e) => setCmsData({ ...cmsData, telegramUrl: e.target.value })}
                          placeholder="https://t.me/kingswoodconnect"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">TikTok Profile URL</label>
                        <input
                          type="text"
                          value={cmsData.tiktokUrl || ''}
                          onChange={(e) => setCmsData({ ...cmsData, tiktokUrl: e.target.value })}
                          placeholder="https://tiktok.com/@kingswoodconnect"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          🗺️ Google Maps Embed Link / iframe Code (Google Maps -&gt; Share -&gt; Embed a map)
                        </label>
                        <input
                          type="text"
                          value={cmsData.googleMapsUrl || ''}
                          onChange={(e) => setCmsData({ ...cmsData, googleMapsUrl: e.target.value })}
                          placeholder='Paste Google Maps Embed URL or full <iframe src="https://www.google.com/maps/embed?pb=..."></iframe> tag'
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white transition-all"
                        />
                        <p className="text-[11px] text-slate-500 mt-1 font-medium">Tip: You can paste the direct map embed link OR the full HTML iframe tag copied from Google Maps!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Footer Button */}
              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={savingCms}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Save size={18} />
                  {savingCms ? 'Saving All Changes...' : 'Save All Landing Page Changes'}
                </button>
              </div>

            </form>
          )}

        </div>
      )}

      {/* TAB: Trash & Recycle Bin */}
      {isAdmin && activeTab === 'trash' && (
        <div className="animate-in fade-in duration-200">
          <TrashBin />
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
