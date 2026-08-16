import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Trophy,
  GraduationCap,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  Star,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  Target,
  Compass,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  LogIn,
  MessageSquare,
  School,
  FileText,
  Video,
  Send,
  Zap,
  Check,
  UserCheck,
  Play
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getEmbedVideoUrl = (url) => {
  if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ';
  if (url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) return url;
  
  let videoId = '';
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } else if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('shorts/')[1]?.split('?')[0];
  } else if (url.includes('embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0];
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0`;
  }
  
  if (url.includes('vimeo.com/')) {
    const vId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${vId}?autoplay=1&muted=1&loop=1`;
  }

  return url.includes('?') ? `${url}&autoplay=1&mute=1` : `${url}?autoplay=1&mute=1`;
};

const getUniversalGoogleMapEmbed = (url, fallbackAddress) => {
  const defaultLoc = fallbackAddress && fallbackAddress.trim().length > 3
    ? `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress.trim())}&t=&z=16&ie=UTF8&iwloc=&output=embed`
    : 'https://maps.google.com/maps?q=Kingswood%20College%2C%20Peradeniya%20Road%2C%20Kandy&t=&z=16&ie=UTF8&iwloc=&output=embed';

  if (!url || typeof url !== 'string' || !url.trim()) {
    return defaultLoc;
  }
  let str = url.trim();

  // 1. If user pasted full <iframe src="..."> tag:
  if (str.includes('src=')) {
    const match = str.match(/src=["']([^"']+)["']/);
    if (match && match[1]) str = match[1];
  }

  // 2. If it's already an official embed URL (/maps/embed) with valid parameters:
  if (str.includes('google.com/maps/embed') && str.length > 50 && !str.endsWith('3d7.29')) {
    return str;
  }

  // 3. If it's a regular Google Maps Place/Search URL (e.g. /maps/place/Name/@lat,lng,... or maps?q=...):
  if (str.includes('google.com/maps') || str.includes('maps.app.goo.gl') || str.includes('maps.google.com')) {
    // Check if place name is inside URL e.g. /place/Ananda+tailoring+center/
    if (str.includes('/place/')) {
      const placeSegment = str.split('/place/')[1];
      if (placeSegment) {
        const placeName = placeSegment.split('/')[0];
        if (placeName) {
          const cleanName = decodeURIComponent(placeName).replace(/\+/g, ' ');
          return `https://maps.google.com/maps?q=${encodeURIComponent(cleanName)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
        }
      }
    }

    // Check if lat/lng coordinates are in URL e.g. @7.1220109,80.2872696
    const coordMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    // Fallback for any other Google Maps share link:
    return `https://maps.google.com/maps?q=${encodeURIComponent(str)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 4. If user typed a plain location or address:
  if (str.length > 2) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(str)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  return defaultLoc;
};

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.89 8.01-3.46 3.81-1.59 4.6-1.87 5.12-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.16-.04.29z"/>
  </svg>
);

const TiktokIcon = () => (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.29-3.09 1.32-6.17 4.12-7.46.77-.36 1.61-.57 2.47-.64v4.11c-.59.04-1.18.22-1.7.49-.9.46-1.52 1.34-1.64 2.34-.17 1.25.43 2.5 1.53 3.1 1.03.56 2.3.56 3.32-.01.99-.54 1.58-1.6 1.6-2.73.04-4.89.01-9.78.02-14.67z"/>
  </svg>
);

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [selectedTeacherVideo, setSelectedTeacherVideo] = useState(null);
  const [selectedTeacherClasses, setSelectedTeacherClasses] = useState(null);
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [showAllAchievers, setShowAllAchievers] = useState(false);

  // Dynamic Admin Panel Data State
  const [classesList, setClassesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [cmsSettings, setCmsSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    batch: 'Grade 12 - 13 (G.C.E. A/L)',
    subject: 'Mathematics',
    message: ''
  });

  const fetchAdminData = async () => {
    try {
      const [classesRes, teachersRes, cmsRes] = await Promise.all([
        axios.get(`${API_URL}/classes`),
        axios.get(`${API_URL}/teachers`),
        axios.get(`${API_URL}/landing-settings`)
      ]);
      if (Array.isArray(classesRes.data) && classesRes.data.length > 0) {
        setClassesList(classesRes.data);
      }
      if (Array.isArray(teachersRes.data) && teachersRes.data.length > 0) {
        setTeachersList(teachersRes.data);
      }
      if (cmsRes.data) {
        const cms = { ...cmsRes.data };
        if (cms.heroTagline && cms.heroTagline.includes('Physics & Combined')) {
          cms.heroTagline = '🏆 Premier Educational Institute | Grade 1 to Grade 13 (All Subjects)';
        }
        if (cms.heroSubtitle && (cms.heroSubtitle.includes('Physics & Combined') || cms.heroSubtitle.includes('Master G.C.E. Advanced Level Physics'))) {
          cms.heroSubtitle = 'Comprehensive tuition classes & digital learning portal for Grade 1 to Grade 13 across all subjects. Interactive learning, real-time attendance tracking, and expert academic guidance.';
        }
        if (cms.facultySub && cms.facultySub.includes('A/L Science & Mathematics')) {
          cms.facultySub = 'Our institute brings together top Sri Lankan educators dedicated to guiding students from Grade 1 to Grade 13 across all core subjects and academic streams.';
        }
        if (cms.visionText && cms.visionText.includes('engineering, medicine, and technology')) {
          cms.visionText = 'To become Sri Lanka\'s benchmark educational institute, empowering students from Grade 1 to Grade 13 with analytical thinking, problem-solving skills, and academic excellence across all subjects and streams.';
        }
        if (cms.missionText && cms.missionText.includes('Z-Scores and Island Ranks')) {
          cms.missionText = 'To unlock every student\'s highest potential from Grade 1 through Grade 13 by combining modern digital technology, structured paper series, clear concept delivery, and individual mentorship.';
        }
        setCmsSettings(cms);
      }
    } catch (err) {
      console.log('Using default landing page data:', err?.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    const handleFocus = () => fetchAdminData();
    const handleCmsUpdate = () => fetchAdminData();
    const handleStorage = (e) => {
      if (e.key === 'kingswood_cms_updated') {
        fetchAdminData();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('cms-updated', handleCmsUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('cms-updated', handleCmsUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', phone: '', batch: 'Grade 12 - 13 (G.C.E. A/L)', subject: 'Mathematics', message: '' });
    }, 4000);
  };

  const handleWhatsAppInquiry = (e) => {
    if (e) e.preventDefault();
    const rawWa = cmsSettings?.whatsapp || '+94771234567';
    let cleanWa = rawWa.replace(/[^0-9]/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '94' + cleanWa.substring(1);
    }
    if (!cleanWa.startsWith('94') && cleanWa.length === 9) {
      cleanWa = '94' + cleanWa;
    }

    const name = formData.name || 'Student';
    const phone = formData.phone || '';
    const batch = formData.batch || '';
    const subject = formData.subject || '';
    const msg = formData.message || '';

    const text = `Hello Kingswood Connect! 👋\n\nI would like to inquire / join tuition classes:\n• *Name:* ${name}\n• *Phone:* ${phone}\n• *Grade/Batch:* ${batch}\n• *Subject:* ${subject}${msg ? `\n• *Message:* ${msg}` : ''}`;

    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Default Lists (clean empty fallbacks)
  const defaultTeachers = [];
  const defaultClasses = [];
  const defaultAchievers = [];
  const defaultFeatures = [];
  const defaultTestimonials = [];

  const activeClasses = (cmsSettings?.classes && cmsSettings.classes.length > 0)
    ? cmsSettings.classes
    : (classesList && classesList.length > 0 ? classesList : []);

  const activeTeachers = (cmsSettings?.teachers && cmsSettings.teachers.length > 0)
    ? cmsSettings.teachers
    : (teachersList && teachersList.length > 0 ? teachersList : []);

  const activeAchievers = (cmsSettings?.achievers && cmsSettings.achievers.length > 0)
    ? cmsSettings.achievers
    : [];

  const activeFeatures = (cmsSettings?.features && cmsSettings.features.length > 0)
    ? cmsSettings.features
    : [];

  const activeTestimonials = (cmsSettings?.testimonials && cmsSettings.testimonials.length > 0)
    ? cmsSettings.testimonials
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-600 selection:text-white relative overflow-x-clip">

      {/* Emergency Announcement Bar */}
      {cmsSettings?.showAnnouncement === true && (
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-800 to-blue-950 text-white text-xs font-bold py-2.5 px-4 text-center border-b border-indigo-700/50 flex items-center justify-center gap-2 relative z-50 shadow-md">
          <Sparkles size={16} className="text-amber-400 shrink-0 animate-pulse" />
          <span>{cmsSettings?.announcementText || '🚀 New G.C.E. O/L & A/L 2026/2027 Batches Registration Now Open! Enroll Online Today.'}</span>
        </div>
      )}

      {/* Decorative Background Glow Filters */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[400px] right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[1800px] left-10 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Navigation Bar - Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/80 shadow-md shadow-slate-900/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 flex items-center justify-center shadow-md shadow-indigo-950/20 border border-indigo-700/30 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-black text-xl tracking-tighter">KC</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-indigo-950 tracking-tight block">
                Kingswood Connect
              </span>
              <span className="block text-[11px] font-bold text-indigo-600 tracking-wider uppercase">
                Premier Educational Institute
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3">
            <button onClick={() => scrollToSection('home')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Home
            </button>
            <button onClick={() => scrollToSection('about-sir')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Our Teachers
            </button>
            <button onClick={() => scrollToSection('videos')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Video Demos
            </button>
            <button onClick={() => scrollToSection('vision-mission')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Vision & Mission
            </button>
            <button onClick={() => scrollToSection('results')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Exam Results
            </button>
            <button onClick={() => scrollToSection('features')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Key Features
            </button>
            <button onClick={() => scrollToSection('contact')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Contact Us
            </button>
          </nav>

          {/* Student Portal Action Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs xl:text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/25 border border-indigo-400/20 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4 mr-2 text-indigo-100" />
              Student Portal
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
            <button
              onClick={() => scrollToSection('home')}
              className="block w-full text-left py-2 px-3 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('about-sir')}
              className="block w-full text-left py-2 px-3 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
            >
              Our Teachers
            </button>
            <button
              onClick={() => scrollToSection('vision-mission')}
              className="block w-full text-left py-2 px-3 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
            >
              Vision & Mission
            </button>
            <button
              onClick={() => scrollToSection('results')}
              className="block w-full text-left py-2 px-3 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
            >
              Exam Results
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 px-3 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
            >
              Key Features
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left py-2 px-3 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
            >
              Contact Us
            </button>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/30"
              >
                <LogIn className="w-5 h-5 mr-2 text-indigo-100" />
                Portal Log In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Text & CTA */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-bold shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>{cmsSettings?.heroTagline || '🏆 Premier Educational Institute | Grade 1 to Grade 13 (All Subjects)'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
                {cmsSettings?.heroTitleLine1 || 'Empowering Academic Excellence &'}{' '}
                <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 via-indigo-600 to-blue-600">
                  {cmsSettings?.heroTitleGradient || 'Future Leaders'}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {cmsSettings?.heroSubtitle || "Comprehensive tuition classes & digital learning portal for Grade 1 to Grade 13 across all subjects. Interactive learning, real-time attendance tracking, and expert academic guidance."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => scrollToSection('about-sir')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <Users className="w-5 h-5 mr-2 text-indigo-100" />
                  {cmsSettings?.heroBtn1Text || 'Meet Our Teachers (Sirs)'}
                </button>

                <button
                  onClick={() => scrollToSection('results')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all flex items-center justify-center"
                >
                  <Award className="w-5 h-5 mr-2 text-amber-500" />
                  {cmsSettings?.heroBtn2Text || 'View Exam Results'}
                </button>
              </div>

              {/* Stat Highlights Grid */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center lg:text-left">
                  <div className="text-3xl font-black text-indigo-600">{cmsSettings?.statsRanks || '150+'}</div>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">{cmsSettings?.statsRanksLabel || 'Island Ranks'}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center lg:text-left">
                  <div className="text-3xl font-black text-blue-600">{cmsSettings?.statsPassRate || '98%'}</div>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">{cmsSettings?.statsPassRateLabel || 'A/B Grade Pass Rate'}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center lg:text-left">
                  <div className="text-3xl font-black text-slate-900">{cmsSettings?.statsStudents || '5,000+'}</div>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">{cmsSettings?.statsStudentsLabel || 'Active Students'}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center lg:text-left">
                  <div className="text-3xl font-black text-emerald-600">{cmsSettings?.statsExperience || '12+ Years'}</div>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">{cmsSettings?.statsExperienceLabel || 'Academic Mastery'}</div>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Graphic Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">

                {/* Main Graphic Container with Glow */}
                <div className="relative rounded-3xl overflow-hidden p-2.5 bg-gradient-to-tr from-indigo-950 via-indigo-600 to-blue-500 shadow-2xl shadow-indigo-950/20">
                  <div className="rounded-2xl overflow-hidden bg-slate-900 relative">
                    <img
                      src={cmsSettings?.heroImage || '/kc-logo.png'}
                      alt="Kingswood Connect Learning Environment"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/kc-logo.png'; }}
                      className="w-full h-[420px] object-contain p-6 bg-indigo-950 object-center transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl backdrop-blur-md bg-white/90 border border-white/60 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider">Advanced Learning Environment</p>
                          <p className="text-sm font-extrabold text-slate-900 mt-0.5">Conceptual Understanding & Digital Pedagogy</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-amber-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 1 */}
                <div className="hidden sm:flex absolute -top-6 -left-6 bg-white/95 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-xl items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{cmsSettings?.heroBadge1Title || '#1 Rated Institute'}</div>
                    <div className="text-xs text-slate-600 font-medium">{cmsSettings?.heroBadge1Sub || 'Auditorium & Live Stream'}</div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="hidden sm:flex absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-xl items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{cmsSettings?.heroBadge2Title || 'Smart QR Attendance'}</div>
                    <div className="text-xs text-slate-600 font-medium">{cmsSettings?.heroBadge2Sub || 'Instant Parent SMS Alerts'}</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Section 2: Faculty Panel & Teachers' Profiles (Meet Our Sirs) */}
      {activeTeachers.length > 0 && (
        <section id="about-sir" className="py-20 bg-slate-100/70 border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider shadow-xs">
              <School className="w-4 h-4 mr-1 text-indigo-600" />
              {cmsSettings?.facultyBadge || 'MEET OUR PANEL OF EXPERT SIRS'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {cmsSettings?.facultyTitle || 'Distinguished Teachers & Subject Specialists'}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {cmsSettings?.facultySub || "Our institute brings together top Sri Lankan educators dedicated to guiding students from Grade 1 to Grade 13 across all core subjects and academic streams."}
            </p>
          </div>

          {/* Faculty Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {(showAllTeachers ? activeTeachers : activeTeachers.slice(0, 3)).map((teacher, idx) => {
              const badgeColors = ['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600'];
              const cardBadgeColor = teacher.badgeColor || badgeColors[idx % badgeColors.length];
              const teacherImg = teacher.image || teacher.photo || '/kc-logo.png';

              return (
                <div key={teacher.teacherId || idx} className="rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden group flex flex-col justify-between">
                  <div>
                    <div 
                      onClick={() => setSelectedTeacherClasses(teacher)}
                      className="relative h-72 overflow-hidden bg-slate-900 cursor-pointer flex items-center justify-center p-2"
                      title="Click to view classes & timetable"
                    >
                      <img
                        src={teacherImg}
                        alt={`${teacher.name} - ${teacher.subject}`}
                        onError={(e) => { e.target.onerror = null; e.target.src = '/kc-logo.png'; }}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute top-3 right-3 ${cardBadgeColor} backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md border border-white/20 z-10`}>
                        {teacher.subject || 'Specialist'}
                      </div>

                      {/* View Classes Overlay Badge */}
                      <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-indigo-600/90 group-hover:bg-indigo-600 text-white flex items-center justify-center shadow-xl border border-white/30 transform group-hover:scale-110 transition-transform">
                          <BookOpen size={24} className="text-white" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
                        <BookOpen size={10} className="text-amber-400" /> Click to View Classes & Timetable
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{teacher.name}</h3>
                        <p className="text-xs text-indigo-700 font-bold mt-1">{teacher.qualification || 'Senior Lecturer'}</p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {teacher.desc || `Expert educator specializing in ${teacher.subject || 'Advanced Level Subjects'}. Simplifies complex topics with intuitive visual concepts.`}
                      </p>

                      <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center"><Award className="w-3.5 h-3.5 mr-1 text-amber-500" /> Experience:</span>
                          <strong className="text-slate-900 font-bold">{teacher.experience || '10+ Years'}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center"><Trophy className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Island Ranks:</span>
                          <strong className="text-indigo-700 font-extrabold">{teacher.ranks || '100+ Ranks'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-2">
                    <button
                      onClick={() => setSelectedTeacherClasses(teacher)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 active:scale-[0.98]"
                    >
                      <BookOpen className="w-4 h-4 text-white" /> View Classes & Timetable
                    </button>
                    <button
                      onClick={() => {
                        const msg = `Hello! I would like to inquire about ${teacher.name}'s (${teacher.subject}) classes at Kingswood Connect.`;
                        window.open(`https://wa.me/94771234567?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4 text-white" /> Inquire / Join via WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expand / Collapse Button for Faculty */}
          {activeTeachers.length > 3 && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setShowAllTeachers(!showAllTeachers)}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
              >
                {showAllTeachers ? (
                  <>Show Less Teachers <ChevronUp size={18} /></>
                ) : (
                  <>View All {activeTeachers.length} Teachers <ChevronDown size={18} /></>
                )}
              </button>
            </div>
          )}

        </div>
      </section>
      )}


      {/* Dedicated Section: Sirs' Teaching Methodology & Video Demos */}
      <section id="videos" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Video className="w-4 h-4 mr-1 text-indigo-400" />
              TEACHING METHODOLOGY & DEMOS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Experience Our Sirs' Class Demonstrations
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg">
              Watch sample lectures, conceptual explanations, and introduction videos conducted by our expert sirs.
            </p>
          </div>

          {/* Single Autoplay Video Player Banner */}
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden p-2 bg-gradient-to-tr from-indigo-950 via-indigo-600 to-blue-500 shadow-2xl shadow-indigo-950/40">
              <div className="rounded-2xl overflow-hidden bg-slate-950 relative aspect-video flex items-center justify-center">
                {(() => {
                  const rawUrl = cmsSettings?.demoVideoUrl || activeTeachers.find(t => t.videoUrl)?.videoUrl || '';
                  const hasVideo = rawUrl && !rawUrl.includes('dQw4w9WgXcQ');

                  if (!hasVideo) {
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/90 relative">
                        <img
                          src="/kc-logo.png"
                          alt="Kingswood Connect Preview"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/kc-logo.png'; }}
                          className="w-48 sm:w-64 h-auto object-contain drop-shadow-2xl mb-4"
                        />
                        <div className="flex items-center gap-2 bg-indigo-600/90 border border-indigo-400/40 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg">
                          <Video size={18} /> Kingswood Connect Learning Environment
                        </div>
                      </div>
                    );
                  }

                  const isDirectVideo = rawUrl.startsWith('data:video') || rawUrl.endsWith('.mp4') || rawUrl.endsWith('.webm') || rawUrl.endsWith('.mov');

                  if (isDirectVideo) {
                    return (
                      <video
                        src={rawUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-cover"
                      />
                    );
                  }

                  return (
                    <iframe
                      src={getEmbedVideoUrl(rawUrl)}
                      title="Kingswood Connect Class Demonstration"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                })()}
              </div>
            </div>

            {/* Video Footer Info Bar */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <Play size={20} className="fill-indigo-400 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Kingswood Connect Institute Class Demonstration</h4>
                  <p className="text-xs text-indigo-200">Continuous Autoplay Preview • Unmute player controls for sound</p>
                </div>
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 self-center sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                AUTOPLAY DEMO
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* Section 3: Vision & Mission */}
      <section id="vision-mission" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Compass className="w-4 h-4 mr-1 text-blue-600" />
              {cmsSettings?.visionBadge || 'OUR CORE PURPOSE'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {cmsSettings?.visionTitle || 'Vision & Mission'}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {cmsSettings?.visionSub || 'Every initiative at Kingswood Connect is guided by an unyielding commitment to student transformation and academic integrity.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Vision Card */}
            <div className="relative group rounded-3xl p-8 bg-white border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-all" />

              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-indigo-600" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center">
                Our Vision <span className="text-xs font-bold text-indigo-700 ml-2 uppercase tracking-wide bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">(Future Outlook)</span>
              </h3>

              <p className="text-slate-600 leading-relaxed text-base">
                {cmsSettings?.visionText || "To become Sri Lanka's benchmark educational institute, empowering students from Grade 1 to Grade 13 with analytical thinking, problem-solving skills, and academic excellence across all subjects and streams."}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-200 flex items-center space-x-3 text-sm text-indigo-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <span>Pioneering Innovation & Educational Integrity</span>
              </div>
            </div>

            {/* Mission Card */}
            <div className="relative group rounded-3xl p-8 bg-white border border-slate-200 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-all" />

              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-3 flex items-center">
                Our Mission <span className="text-xs font-bold text-blue-700 ml-2 uppercase tracking-wide bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">(Daily Commitment)</span>
              </h3>

              <p className="text-slate-600 leading-relaxed text-base">
                {cmsSettings?.missionText || "To unlock every student's highest potential from Grade 1 through Grade 13 by combining modern digital technology, structured paper series, clear concept delivery, and individual mentorship."}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-200 flex items-center space-x-3 text-sm text-blue-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>Continuous Guidance & Uncompromising Quality</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* Section 4: Exam Results & Top Achievers */}
      {activeAchievers.length > 0 && (
        <section id="results" className="py-20 bg-slate-100/80 border-y border-slate-200/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-xs">
                <Award className="w-4 h-4 mr-1 text-amber-600" />
                {cmsSettings?.resultsBadge || 'PROVEN EXCELLENCE'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                {cmsSettings?.resultsTitle || 'Celebrating Our Top Island Rankers'}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                {cmsSettings?.resultsSub || 'True success is measured by consistent results. Highlighting our outstanding performers in recent G.C.E. A/L examinations.'}
              </p>
            </div>

            {/* Rank Showcase Cards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(showAllAchievers ? activeAchievers : activeAchievers.slice(0, 4)).map((ach, idx) => (
                <div key={idx} className="rounded-2xl bg-white border border-slate-200 hover:border-amber-400 p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl group">
                  <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-900 h-56 flex items-center justify-center">
                    <img
                      src={ach.image || '/kc-logo.png'}
                      alt={ach.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/kc-logo.png'; }}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
                      {ach.rankBadge || '🏆 Top Ranker'}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{ach.name}</h3>
                  <p className="text-xs text-indigo-700 font-bold">{ach.stream}</p>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-700">
                    <span>Z-Score: <strong className="text-amber-600 font-black">{ach.zScore}</strong></span>
                    <span className="text-slate-500 font-medium">{ach.district}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Expand / Collapse Button for Top Achievers */}
            {activeAchievers.length > 4 && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllAchievers(!showAllAchievers)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  {showAllAchievers ? (
                    <>Show Less Achievers <ChevronUp size={18} /></>
                  ) : (
                    <>View All {activeAchievers.length} Top Rankers 🏆 <ChevronDown size={18} /></>
                  )}
                </button>
              </div>
            )}

            {/* Call-to-action Banner */}
            <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 border border-indigo-800/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-extrabold text-white">{cmsSettings?.resultsCtaTitle || 'Be the Next A/L Success Story!'}</h3>
                <p className="text-sm text-indigo-100">{cmsSettings?.resultsCtaSub || 'Enroll today and gain instant access to Kingswood Connect student portal, tutes, and exam schedules.'}</p>
              </div>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-black text-sm whitespace-nowrap shadow-lg shadow-indigo-500/30 transition-all flex items-center"
              >
                Access Student Portal <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* Section 6: Tuition Class Technology & Features */}
      {activeFeatures.length > 0 && (
        <section id="features" className="py-20 bg-slate-100/80 border-y border-slate-200/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider shadow-xs">
                <Zap className="w-4 h-4 mr-1 text-emerald-600" />
                {cmsSettings?.featuresBadge || 'INSTITUTE & DIGITAL FEATURES'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                {cmsSettings?.featuresTitle || 'Modern Tuition & Technology Features'}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                {cmsSettings?.featuresSub || 'Engineered specifically to maximize student productivity and keep parents informed in real-time.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeFeatures.map((feat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 transition-all space-y-3 shadow-md hover:shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    {idx === 0 && <ShieldCheck className="w-6 h-6" />}
                    {idx === 1 && <TrendingUp className="w-6 h-6" />}
                    {idx === 2 && <Video className="w-6 h-6" />}
                    {idx === 3 && <FileText className="w-6 h-6" />}
                    {idx > 3 && <Sparkles className="w-6 h-6" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Section 7: Student & Parent Testimonials */}
      {activeTestimonials.length > 0 && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider shadow-xs">
                <MessageSquare className="w-4 h-4 mr-1 text-indigo-600" />
                {cmsSettings?.testimonialsBadge || 'STUDENT & PARENT REVIEWS'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                {cmsSettings?.testimonialsTitle || 'Trusted by Thousands'}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {activeTestimonials.map((rev, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/90 relative space-y-4 shadow-md hover:shadow-xl transition-all">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed italic">
                    {rev.text}
                  </p>
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{rev.name}</span>
                      <span className="text-slate-500">{rev.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}


      {/* Section 8: Contact Us & Location */}
      <section id="contact" className="py-24 bg-gradient-to-b from-slate-100/90 via-slate-50 to-indigo-950/5 border-t border-slate-200 relative overflow-hidden">
        
        {/* Background glow accents */}
        <div className="absolute top-10 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 items-start">

            {/* Left Column: Contact Cards Grid */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-black uppercase tracking-wider shadow-xs">
                  <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  {cmsSettings?.contactBadge || 'GET IN TOUCH'}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {cmsSettings?.contactTitle || 'Contact Us & Enrollment'}
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  {cmsSettings?.contactSub || 'Have questions regarding upcoming tuition batches or online class registration? Send us an inquiry or reach out to our hotlines directly.'}
                </p>
              </div>

              {/* 4 Organised Contact Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* 1. Official WhatsApp */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all space-y-2 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                        <MessageSquare size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        INSTANT
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 block">Official Support</span>
                    <p className="text-sm font-black text-emerald-700 tracking-tight">
                      {cmsSettings?.whatsapp || '+94 76 977 6315'}
                    </p>
                  </div>
                  <button
                    onClick={handleWhatsAppInquiry}
                    type="button"
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95"
                  >
                    Chat Now <ChevronRight size={14} />
                  </button>
                </div>

                {/* 2. Student WhatsApp Gateway */}
                <div className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition-all space-y-2 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                        <Zap size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                        QR ALERTS
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 block">Student Gateway</span>
                    <p className="text-sm font-black text-indigo-700 tracking-tight">
                      {cmsSettings?.studentWhatsApp || '+94 77 987 6543'}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 block text-center">
                    Attendance & Receipts
                  </span>
                </div>

                {/* 3. Hotlines */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all space-y-2 group">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform mb-1">
                    <Phone size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 block">Inquiry Hotlines</span>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {cmsSettings?.phone || '+94 81 222 3456 / +94 77 123 4567'}
                  </p>
                </div>

                {/* 4. Institute Address */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all space-y-2 group">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform mb-1">
                    <MapPin size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-500 block">Auditorium Address</span>
                  <p className="text-xs font-bold text-slate-800 leading-snug truncate" title={cmsSettings?.address || 'Kingswood Education Complex, Kandy'}>
                    {cmsSettings?.address || 'Kingswood Complex, Kandy'}
                  </p>
                </div>

              </div>
            </div>

            {/* Right Column: Direct WhatsApp Inquiry Form Card */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                      Send an Instant WhatsApp Inquiry
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Fill out your details to send your inquiry directly to our team via WhatsApp.</p>
                  </div>
                </div>

                <form onSubmit={handleWhatsAppInquiry} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Kaveen Perera"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">WhatsApp / Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0771234567"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">Target Grade / Batch</label>
                      <select
                        value={formData.batch}
                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      >
                        <option value="Grade 1 - 5 (Primary & Scholarship)">Grade 1 - 5 (Primary & Scholarship)</option>
                        <option value="Grade 6 - 9 (Junior Secondary)">Grade 6 - 9 (Junior Secondary)</option>
                        <option value="Grade 10 - 11 (G.C.E. O/L)">Grade 10 - 11 (G.C.E. O/L)</option>
                        <option value="Grade 12 - 13 (G.C.E. A/L)">Grade 12 - 13 (G.C.E. A/L)</option>
                        {activeClasses.map((cls, i) => (
                          <option key={cls.classId || i} value={cls.name}>
                            {cls.name} ({cls.teacherName || cls.grade})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">Subject Preference</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="ICT & Computer Studies">ICT & Computer Studies</option>
                        <option value="Sinhala / Language">Sinhala / Language</option>
                        <option value="Combined Mathematics">Combined Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                        <option value="Commerce & Accounting">Commerce & Accounting</option>
                        <option value="All Core Subjects">All Core Subjects</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase tracking-wider">Your Message / Inquiry</label>
                    <textarea
                      rows="3"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write any specific questions or details you would like to know..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.99]"
                    >
                      <MessageSquare className="w-5 h-5 text-white" />
                      Send Inquiry via WhatsApp
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>

          {/* Integrated Google Maps Location Header + Frame Card */}
          {(() => {
            const rawUrl = cmsSettings?.googleMapsUrl;
            const address = cmsSettings?.address;
            const finalMapsUrl = getUniversalGoogleMapEmbed(rawUrl, address);
            const displayAddress = address || 'Kingswood Education Complex, Kandy';

            return (
              <div className="mt-12 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                        📍 Find Us on Google Maps
                      </h4>
                      <p className="text-xs text-slate-300 font-medium truncate max-w-md">{displayAddress}</p>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all inline-flex items-center gap-1.5 shrink-0"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>

                <div className="p-2 bg-slate-100">
                  <iframe
                    src={finalMapsUrl}
                    title="Kingswood Connect Location"
                    className="w-full h-64 sm:h-72 rounded-2xl border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </div>
            );
          })()}

          {/* Download Prospectus & Timetable PDF Button */}
          {cmsSettings?.prospectusUrl && (
            <div className="mt-8 text-center">
              <a
                href={cmsSettings.prospectusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs sm:text-sm font-black border border-indigo-400/30 shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
              >
                <BookOpen size={18} /> Download 2026/2027 Class Prospectus & Timetable (PDF)
              </a>
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-950 border-t border-indigo-900 py-12 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/60 border border-indigo-400/20">
                <span className="text-white font-black text-sm tracking-tighter">KC</span>
              </div>
              <span className="text-base font-extrabold text-white">Kingswood Connect</span>
            </div>

            {/* Social Media Links */}
            <div className="flex flex-wrap items-center gap-3">
              {cmsSettings?.facebookUrl && (
                <a href={cmsSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-blue-300 hover:text-white border border-[#1877F2]/30 transition-all font-bold text-xs flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5" title="Facebook">
                  <FacebookIcon /> Facebook
                </a>
              )}
              {cmsSettings?.youtubeUrl && (
                <a href={cmsSettings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-[#FF0000]/15 hover:bg-[#FF0000] text-red-300 hover:text-white border border-[#FF0000]/30 transition-all font-bold text-xs flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5" title="YouTube">
                  <YoutubeIcon /> YouTube
                </a>
              )}
              {cmsSettings?.instagramUrl && (
                <a href={cmsSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-amber-600/20 hover:from-purple-600 hover:via-pink-600 hover:to-amber-600 text-pink-200 hover:text-white border border-pink-500/30 transition-all font-bold text-xs flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5" title="Instagram">
                  <InstagramIcon /> Instagram
                </a>
              )}
              {cmsSettings?.telegramUrl && (
                <a href={cmsSettings.telegramUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-[#24A1DE]/15 hover:bg-[#24A1DE] text-sky-300 hover:text-white border border-[#24A1DE]/30 transition-all font-bold text-xs flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5" title="Telegram">
                  <TelegramIcon /> Telegram
                </a>
              )}
              {cmsSettings?.tiktokUrl && (
                <a href={cmsSettings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-black text-slate-200 hover:text-white border border-slate-700 transition-all font-bold text-xs flex items-center gap-2 shadow-sm transform hover:-translate-y-0.5" title="TikTok">
                  <TiktokIcon /> TikTok
                </a>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-indigo-200 font-semibold">
              <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => scrollToSection('about-sir')} className="hover:text-white transition-colors">Our Teachers</button>
              <button onClick={() => scrollToSection('vision-mission')} className="hover:text-white transition-colors">Vision & Mission</button>
              <button onClick={() => scrollToSection('results')} className="hover:text-white transition-colors">Results</button>
              <Link to="/login" className="text-blue-400 font-bold hover:underline">Portal Log In</Link>
            </div>

          </div>

          <div className="pt-6 border-t border-indigo-900/60 text-center text-indigo-300/80 text-[11px]">
            © {new Date().getFullYear()} Kingswood Connect Educational Institute. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* Interactive Teacher Introduction & Class Demo Video Modal */}
      {selectedTeacherVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Play size={20} className="fill-indigo-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">{selectedTeacherVideo.name}</h3>
                  <p className="text-xs text-indigo-300 font-bold">{selectedTeacherVideo.subject || 'Specialist'} - Class Demo & Introduction Video</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherVideo(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Close Video"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-slate-950 aspect-video relative flex items-center justify-center">
              {selectedTeacherVideo.videoUrl && (selectedTeacherVideo.videoUrl.startsWith('data:video') || selectedTeacherVideo.videoUrl.endsWith('.mp4') || selectedTeacherVideo.videoUrl.endsWith('.webm') || selectedTeacherVideo.videoUrl.endsWith('.mov')) ? (
                <video
                  src={selectedTeacherVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full rounded-2xl object-contain"
                />
              ) : (
                <iframe
                  src={getEmbedVideoUrl(selectedTeacherVideo.videoUrl)}
                  title={`${selectedTeacherVideo.name} Class Video Demo`}
                  className="w-full h-full rounded-2xl border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-200">
              <span className="text-xs font-bold text-slate-600">Kingswood Connect Faculty Video Demo</span>
              <button
                onClick={() => setSelectedTeacherVideo(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Classes & Timetable Modal Popup */}
      {selectedTeacherClasses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 bg-gradient-to-r from-indigo-950 to-indigo-900 text-white flex items-center justify-between border-b border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/40 text-white border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white leading-tight">{selectedTeacherClasses.name}</h3>
                  <p className="text-xs text-indigo-300 font-bold">{selectedTeacherClasses.subject || 'Specialist'} - Active Classes & Timetable</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherClasses(null)}
                className="p-2 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 hover:text-white transition-colors"
                title="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 bg-slate-50">
              {(() => {
                const teacherNameLower = (selectedTeacherClasses.name || '').toLowerCase().trim();
                const teacherSubjectLower = (selectedTeacherClasses.subject || '').toLowerCase().trim();
                const teacherIdLower = (selectedTeacherClasses.teacherId || selectedTeacherClasses.id || '').toLowerCase().trim();

                // Combine real database classes and CMS settings classes
                const pool = [
                  ...(Array.isArray(classesList) ? classesList : []),
                  ...(cmsSettings?.classes && Array.isArray(cmsSettings.classes) ? cmsSettings.classes : [])
                ];

                const matched = pool.filter(c => {
                  const cTeacherName = (c.teacherName || c.teacher || '').toLowerCase().trim();
                  const cName = (c.name || '').toLowerCase().trim();
                  const cSubject = (c.subject || '').toLowerCase().trim();
                  const cTeacherId = (c.teacherId || '').toLowerCase().trim();

                  const nameMatch = teacherNameLower && (cTeacherName.includes(teacherNameLower) || teacherNameLower.includes(cTeacherName));
                  const idMatch = teacherIdLower && cTeacherId === teacherIdLower;
                  const subjectMatch = teacherSubjectLower && (cSubject.includes(teacherSubjectLower) || cName.includes(teacherSubjectLower));

                  return nameMatch || idMatch || subjectMatch;
                });

                // Deduplicate matched classes
                const displayClasses = Array.from(new Map(matched.map(c => [c.classId || c.id || `${c.name}-${c.schedule}`, c])).values());

                if (displayClasses.length === 0) {
                  return (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                        <BookOpen size={24} />
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900">Active Classes Schedule for {selectedTeacherClasses.name}</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                        Classes, timetable schedules, and fee structures for {selectedTeacherClasses.name} ({selectedTeacherClasses.subject || 'Specialist'}) are updated directly from active institute classes.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const msg = `Hello! I would like to inquire about ${selectedTeacherClasses.name}'s (${selectedTeacherClasses.subject || 'All'}) class timetable & enrollment at Kingswood Connect.`;
                          window.open(`https://wa.me/94771234567?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        <Send size={14} /> Inquire Timetable via WhatsApp
                      </button>
                    </div>
                  );
                }

                return displayClasses.map((cls, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        {cls.grade || 'Active Batch'}
                      </span>
                      <span className="text-xs font-extrabold text-indigo-700">
                        {typeof cls.fee === 'number' ? `Rs. ${cls.fee.toLocaleString()}` : (cls.fee ? (String(cls.fee).startsWith('Rs.') ? cls.fee : `Rs. ${cls.fee}`) : 'Contact for Fee')}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">{cls.name || `${selectedTeacherClasses.subject || 'Theory'} Class`}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {cls.description || `Syllabus coverage, past paper discussions, and interactive learning sessions conducted by ${cls.teacherName || selectedTeacherClasses.name}.`}
                    </p>
                    <div className="pt-3 border-t border-slate-100 grid sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-600 shrink-0" />
                        <span>{cls.schedule || 'Weekly Scheduled Session'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-indigo-600 shrink-0" />
                        <span>{cls.location || 'Kingswood Auditorium & Stream'}</span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="p-4 bg-white flex items-center justify-between border-t border-slate-200">
              <button
                onClick={() => {
                  const msg = `Hello! I would like to inquire about ${selectedTeacherClasses.name}'s (${selectedTeacherClasses.subject}) classes at Kingswood Connect.`;
                  window.open(`https://wa.me/94771234567?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <Send size={14} /> Join via WhatsApp
              </button>
              <button
                onClick={() => setSelectedTeacherClasses(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
