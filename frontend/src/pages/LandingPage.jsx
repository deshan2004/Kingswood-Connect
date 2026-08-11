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
  UserCheck
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Dynamic Admin Panel Data State
  const [classesList, setClassesList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [cmsSettings, setCmsSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    batch: '2026 A/L',
    subject: 'Combined Mathematics',
    message: ''
  });

  useEffect(() => {
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
    fetchAdminData();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', phone: '', batch: '2026 A/L', subject: 'Combined Mathematics', message: '' });
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

    const text = `Hello Kingswood Connect! 👋\n\nI would like to inquire / join tuition classes:\n• *Name:* ${name}\n• *Phone:* ${phone}\n• *Class/Batch:* ${batch}\n• *Subject:* ${subject}${msg ? `\n• *Message:* ${msg}` : ''}`;

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
      subject: 'Combined Mathematics',
      qualification: 'B.Sc. Engineering (Hons) - Peradeniya',
      desc: 'Graduating with First Class Honors from Peradeniya Engineering, Eng. Kasun Perera is renowned for simplifying complex calculus, vectors, and mechanics into intuitive visual concepts.',
      image: '/images/sir_portrait.png',
      experience: '12+ Years',
      ranks: '150+ Ranks',
      badgeColor: 'bg-indigo-600'
    },
    {
      teacherId: 'TCH-1002',
      name: 'Dr. Nimal Wickramasinghe',
      subject: 'Physics Specialist',
      qualification: 'Ph.D., B.Sc. Physics Special (Hons) - Colombo',
      desc: 'Senior Physics lecturer specializing in theoretical mechanics, waves, and electronics. Known for visual lab experiments and analytical paper techniques.',
      image: '/images/sir_physics.png',
      experience: '14+ Years',
      ranks: '120+ Ranks',
      badgeColor: 'bg-blue-600'
    },
    {
      teacherId: 'TCH-1003',
      name: 'Eng. Chamara Rathnayake',
      subject: 'Chemistry Specialist',
      qualification: 'B.Sc. Eng., M.Sc. Industrial Chemistry',
      desc: 'Master educator in Organic, Inorganic & Physical Chemistry. Simplifies reaction pathways using logical flowcharts and high-yield memory techniques.',
      image: '/images/sir_chemistry.png',
      experience: '10+ Years',
      ranks: '95+ Ranks',
      badgeColor: 'bg-emerald-600'
    }
  ];

  const defaultClasses = [
    {
      classId: 'CLS-2026-M',
      name: '2026 A/L Theory Class',
      grade: '2026 A/L',
      teacherName: 'Eng. Kasun Perera',
      subject: 'Combined Mathematics',
      schedule: 'Saturday 8:00 AM - 1:00 PM',
      location: 'Kandy Main Auditorium & Online Live Stream',
      fee: 3500,
      description: 'Building fundamental concepts from scratch with weekly tute discussions, real-world examples, and problem solving.'
    },
    {
      classId: 'CLS-2025-P',
      name: '2025 A/L Revision & Theory',
      grade: '2025 A/L',
      teacherName: 'Dr. Nimal Wickramasinghe',
      subject: 'Physics',
      schedule: 'Sunday 8:00 AM - 1:30 PM',
      location: 'Kandy Main Auditorium & Web Stream',
      fee: 3500,
      isPopular: true,
      description: 'Rapid syllabus coverage, past paper breakdowns, and high-yield exam strategies designed for top scores.'
    },
    {
      classId: 'CLS-PAPER-C',
      name: 'Paper Class & Speed Revision',
      grade: 'Exam Focused',
      teacherName: 'Eng. Chamara Rathnayake',
      subject: 'Paper Class',
      schedule: 'Wednesday 2:30 PM - 6:00 PM',
      location: 'Physical Exam Hall & Online Submissions',
      fee: 2500,
      description: 'Timed exam condition practice, instant mark distribution analysis, and detailed marking scheme breakdowns.'
    }
  ];

  const defaultAchievers = [
    {
      name: 'Kaveen Perera',
      rankBadge: '🏆 Island Rank 01',
      stream: 'Combined Mathematics (Physical Science)',
      zScore: '2.8942',
      district: 'Kandy District',
      image: '/images/top_student_male.png'
    },
    {
      name: 'Shenali Fernando',
      rankBadge: '🌟 Island Rank 04',
      stream: 'Physics & Chemistry',
      zScore: '2.8105',
      district: 'Colombo District',
      image: '/images/top_student_female.png'
    },
    {
      name: 'Nipuna Jayasinghe',
      rankBadge: '🥇 District Rank 01',
      stream: 'Combined Mathematics',
      zScore: '2.7840',
      district: 'Kurunegala',
      image: ''
    },
    {
      name: 'Dilini Ranasinghe',
      rankBadge: '🎖️ Island Rank 12',
      stream: 'Physics & Combined Maths',
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
            <button onClick={() => scrollToSection('vision-mission')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Vision & Mission
            </button>
            <button onClick={() => scrollToSection('results')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Exam Results
            </button>
            <button onClick={() => scrollToSection('classes')} className="px-3 py-2 rounded-xl text-xs xl:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-all">
              Classes
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
              About Sir
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
              onClick={() => scrollToSection('classes')}
              className="block w-full text-left py-2 px-3 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"
            >
              Classes & Schedule
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
                <span>{cmsSettings?.heroTagline || '🏆 Premier A/L Physics & Combined Maths Institute'}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
                {cmsSettings?.heroTitleLine1 || 'Empowering Academic Excellence &'}{' '}
                <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 via-indigo-600 to-blue-600">
                  {cmsSettings?.heroTitleGradient || 'Future Leaders'}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {cmsSettings?.heroSubtitle || "Master G.C.E. Advanced Level Physics & Combined Mathematics with deep conceptual clarity, structured tuition classes, real-time attendance, and island-top rankers' guidance."}
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
              {cmsSettings?.facultySub || "Our institute brings together Sri Lanka's top-tier lecturers, engineers, and scientists dedicated to producing island ranks in A/L Science & Mathematics streams."}
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
                    <div className="relative h-72 overflow-hidden bg-slate-900">
                      <img
                        src={teacherImg}
                        alt={`${teacher.name} - ${teacher.subject}`}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute top-3 right-3 ${cardBadgeColor} backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md border border-white/20`}>
                        {teacher.subject || 'Specialist'}
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

                  <div className="p-6 pt-0">
                    <button
                      onClick={() => scrollToSection('classes')}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs transition-colors flex items-center justify-center shadow-xs"
                    >
                      View Classes <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
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
                {cmsSettings?.visionText || "To become Sri Lanka's benchmark educational institute, empowering a generation of analytical thinkers, problem solvers, and visionary leaders who excel in G.C.E. Advanced Level examinations and lead future frontiers in engineering, medicine, and technology."}
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
                {cmsSettings?.missionText || "To unlock every student's highest potential by combining modern digital technology, rigorous paper series, clear concept delivery, and individual mentorship that guarantee outstanding Z-Scores and Island Ranks."}
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


      {/* Section 5: Classes & Schedule */}
      <section id="classes" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider shadow-xs">
              <BookOpen className="w-4 h-4 mr-1 text-indigo-600" />
              {cmsSettings?.classesBadge || 'TUITION CLASSES & SCHEDULE'}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {cmsSettings?.classesTitle || 'Our Classes & Schedule'}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {cmsSettings?.classesSub || 'Explore our active auditorium & online live tuition classes managed directly by institute administration.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {activeClasses.map((cls, idx) => {
              const isPopularClass = cls.isPopular || idx === 1;
              const formattedFee = typeof cls.fee === 'number' ? `Rs. ${cls.fee.toLocaleString()}` : (cls.fee || 'Rs. 3,500');

              return (
                <div
                  key={cls.classId || idx}
                  className={`rounded-3xl bg-white p-6 flex flex-col justify-between transition-all relative group ${isPopularClass
                      ? 'border-2 border-indigo-600 shadow-xl'
                      : 'border border-slate-200/90 shadow-md hover:shadow-xl hover:border-indigo-300'
                    }`}
                >
                  {isPopularClass && (
                    <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                      POPULAR
                    </div>
                  )}

                  <div>
                    <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-4 border border-indigo-100">
                      {cls.grade || 'A/L Batch'}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">{cls.name}</h3>

                    {cls.teacherName && (
                      <p className="text-xs text-indigo-600 font-bold mb-3 flex items-center">
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        Lecturer: {cls.teacherName}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                      {cls.description || `Comprehensive syllabus coverage, tute discussions, and exam paper evaluation conducted by ${cls.teacherName || 'expert sirs'}.`}
                    </p>

                    <div className="space-y-3 text-xs text-slate-700 border-t border-slate-200 pt-4 font-medium">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-indigo-600 shrink-0" />
                        <span>Schedule: <strong className="text-slate-900">{cls.schedule || 'Weekly Class'}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-indigo-600 shrink-0" />
                        <span>Venue: <strong className="text-slate-900">{cls.location || 'Kandy Auditorium & Live Stream'}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-indigo-600 shrink-0" />
                        <span>Class Fee: <strong className="text-indigo-700 font-extrabold">{formattedFee}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => scrollToSection('contact')}
                      className={`w-full py-2.5 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center ${isPopularClass
                          ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 hover:bg-indigo-600'
                        }`}
                    >
                      Register Now <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <MapPin className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900">Class Location & Auditorium</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{cmsSettings?.address || 'Kingswood Education Complex, Peradeniya Road, Kandy, Sri Lanka'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <Phone className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900">Inquiry Hotlines</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{cmsSettings?.phone || '+94 81 222 3456 / +94 77 123 4567'}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white border border-emerald-200/90 shadow-sm hover:border-emerald-400 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">WhatsApp Official Support</h4>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        INSTANT CHAT
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {cmsSettings?.whatsapp || '+94 77 123 4567'}
                    </p>
                    <button
                      onClick={handleWhatsAppInquiry}
                      type="button"
                      className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2 hover:underline focus:outline-none"
                    >
                      Click to Join / Chat on WhatsApp <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl relative">

                <h3 className="text-xl font-bold text-slate-900 mb-2">Send an Instant Inquiry</h3>
                <p className="text-xs text-slate-600 mb-6">Fill out your details below to submit or join directly via WhatsApp.</p>

                {contactSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2">
                    <Check className="w-10 h-10 mx-auto text-emerald-600" />
                    <h4 className="font-bold text-lg text-slate-900">Inquiry Sent Successfully!</h4>
                    <p className="text-xs text-slate-700">Thank you for reaching out. Our counseling team will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Kaveen Perera"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
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
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Select Tuition Class</label>
                        <select
                          value={formData.batch}
                          onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
                        >
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
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
                        >
                          <option value="Combined Mathematics">Combined Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Both Subjects">Both Subjects</option>
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
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white text-base sm:text-sm font-medium transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center"
                      >
                        <Send className="w-4 h-4 mr-2 text-indigo-100" />
                        Submit Inquiry
                      </button>

                      <button
                        type="button"
                        onClick={handleWhatsAppInquiry}
                        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center"
                      >
                        <MessageSquare className="w-4 h-4 mr-2 text-emerald-100" />
                        Join / Chat on WhatsApp
                      </button>
                    </div>
                  </form>
                )}

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
              <button onClick={() => scrollToSection('about-sir')} className="hover:text-white transition-colors">About Sir</button>
              <button onClick={() => scrollToSection('vision-mission')} className="hover:text-white transition-colors">Vision & Mission</button>
              <button onClick={() => scrollToSection('results')} className="hover:text-white transition-colors">Results</button>
              <button onClick={() => scrollToSection('classes')} className="hover:text-white transition-colors">Classes</button>
              <Link to="/login" className="text-blue-400 font-bold hover:underline">Portal Log In</Link>
            </div>

            <p className="text-indigo-300/80">© {new Date().getFullYear()} Kingswood Connect. All Rights Reserved.</p>

          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
