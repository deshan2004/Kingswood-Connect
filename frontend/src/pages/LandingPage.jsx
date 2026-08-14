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
  if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  if (url.startsWith('data:video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov')) return url;
  if (url.includes('embed/')) return url;
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('shorts/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
  }
  return url;
};

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [selectedTeacherVideo, setSelectedTeacherVideo] = useState(null);
  const [selectedTeacherClasses, setSelectedTeacherClasses] = useState(null);

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
        setCmsSettings(cmsRes.data);
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

  // Fallbacks
  const defaultTeachers = [
    {
      teacherId: 'TCH-1001',
      name: 'Eng. Kasun Perera',
      subject: 'Mathematics (Grade 6 - 13)',
      qualification: 'B.Sc. Engineering (Hons) - Peradeniya',
      desc: 'Master lecturer specializing in Mathematics from Grade 6 to 11 O/L as well as A/L Combined Mathematics, simplifying complex algebra, geometry, and calculus.',
      image: '/images/sir_portrait.png',
      experience: '12+ Years',
      ranks: '150+ Top Ranks',
      badgeColor: 'bg-indigo-600'
    },
    {
      teacherId: 'TCH-1002',
      name: 'Dr. Nimal Wickramasinghe',
      subject: 'Science & Physics Specialist',
      qualification: 'Ph.D., B.Sc. Physics Special (Hons) - Colombo',
      desc: 'Senior Science & Physics educator covering Junior Secondary Science (Grades 6-9), O/L Science (Grades 10-11), and A/L Physics with visual laboratory concepts.',
      image: '/images/sir_physics.png',
      experience: '14+ Years',
      ranks: '120+ Top Ranks',
      badgeColor: 'bg-blue-600'
    },
    {
      teacherId: 'TCH-1003',
      name: 'Mrs. Anusha Jayawardena',
      subject: 'Primary & Foundation Specialist (Grade 1 - 5)',
      qualification: 'B.Ed. Primary Education, M.A. Linguistics',
      desc: 'Expert educator dedicated to Grade 1 to 5 foundation learning and Grade 5 Scholarship preparation, building strong literacy, numerical, and analytical skills.',
      image: '/images/sir_chemistry.png',
      experience: '10+ Years',
      ranks: '95+ Island Ranks',
      badgeColor: 'bg-emerald-600'
    }
  ];

  const defaultClasses = [
    {
      classId: 'CLS-PRI-101',
      name: 'Grade 1 - 5 Primary & Scholarship Class',
      grade: 'Grade 1 - 5',
      teacherName: 'Mrs. Anusha Jayawardena',
      subject: 'Primary Core Subjects & Scholarship',
      schedule: 'Saturday 8:30 AM - 11:30 AM',
      location: 'Primary Learning Wing & Online Stream',
      fee: 2500,
      description: 'Interactive foundation building in Mathematics, Languages, and Scholarship Exam prep tailored for Grade 1-5 primary students.'
    },
    {
      classId: 'CLS-OL-201',
      name: 'Grade 6 - 11 O/L Core Theory & Revision',
      grade: 'Grade 6 - 11',
      teacherName: 'Eng. Kasun Perera & Science Faculty',
      subject: 'Mathematics, Science, English & ICT',
      schedule: 'Sunday 8:00 AM - 1:00 PM',
      location: 'Main Auditorium & Web Stream',
      fee: 3000,
      isPopular: true,
      description: 'Comprehensive syllabus coverage, monthly term test evaluations, and model paper breakdowns for Junior Secondary and G.C.E. O/L students.'
    },
    {
      classId: 'CLS-AL-301',
      name: 'Grade 12 - 13 A/L Theory & Revision',
      grade: 'Grade 12 - 13 (A/L)',
      teacherName: 'Dr. Nimal Wickramasinghe & A/L Panel',
      subject: 'Science, Commerce, Arts & Tech Streams',
      schedule: 'Wednesday 2:30 PM - 6:30 PM',
      location: 'Physical Exam Hall & Online Stream',
      fee: 3500,
      description: 'In-depth concept delivery, past paper breakdowns, and speed revision sessions for G.C.E. Advanced Level success.'
    }
  ];

  const defaultAchievers = [
    {
      name: 'Kaveen Perera',
      rankBadge: '🏆 A/L Island Rank 01',
      stream: 'G.C.E. A/L Stream',
      zScore: '2.8942',
      district: 'Kandy District',
      image: '/images/top_student_male.png'
    },
    {
      name: 'Shenali Fernando',
      rankBadge: '🌟 O/L 9 A Stars',
      stream: 'G.C.E. O/L Batch',
      zScore: '9 A Passes',
      district: 'Colombo District',
      image: '/images/top_student_female.png'
    },
    {
      name: 'Nipuna Jayasinghe',
      rankBadge: '🥇 Grade 5 Scholarship Top Ranker',
      stream: 'Primary Section (Grade 5)',
      zScore: '196 Marks',
      district: 'Kurunegala',
      image: ''
    },
    {
      name: 'Dilini Ranasinghe',
      rankBadge: '🎖️ A/L District Rank 01',
      stream: 'G.C.E. A/L Stream',
      zScore: '2.7650',
      district: 'Kandy',
      image: ''
    }
  ];

  const defaultFeatures = [
    {
      title: 'Smart QR Attendance',
      desc: 'Instant QR code scanning upon class entry automatically logs attendance and dispatches instant SMS alerts to parents.'
    },
    {
      title: 'Exam Analytics & Ranks',
      desc: 'Instant score dashboards, district-level rank indices, and progress trend graphs available right after evaluation.'
    },
    {
      title: 'HD Lecture Recordings',
      desc: 'On-demand access to high-definition recordings of missed or previous lectures anytime on student portal.'
    },
    {
      title: 'Digital Materials & Tutes',
      desc: 'Downloadable PDF tutes, lesson summaries, past paper marking schemes, and speed revision guides.'
    }
  ];

  const defaultTestimonials = [
    {
      name: 'Kaveen Perera',
      role: 'Engineering Faculty - Moratuwa (2024 A/L)',
      text: '"Combined Maths felt overwhelming until I joined Kasun Sir\'s class. His visual problem-solving techniques gave me immense clarity, leading directly to my Island Rank 01 achievement."'
    },
    {
      name: 'Shenali Fernando',
      role: 'Medical Student - Colombo (2024 A/L)',
      text: '"The Kingswood Connect Student Portal made studying so effortless. Being able to rewatch HD recordings and check paper results instantly boosted my overall Z-Score tremendously."'
    },
    {
      name: 'N. Jayasinghe',
      role: 'Parent of Nipuna (District Rank 01)',
      text: '"As a parent, receiving real-time QR attendance SMS alerts gave us peace of mind. Sir\'s personal dedication and continuous mentorship are truly commendable."'
    }
  ];

  const activeClasses = (cmsSettings?.classes && cmsSettings.classes.length > 0)
    ? cmsSettings.classes
    : (classesList.length > 0 ? classesList : defaultClasses);

  const activeTeachers = (cmsSettings?.teachers && cmsSettings.teachers.length > 0)
    ? cmsSettings.teachers
    : (teachersList.length > 0 ? teachersList : defaultTeachers);

  const activeAchievers = (cmsSettings?.achievers && cmsSettings.achievers.length > 0)
    ? cmsSettings.achievers
    : defaultAchievers;

  const activeFeatures = (cmsSettings?.features && cmsSettings.features.length > 0)
    ? cmsSettings.features
    : defaultFeatures;

  const activeTestimonials = (cmsSettings?.testimonials && cmsSettings.testimonials.length > 0)
    ? cmsSettings.testimonials
    : defaultTestimonials;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-600 selection:text-white relative overflow-hidden">

      {/* Decorative Background Glow Filters */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[400px] right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[1800px] left-10 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs transition-all duration-300">
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
              Our Faculty
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
              Our Faculty
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
                  {cmsSettings?.heroBtn1Text || 'Meet Our Faculty (Sirs)'}
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
                      src={cmsSettings?.heroImage || '/images/sir_lecture.png'}
                      alt="Kingswood Connect Learning Environment"
                      className="w-full h-[420px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
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
      <section id="about-sir" className="py-20 bg-slate-100/70 border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider shadow-xs">
              <School className="w-4 h-4 mr-1 text-indigo-600" />
              {cmsSettings?.facultyBadge || 'MEET OUR PANEL OF EXPERT SIRS'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {cmsSettings?.facultyTitle || 'Distinguished Faculty & Subject Specialists'}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {cmsSettings?.facultySub || "Our institute brings together top Sri Lankan educators dedicated to guiding students from Grade 1 to Grade 13 across all core subjects and academic streams."}
            </p>
          </div>

          {/* Faculty Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {activeTeachers.map((teacher, idx) => {
              const badgeColors = ['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600'];
              const cardBadgeColor = teacher.badgeColor || badgeColors[idx % badgeColors.length];
              const teacherImg = teacher.image || (idx % 2 === 0 ? '/images/sir_portrait.png' : '/images/sir_physics.png');

              return (
                <div key={teacher.teacherId || idx} className="rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden group flex flex-col justify-between">
                  <div>
                    <div 
                      onClick={() => setSelectedTeacherClasses(teacher)}
                      className="relative h-72 overflow-hidden bg-slate-900 cursor-pointer"
                      title="Click to view classes & timetable"
                    >
                      <img
                        src={teacherImg}
                        alt={`${teacher.name} - ${teacher.subject}`}
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

        </div>
      </section>


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

          <div className="grid md:grid-cols-3 gap-8">
            {activeTeachers.map((teacher, idx) => {
              const teacherImg = teacher.image || (idx % 2 === 0 ? '/images/sir_portrait.png' : '/images/sir_physics.png');
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedTeacherVideo(teacher)}
                  className="rounded-3xl bg-slate-950 border border-indigo-900/60 hover:border-indigo-500 overflow-hidden group cursor-pointer transition-all duration-300 shadow-xl hover:-translate-y-1"
                >
                  <div className="relative h-60 overflow-hidden bg-slate-900">
                    <img
                      src={teacherImg}
                      alt={teacher.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/50 group-hover:bg-slate-950/30 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-indigo-600/90 group-hover:bg-indigo-600 text-white flex items-center justify-center shadow-2xl border border-white/30 transform group-hover:scale-110 transition-transform">
                        <Play size={28} className="fill-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                      {teacher.subject}
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{teacher.name}</h3>
                    <p className="text-xs text-indigo-300 font-medium">Lecture Demo & Conceptual Breakdown</p>
                    <div className="pt-2 flex items-center text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                      <Play size={12} className="mr-1.5 fill-indigo-400" /> Watch Video Demo
                    </div>
                  </div>
                </div>
              );
            })}
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
            {activeAchievers.map((ach, idx) => (
              <div key={idx} className="rounded-2xl bg-white border border-slate-200 hover:border-amber-400 p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-xl group">
                <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-900 h-56 flex items-center justify-center">
                  {ach.image ? (
                    <img
                      src={ach.image}
                      alt={ach.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-400/40">
                        <Trophy className="w-8 h-8" />
                      </div>
                      <span className="text-xs text-amber-300 font-extrabold uppercase tracking-wider">{ach.district || 'Top Achiever'}</span>
                    </div>
                  )}
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





      {/* Section 6: Tuition Class Technology & Features */}
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


      {/* Section 7: Student & Parent Testimonials */}
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


      {/* Section 8: Contact Us & Location */}
      <section id="contact" className="py-20 bg-slate-100/90 border-t border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-12 gap-12">

            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider shadow-xs">
                  <Phone className="w-4 h-4 mr-1 text-indigo-600" />
                  {cmsSettings?.contactBadge || 'GET IN TOUCH'}
                </div>
                <h2 className="text-3xl font-black text-slate-900">
                  {cmsSettings?.contactTitle || 'Contact Us & Class Enrollment'}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {cmsSettings?.contactSub || 'Have questions regarding upcoming tuition batches or online class registration? Send us an inquiry or reach out to our hotlines directly.'}
                </p>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start space-x-4 p-5 rounded-2xl bg-white border border-emerald-300 shadow-md hover:border-emerald-500 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <MessageSquare className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-base text-slate-900">WhatsApp Official Support</h4>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        INSTANT CHAT
                      </span>
                    </div>
                    <p className="text-sm font-black text-emerald-700 mt-1">
                      {cmsSettings?.whatsapp || '+94 77 123 4567'}
                    </p>
                    <button
                      onClick={handleWhatsAppInquiry}
                      type="button"
                      className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold mt-3 shadow-sm transition-colors"
                    >
                      Click to Join / Chat on WhatsApp <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl relative">

                <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <MessageSquare className="text-emerald-600" size={22} /> Send an Instant WhatsApp Inquiry
                </h3>
                <p className="text-xs text-slate-600 mb-6">Fill out your details below to send your inquiry directly to our team via WhatsApp.</p>

                <form onSubmit={handleWhatsAppInquiry} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Kaveen Perera"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0771234567"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Select Grade / Batch</label>
                      <select
                        value={formData.batch}
                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subject Preference</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Message</label>
                    <textarea
                      rows="3"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write any specific questions or details you would like to know..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
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

        </div>
      </section>


      {/* Footer */}
      <footer className="bg-indigo-950 border-t border-indigo-900 py-12 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/60 border border-indigo-400/20">
                <span className="text-white font-black text-sm tracking-tighter">KC</span>
              </div>
              <span className="text-base font-extrabold text-white">Kingswood Connect</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-indigo-200 font-semibold">
              <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => scrollToSection('about-sir')} className="hover:text-white transition-colors">Our Faculty</button>
              <button onClick={() => scrollToSection('vision-mission')} className="hover:text-white transition-colors">Vision & Mission</button>
              <button onClick={() => scrollToSection('results')} className="hover:text-white transition-colors">Results</button>
              <Link to="/login" className="text-blue-400 font-bold hover:underline">Portal Log In</Link>
            </div>

            <p className="text-indigo-300/80">© {new Date().getFullYear()} Kingswood Connect. All Rights Reserved.</p>

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
                const matched = activeClasses.filter(c => 
                  (c.teacherName && c.teacherName.toLowerCase().includes(selectedTeacherClasses.name.toLowerCase())) ||
                  (c.name && c.name.toLowerCase().includes(selectedTeacherClasses.subject?.toLowerCase() || ''))
                );
                const displayClasses = matched.length > 0 ? matched : [
                  {
                    name: `2026 A/L ${selectedTeacherClasses.subject || 'Theory'} Class`,
                    grade: '2026 A/L',
                    schedule: 'Saturday 8:00 AM - 1:00 PM',
                    location: 'Kandy Main Auditorium & Online Live Stream',
                    fee: 'Rs. 3,500',
                    description: `Building fundamental concepts from scratch with weekly tute discussions, real-world examples, and problem solving conducted by ${selectedTeacherClasses.name}.`
                  },
                  {
                    name: `2025 A/L ${selectedTeacherClasses.subject || 'Revision'} & Paper Class`,
                    grade: '2025 A/L',
                    schedule: 'Sunday 8:00 AM - 1:30 PM',
                    location: 'Kandy Main Auditorium & Web Stream',
                    fee: 'Rs. 3,500',
                    description: `Rapid syllabus coverage, past paper breakdowns, and high-yield exam strategies designed for top scores by ${selectedTeacherClasses.name}.`
                  }
                ];

                return displayClasses.map((cls, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:border-indigo-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                        {cls.grade || 'A/L Batch'}
                      </span>
                      <span className="text-xs font-extrabold text-indigo-700">
                        {typeof cls.fee === 'number' ? `Rs. ${cls.fee.toLocaleString()}` : (cls.fee || 'Rs. 3,500')}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">{cls.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{cls.description}</p>
                    <div className="pt-3 border-t border-slate-100 grid sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-600 shrink-0" />
                        <span>{cls.schedule || 'Weekly Class'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-indigo-600 shrink-0" />
                        <span>{cls.location || 'Auditorium & Stream'}</span>
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
