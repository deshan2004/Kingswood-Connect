import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Check
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    batch: '2026 A/L',
    subject: 'Combined Mathematics',
    message: ''
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', phone: '', batch: '2026 A/L', subject: 'Combined Mathematics', message: '' });
    }, 4000);
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">

      {/* Decorative Background Glow Filters */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[400px] right-10 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-[1800px] left-10 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight">
                Kingswood Connect
              </span>
              <span className="block text-[11px] font-medium text-indigo-400 tracking-wider uppercase">
                Premier Educational Institute
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('about-sir')} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              About Sir
            </button>
            <button onClick={() => scrollToSection('vision-mission')} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Vision & Mission
            </button>
            <button onClick={() => scrollToSection('results')} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Exam Results
            </button>
            <button onClick={() => scrollToSection('courses')} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Courses
            </button>
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              LMS Features
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors">
              Contact Us
            </button>
          </nav>

          {/* Login Action Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <LogIn className="w-4 h-4 mr-2" />
              LMS Portal Access
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
            <button 
              onClick={() => scrollToSection('home')} 
              className="block w-full text-left py-2 px-3 text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-indigo-400 rounded-lg"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about-sir')} 
              className="block w-full text-left py-2 px-3 text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-indigo-400 rounded-lg"
            >
              About Sir
            </button>
            <button 
              onClick={() => scrollToSection('vision-mission')} 
              className="block w-full text-left py-2 px-3 text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-indigo-400 rounded-lg"
            >
              Vision & Mission
            </button>
            <button 
              onClick={() => scrollToSection('results')} 
              className="block w-full text-left py-2 px-3 text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-indigo-400 rounded-lg"
            >
              Exam Results
            </button>
            <button 
              onClick={() => scrollToSection('courses')} 
              className="block w-full text-left py-2 px-3 text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-indigo-400 rounded-lg"
            >
              Courses & Schedule
            </button>
            <button 
              onClick={() => scrollToSection('features')} 
              className="block w-full text-left py-2 px-3 text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-indigo-400 rounded-lg"
            >
              LMS Features
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="block w-full text-left py-2 px-3 text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-indigo-400 rounded-lg"
            >
              Contact Us
            </button>
            <div className="pt-2">
              <Link 
                to="/login"
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
              >
                <LogIn className="w-5 h-5 mr-2" />
                LMS Portal Log In
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
              
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>🏆 Premier A/L Physics & Combined Maths Institute</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight">
                Empowering Academic Excellence & <br className="hidden sm:inline" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
                  Future Leaders
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Master G.C.E. Advanced Level Physics & Combined Mathematics with deep conceptual clarity, structured learning, real-time analytics, and island-top rankers' guidance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => scrollToSection('about-sir')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <Users className="w-5 h-5 mr-2" />
                  About Sir
                </button>

                <button
                  onClick={() => scrollToSection('results')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center"
                >
                  <Award className="w-5 h-5 mr-2 text-amber-400" />
                  View Exam Results
                </button>
              </div>

              {/* Stat Highlights Grid */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-extrabold text-white">150+</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Island Ranks</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-400">98%</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">A/B Grade Pass Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white">5,000+</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Active Students</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-emerald-400">12+ Years</div>
                  <div className="text-xs text-slate-400 mt-1 font-medium">Academic Mastery</div>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Graphic Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Graphic Container with Glow */}
                <div className="relative rounded-3xl overflow-hidden p-2 bg-gradient-to-tr from-indigo-500 via-sky-500 to-violet-500 shadow-2xl shadow-indigo-500/20">
                  <div className="rounded-2xl overflow-hidden bg-slate-950 relative">
                    <img 
                      src="/images/sir_lecture.png" 
                      alt="Eng. Kasun Perera conducting interactive lecture" 
                      className="w-full h-[420px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl backdrop-blur-md bg-slate-900/80 border border-slate-700/60 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Advanced Learning Environment</p>
                          <p className="text-sm font-bold text-white mt-0.5">Conceptual Understanding & Digital Pedagogy</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-amber-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 1 */}
                <div className="absolute -top-6 -left-6 bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">#1 Rated Institute</div>
                    <div className="text-xs text-slate-400">Auditorium & Online LMS</div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -bottom-6 -right-6 bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-xl flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Real-Time Attendance</div>
                    <div className="text-xs text-slate-400">Instant Parent SMS</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Section 2: Teacher Profile & Sir's Photo (About Sir) */}
      <section id="about-sir" className="py-20 bg-slate-950/60 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <School className="w-4 h-4 mr-1" />
              MEET YOUR LEAD EDUCATOR
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Eng. Kasun Perera <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-400">(Senior Lecturer)</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              With over 12 years of teaching excellence, Eng. Kasun Perera has guided thousands of high school students to top university admissions and prestigious national ranks.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Sir's Photo Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur-2xl opacity-20 transform -rotate-3" />
                
                <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
                  <img 
                    src="/images/sir_portrait.png" 
                    alt="Eng. Kasun Perera - Senior Lecturer"
                    className="w-full h-[480px] object-cover object-top hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-6 bg-slate-900/95 border-t border-slate-800">
                    <h3 className="text-xl font-bold text-white">Eng. Kasun Perera</h3>
                    <p className="text-sm text-indigo-400 font-medium">B.Sc. Engineering (Hons) - University of Peradeniya</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                      <span>12+ Years Experience</span>
                      <span className="text-emerald-400 font-semibold">150+ Island Ranks Produced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sir's Credentials & Academic Philosophy */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <GraduationCap className="w-6 h-6 mr-3 text-indigo-400" />
                  Academic Excellence & Background
                </h3>
                <p className="text-slate-300 leading-relaxed text-base">
                  Graduating with First Class Honors from the Faculty of Engineering, University of Peradeniya, Eng. Kasun Perera is renowned across Sri Lanka for transforming how students learn Combined Mathematics and Physics. His structured methodology bridges complex theoretical concepts with intuitive problem-solving strategies.
                </p>
              </div>

              {/* Key Strengths Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    01
                  </div>
                  <h4 className="text-base font-bold text-white">Conceptual Mastery</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Replacing rote memorization with deep conceptual intuition, clean visual diagrams, and practical applications.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                    02
                  </div>
                  <h4 className="text-base font-bold text-white">Weekly Model Papers</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Curated exam-oriented papers with instant score analytics, district ranks, and step-by-step marking discussions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    03
                  </div>
                  <h4 className="text-base font-bold text-white">Personalized Mentorship</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Identifying student weaknesses early to build customized recovery plans and individualized attention.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    04
                  </div>
                  <h4 className="text-base font-bold text-white">Kingswood LMS Platform</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Seamless 24/7 access to HD video recordings, quiz preparations, tutes, and smart QR attendance logs.
                  </p>
                </div>
              </div>

              {/* Quote Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 relative">
                <p className="text-indigo-200 italic font-medium text-sm sm:text-base">
                  "Our mission goes beyond preparing students for exams — we cultivate scientific thinking, analytical intelligence, and unwavering confidence that lasts a lifetime."
                </p>
                <div className="mt-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  — Eng. Kasun Perera
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* Section 3: Vision & Mission */}
      <section id="vision-mission" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-4 h-4 mr-1" />
              OUR CORE PURPOSE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Vision & <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">Mission</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Every initiative at Kingswood Connect is guided by an unyielding commitment to student transformation and academic integrity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Vision Card */}
            <div className="relative group rounded-3xl p-8 bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
              
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-indigo-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                Our Vision <span className="text-sm font-normal text-indigo-400 ml-2 uppercase tracking-wide">(Future Outlook)</span>
              </h3>

              <p className="text-slate-300 leading-relaxed text-base">
                To become Sri Lanka's benchmark educational institute, empowering a generation of analytical thinkers, problem solvers, and visionary leaders who excel in G.C.E. Advanced Level examinations and lead future frontiers in engineering, medicine, and technology.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center space-x-3 text-sm text-indigo-300 font-medium">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <span>Pioneering Innovation & Educational Integrity</span>
              </div>
            </div>

            {/* Mission Card */}
            <div className="relative group rounded-3xl p-8 bg-slate-900/90 border border-slate-800 hover:border-violet-500/50 transition-all duration-300 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
              
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 flex items-center">
                Our Mission <span className="text-sm font-normal text-violet-400 ml-2 uppercase tracking-wide">(Daily Commitment)</span>
              </h3>

              <p className="text-slate-300 leading-relaxed text-base">
                To unlock every student's highest potential by combining modern digital technology, rigorous paper series, clear concept delivery, and individual mentorship that guarantee outstanding Z-Scores and Island Ranks.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center space-x-3 text-sm text-violet-300 font-medium">
                <CheckCircle2 className="w-5 h-5 text-violet-400" />
                <span>Continuous Guidance & Uncompromising Quality</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* Section 4: Exam Results & Top Achievers */}
      <section id="results" className="py-20 bg-slate-950/70 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4 mr-1" />
              PROVEN EXCELLENCE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Celebrating Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">Top Island Rankers</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              True success is measured by consistent results. Highlighting our outstanding performers in recent G.C.E. A/L examinations.
            </p>
          </div>

          {/* Rank Showcase Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Achiever 1 */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-950 h-56">
                <img 
                  src="/images/top_student_male.png" 
                  alt="Kaveen Perera - Island Rank 01"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                  🏆 Island Rank 01
                </div>
              </div>
              <h3 className="text-lg font-bold text-white">Kaveen Perera</h3>
              <p className="text-xs text-indigo-400 font-medium">Combined Mathematics (Physical Science)</p>
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
                <span>Z-Score: <strong className="text-amber-400">2.8942</strong></span>
                <span className="text-slate-400">Kandy District</span>
              </div>
            </div>

            {/* Achiever 2 */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-950 h-56">
                <img 
                  src="/images/top_student_female.png" 
                  alt="Shenali Fernando - Island Rank 04"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-indigo-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                  🌟 Island Rank 04
                </div>
              </div>
              <h3 className="text-lg font-bold text-white">Shenali Fernando</h3>
              <p className="text-xs text-indigo-400 font-medium">Physics & Chemistry</p>
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
                <span>Z-Score: <strong className="text-indigo-400">2.8105</strong></span>
                <span className="text-slate-400">Colombo District</span>
              </div>
            </div>

            {/* Achiever 3 */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-950 h-56 flex items-center justify-center bg-gradient-to-b from-indigo-900/30 to-slate-950">
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-2 border border-sky-500/40">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <span className="text-xs text-sky-300 font-bold uppercase tracking-wider">District Champion</span>
                </div>
                <div className="absolute top-3 left-3 bg-sky-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                  🥇 District Rank 01
                </div>
              </div>
              <h3 className="text-lg font-bold text-white">Nipuna Jayasinghe</h3>
              <p className="text-xs text-indigo-400 font-medium">Combined Mathematics</p>
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
                <span>Z-Score: <strong className="text-sky-400">2.7840</strong></span>
                <span className="text-slate-400">Kurunegala</span>
              </div>
            </div>

            {/* Achiever 4 */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-lg group">
              <div className="relative rounded-xl overflow-hidden mb-4 bg-slate-950 h-56 flex items-center justify-center bg-gradient-to-b from-violet-900/30 to-slate-950">
                <div className="text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-2 border border-violet-500/40">
                    <Award className="w-8 h-8" />
                  </div>
                  <span className="text-xs text-violet-300 font-bold uppercase tracking-wider">Island Top 15</span>
                </div>
                <div className="absolute top-3 left-3 bg-violet-500 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                  🎖️ Island Rank 12
                </div>
              </div>
              <h3 className="text-lg font-bold text-white">Dilini Ranasinghe</h3>
              <p className="text-xs text-indigo-400 font-medium">Physics & Combined Maths</p>
              <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-300">
                <span>Z-Score: <strong className="text-violet-400">2.7650</strong></span>
                <span className="text-slate-400">Kandy</span>
              </div>
            </div>

          </div>

          {/* Call-to-action Banner */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-white">Be the Next A/L Success Story!</h3>
              <p className="text-sm text-slate-300">Enroll today and gain instant access to Kingswood Connect LMS video portal, tutes, and exam schedules.</p>
            </div>
            <Link 
              to="/login"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm whitespace-nowrap shadow-lg shadow-indigo-600/30 transition-all"
            >
              Access Student Portal
            </Link>
          </div>

        </div>
      </section>


      {/* Section 5: Courses & Class Schedule */}
      <section id="courses" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 mr-1" />
              ACADEMIC PROGRAMMING
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Courses & <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">Class Schedule</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Flexible physical auditorium lectures in Kandy coupled with HD live stream options for remote learners.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Course 1 */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-xl group">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-4">
                  2026 A/L Batch
                </div>
                <h3 className="text-xl font-bold text-white mb-2">2026 A/L Theory Class</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Building fundamental concepts from scratch with weekly tute discussions, real-world examples, and problem solving.
                </p>
                <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>Every Saturday</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>8:00 AM - 1:00 PM</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>Kandy Auditorium & HD LMS Live</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-semibold text-xs transition-colors flex items-center justify-center"
                >
                  Register Now <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Course 2 */}
            <div className="rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 flex flex-col justify-between hover:border-indigo-400 transition-all shadow-2xl relative group">
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                POPULAR
              </div>
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold mb-4">
                  2025 A/L Batch
                </div>
                <h3 className="text-xl font-bold text-white mb-2">2025 A/L Revision & Theory</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Rapid syllabus coverage, past paper breakdowns, and high-yield exam strategies designed for top scores.
                </p>
                <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-violet-400" />
                    <span>Every Sunday</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-violet-400" />
                    <span>8:00 AM - 1:30 PM</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-violet-400" />
                    <span>Kandy Main Auditorium & Web Portal</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center shadow-lg shadow-indigo-600/30"
                >
                  Register Now <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Course 3 */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-sky-500/50 transition-all shadow-xl group">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold mb-4">
                  Exam Focused
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Paper Class & Speed Revision</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Timed exam condition practice, instant mark distribution analysis, and detailed marking scheme breakdowns.
                </p>
                <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-sky-400" />
                    <span>Every Wednesday</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-sky-400" />
                    <span>2:30 PM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-sky-400" />
                    <span>Physical Exam Hall & Online Submissions</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800">
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-sky-600 text-white font-semibold text-xs transition-colors flex items-center justify-center"
                >
                  Register Now <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* Section 6: Kingswood LMS Ecosystem Features */}
      <section id="features" className="py-20 bg-slate-950/80 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4 mr-1" />
              DIGITAL LEARNING ECOSYSTEM
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Cutting-Edge <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">Technology Features</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Engineered specifically to maximize student productivity and keep parents informed in real-time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Smart QR Attendance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant QR code scanning upon class entry automatically logs attendance and dispatches instant SMS alerts to parents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Exam Analytics & Ranks</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant score dashboards, district-level rank indices, and progress trend graphs available right after evaluation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">HD Class Recordings</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                On-demand access to high-definition recordings of missed or previous lectures anytime on student dashboards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Digital Materials & Notes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Downloadable PDF tutes, lesson summaries, past paper marking schemes, and speed revision guides.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* Section 7: Student & Parent Testimonials */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 mr-1" />
              STUDENT & PARENT REVIEWS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Trusted by <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-300">Thousands</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                "Combined Maths felt overwhelming until I joined Kasun Sir's class. His visual problem-solving techniques gave me immense clarity, leading directly to my Island Rank 01 achievement."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">Kaveen Perera</span>
                  <span className="text-slate-400">Engineering Faculty - Moratuwa</span>
                </div>
                <span className="text-indigo-400 font-semibold">2024 A/L</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                "The Kingswood Connect LMS made studying so effortless. Being able to rewatch HD recordings and check paper results instantly boosted my overall Z-Score tremendously."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">Shenali Fernando</span>
                  <span className="text-slate-400">Medical Student - Colombo</span>
                </div>
                <span className="text-indigo-400 font-semibold">2024 A/L</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
                "As a parent, receiving real-time QR attendance SMS alerts gave us peace of mind. Sir's personal dedication and continuous mentorship are truly commendable."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">N. Jayasinghe</span>
                  <span className="text-slate-400">Parent of Nipuna (District Rank 01)</span>
                </div>
                <span className="text-indigo-400 font-semibold">Parent Review</span>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* Section 8: Contact Us & Location */}
      <section id="contact" className="py-20 bg-slate-950/90 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                  <Phone className="w-4 h-4 mr-1" />
                  GET IN TOUCH
                </div>
                <h2 className="text-3xl font-extrabold text-white">
                  Contact Us & <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Enrollment</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Have questions regarding upcoming batches or online LMS registration? Send us an inquiry or reach out to our hotlines directly.
                </p>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <MapPin className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Class Location & Auditorium</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Kingswood Education Complex, Peradeniya Road, Kandy, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <Phone className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Inquiry Hotlines</h4>
                    <p className="text-xs text-slate-400 mt-0.5">+94 81 222 3456 / +94 77 123 4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <Mail className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Official Email</h4>
                    <p className="text-xs text-slate-400 mt-0.5">info@kingswoodconnect.lk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
                
                <h3 className="text-xl font-bold text-white mb-2">Send an Instant Inquiry</h3>
                <p className="text-xs text-slate-400 mb-6">Fill out your details below and our counseling team will get back to you within 24 hours.</p>

                {contactSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center space-y-2">
                    <Check className="w-10 h-10 mx-auto text-emerald-400" />
                    <h4 className="font-bold text-lg text-white">Inquiry Sent Successfully!</h4>
                    <p className="text-xs text-slate-300">Thank you for reaching out. Our team will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. Kaveen Perera" 
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp / Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="0771234567" 
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">A/L Batch</label>
                        <select 
                          value={formData.batch}
                          onChange={(e) => setFormData({...formData, batch: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                        >
                          <option value="2026 A/L">2026 A/L Theory</option>
                          <option value="2025 A/L">2025 A/L Revision</option>
                          <option value="Paper Class">Paper Class</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Preference</label>
                        <select 
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-sm"
                        >
                          <option value="Combined Mathematics">Combined Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Both Subjects">Both Subjects</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Your Message</label>
                      <textarea 
                        rows="3" 
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Write any specific questions or details you would like to know..." 
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Inquiry
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white">Kingswood Connect</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-slate-400 font-medium">
              <button onClick={() => scrollToSection('home')} className="hover:text-indigo-400 transition-colors">Home</button>
              <button onClick={() => scrollToSection('about-sir')} className="hover:text-indigo-400 transition-colors">About Sir</button>
              <button onClick={() => scrollToSection('vision-mission')} className="hover:text-indigo-400 transition-colors">Vision & Mission</button>
              <button onClick={() => scrollToSection('results')} className="hover:text-indigo-400 transition-colors">Results</button>
              <button onClick={() => scrollToSection('courses')} className="hover:text-indigo-400 transition-colors">Courses</button>
              <Link to="/login" className="text-indigo-400 font-semibold hover:underline">LMS Portal Log In</Link>
            </div>

            <p>© {new Date().getFullYear()} Kingswood Connect. All Rights Reserved.</p>

          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
