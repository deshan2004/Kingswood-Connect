import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Shield, Key, Mail, UserCheck, Layout, Save, CheckCircle2, AlertCircle, 
  Phone, MapPin, Sparkles, Trophy, Compass, Globe, Plus, Trash2, BookOpen, 
  Users, Award, Zap, MessageSquare, ChevronDown, ChevronUp, Upload, Loader2, Edit, X
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import ChangePassword from '../components/ChangePassword';
import TrashBin from './TrashBin';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const DEFAULT_WA_TEMPLATES = {
  admissionPassTemplate: `🎓 *KINGSWOOD EDUCATION CENTER STUDENT ADMISSION PASS*
Dear {student_name}, welcome to Kingswood Education Center Education!

🔐 *STUDENT PORTAL LOGIN DETAILS*
> 🆔 *Student ID:* \`{student_id}\`
> 📧 *Username:* \`{username}\`
> 🔒 *Password:* \`{password}\`

🌐 *Direct One-Tap Login Portal:*
{login_link}

📱 *YOUR ATTENDANCE QR CODE PASS*
> 📌 *QR Link:* {qr_link}

💡 _Note: Please save your QR Code pass to your photo gallery. Show this QR code to mark attendance at every class session._
───────────────────────────
🏛 *Kingswood Education Center Student Management System*`,

  paymentReceiptTemplate: `🎓 *KINGSWOOD EDUCATION CENTER OFFICIAL RECEIPT*
Dear {student_name},

Here is your official payment receipt details:

📌 *PAYMENT DETAILS*
> 🔢 *Receipt No:* *{receipt_no}*
> 📚 *Class Name:* *{class_name}*
> 🗓️ *Fee Type:* *{fee_type}*
> 💰 *Amount Paid:* *Rs. {amount}*
> 📅 *Date:* *{date}*

Thank you for your payment!
───────────────────────────
🏛 *Kingswood Education Center Finance Team*`,

  paymentReminderTemplate: `📢 *FEE PAYMENT REMINDER*
───────────────────────────
🏛 *Kingswood Education Center*

Hello *{student_name}*,

This is a gentle reminder regarding your pending class fee.

📌 *REMINDER DETAILS*
> 📚 *Fee Month:* *{fee_month}*
> ⚠️ *Status:* Pending Payment

Please complete your payment during your next class session. If you have already completed the payment, kindly ignore this message.

Thank you for your cooperation!
───────────────────────────
🏛 *Kingswood Education Center Finance Team*`,

  attendanceWarningTemplate: `📢 *ATTENDANCE WARNING NOTICE*
───────────────────────────
🏛 *Kingswood Education Center*

📊 *ATTENDANCE REPORT*
> 👤 *Student:* *{student_name}*
> 📚 *Class:* *{class_name}*
> 📅 *Month:* *{month}*
> 📉 *Attendance Rate:* *{attendance_rate}%*

⚠️ *Notice:* Attendance for this period is below the required attendance threshold. Please ensure regular attendance for upcoming sessions.

If you have any questions, feel free to contact the institute administration.
───────────────────────────
🏛 *Kingswood Education Center Student Support*`
};

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileSizeMb, setFileSizeMb] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Video file size exceeds 50MB limit. Please select a video clip under 50MB or paste a YouTube / Vimeo link.');
      return;
    }

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeMb(sizeInMb);
    setIsUploading(true);
    setUploadProgress(15);

    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 45);
        setUploadProgress(percent);
      }
    };

    reader.onloadend = async () => {
      const base64Data = reader.result;
      setUploadProgress(60);

      try {
        const response = await axios.post(`${API_URL}/upload-media`, {
          fileData: base64Data,
          fileName: file.name,
          fileType: file.type
        });

        if (response.data && response.data.url) {
          setUploadProgress(100);
          onChange(response.data.url);
        } else {
          alert('Failed to save uploaded video file to server. Please try again.');
        }
      } catch (err) {
        console.error('Upload endpoint error:', err);
        alert('Failed to upload video file: ' + (err.response?.data?.error || err.message));
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    reader.readAsDataURL(file);
  };

  const isUploadedVideo = value && (value.startsWith('data:video') || value.includes('/api/media/') || value.includes('/uploads/') || value.endsWith('.mp4') || value.endsWith('.webm') || value.endsWith('.mov'));
  const embedUrl = getEmbedVideoUrl(value);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">{label}</label>
      
      <div className="p-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/50 via-white to-indigo-50/20 shadow-xs hover:border-indigo-300 transition-all space-y-3">
        {isUploading ? (
          <div className="p-6 rounded-2xl bg-indigo-950 text-white text-center space-y-3 animate-in fade-in">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="font-extrabold text-sm text-indigo-100">Uploading Video File... ({fileSizeMb} MB)</span>
            </div>
            <div className="w-full bg-indigo-900 rounded-full h-3 overflow-hidden border border-indigo-700">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-indigo-300 font-bold px-1">
              <span>Processing Media Stream</span>
              <span>{uploadProgress}% Complete</span>
            </div>
          </div>
        ) : value ? (
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
                {isUploadedVideo ? 'Direct Video Active (Server Hosted)' : 'YouTube / External Link Active'}
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
                Click to Choose / Upload Video File (up to 50MB)
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1">
                Live upload progress percentage will display during processing
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

  // Admin Management State
  const [adminList, setAdminList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminMsg, setAdminMsg] = useState({ type: '', text: '' });

  const fetchAdminAccounts = async () => {
    setLoadingAdmins(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await axios.get(`${API_URL}/admin/admins`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setAdminList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'admins') {
      fetchAdminAccounts();
    }
  }, [isAdmin, activeTab]);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminMsg({ type: '', text: '' });

    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.password) {
      setAdminMsg({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    if (newAdmin.password.length < 6) {
      setAdminMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setAdminMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setCreatingAdmin(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      await axios.post(`${API_URL}/auth/signup`, {
        name: newAdmin.name.trim(),
        email: newAdmin.email.trim(),
        password: newAdmin.password,
        role: 'admin'
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      setAdminMsg({ type: 'success', text: `Admin account for "${newAdmin.name}" created successfully!` });
      setNewAdmin({ name: '', email: '', password: '', confirmPassword: '' });
      fetchAdminAccounts();
    } catch (err) {
      setAdminMsg({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to create admin account.' });
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Delete',
    variant: 'danger',
    loading: false,
    onConfirm: null
  });

  // Edit Admin State
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  const handleDeleteAdmin = (adm) => {
    const isSelf = user?.uid === adm.uid;
    const msg = isSelf
      ? `⚠️ Warning: You are about to delete your own logged-in admin account ("${adm.name || adm.email}")! If you proceed, you will lose admin access.`
      : `Are you sure you want to delete admin account "${adm.name || adm.email}"? This will permanently revoke their admin privileges.`;

    setConfirmModal({
      isOpen: true,
      title: isSelf ? 'Delete Your Own Admin Account?' : 'Remove Admin Access?',
      message: msg,
      confirmText: 'Delete Admin Account',
      variant: 'danger',
      loading: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
          await axios.delete(`${API_URL}/admin/admins/${adm.uid}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          setAdminMsg({ type: 'success', text: `Admin account "${adm.name || adm.email}" removed successfully.` });
          fetchAdminAccounts();
        } catch (err) {
          setAdminMsg({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to delete admin account.' });
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false });
        }
      }
    });
  };

  const handleUpdateAdminSubmit = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setUpdatingAdmin(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
      await axios.put(`${API_URL}/admin/admins/${editingAdmin.uid}`, {
        name: editingAdmin.name
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setAdminMsg({ type: 'success', text: `Admin account "${editingAdmin.name}" updated successfully.` });
      setEditingAdmin(null);
      fetchAdminAccounts();
    } catch (err) {
      setAdminMsg({ type: 'error', text: err.response?.data?.error || err.message || 'Failed to update admin account.' });
    } finally {
      setUpdatingAdmin(false);
    }
  };

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
          ...DEFAULT_WA_TEMPLATES,
          ...res.data,
          teachers: res.data.teachers || [],
          classes: res.data.classes || [],
          achievers: res.data.achievers || [],
          features: res.data.features || [],
          testimonials: res.data.testimonials || [],
          admissionPassTemplate: res.data.admissionPassTemplate || DEFAULT_WA_TEMPLATES.admissionPassTemplate,
          paymentReceiptTemplate: res.data.paymentReceiptTemplate || DEFAULT_WA_TEMPLATES.paymentReceiptTemplate,
          paymentReminderTemplate: res.data.paymentReminderTemplate || DEFAULT_WA_TEMPLATES.paymentReminderTemplate,
          attendanceWarningTemplate: res.data.attendanceWarningTemplate || DEFAULT_WA_TEMPLATES.attendanceWarningTemplate
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
      const payload = JSON.parse(JSON.stringify(cmsData));
      if (Array.isArray(payload.teachers)) {
        payload.teachers = payload.teachers.map(t => {
          if (typeof t.videoUrl === 'string' && t.videoUrl.startsWith('data:video') && t.videoUrl.length > 200000) {
            return { ...t, videoUrl: '' };
          }
          return t;
        });
      }

      const res = await axios.put(`${API_URL}/landing-settings`, payload);
      setSuccessMsg('All Landing Page changes saved successfully! Live website updated.');
      
      if (res.data && res.data.settings) {
        setCmsData(res.data.settings);
      }

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
  const addDemoVideo = () => {
    setCmsData({
      ...cmsData,
      demoVideos: [
        ...(cmsData.demoVideos || []),
        { title: 'Class Demonstration Video', author: 'Institute Demo', category: 'Class Preview', videoUrl: '' }
      ]
    });
  };

  const removeDemoVideo = (index) => {
    const updated = (cmsData.demoVideos || []).filter((_, i) => i !== index);
    setCmsData({ ...cmsData, demoVideos: updated });
  };

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
            { id: 'templates', label: 'WhatsApp Message Templates', icon: MessageSquare },
            { id: 'admins', label: 'Manage Admin Accounts', icon: Shield },
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

                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <label htmlFor="enableVideoAutoplay" className="text-xs font-bold text-slate-800 cursor-pointer block">
                            ▶️ Enable Automatic Video Autoplay on Landing Page
                          </label>
                          <p className="text-[11px] text-slate-500">When turned OFF, videos remain paused until students click the play button.</p>
                        </div>
                        <input
                          type="checkbox"
                          id="enableVideoAutoplay"
                          checked={cmsData.enableVideoAutoplay || false}
                          onChange={(e) => setCmsData({ ...cmsData, enableVideoAutoplay: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                        />
                      </div>

                      <VideoUploadInput
                        label="🎥 Main Institute Showcase Video (Upload MP4 or Paste YouTube Link)"
                        value={cmsData.demoVideoUrl || ''}
                        onChange={(val) => setCmsData({ ...cmsData, demoVideoUrl: val })}
                      />

                      {/* Additional Video Gallery Items */}
                      <div className="pt-4 border-t border-indigo-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-bold text-slate-800">Additional Class Demo Videos ({cmsData.demoVideos?.length || 0})</h5>
                            <p className="text-xs text-slate-500">Add multiple sample lecture clips, experiment videos, or teacher showcases for students to watch directly on the landing page.</p>
                          </div>
                          <button
                            type="button"
                            onClick={addDemoVideo}
                            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          >
                            <Plus size={14} /> Add Demo Video
                          </button>
                        </div>

                        <div className="space-y-4">
                          {(cmsData.demoVideos || []).map((v, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group">
                              <button
                                type="button"
                                onClick={() => removeDemoVideo(idx)}
                                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Remove Video"
                              >
                                <Trash2 size={16} />
                              </button>

                              <div className="grid sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600">Video Title</label>
                                  <input
                                    type="text"
                                    value={v.title}
                                    onChange={(e) => {
                                      const copy = [...(cmsData.demoVideos || [])];
                                      copy[idx].title = e.target.value;
                                      setCmsData({ ...cmsData, demoVideos: copy });
                                    }}
                                    placeholder="e.g. Physics Experiment Demo"
                                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300 font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600">Presenter / Sir Name</label>
                                  <input
                                    type="text"
                                    value={v.author}
                                    onChange={(e) => {
                                      const copy = [...(cmsData.demoVideos || [])];
                                      copy[idx].author = e.target.value;
                                      setCmsData({ ...cmsData, demoVideos: copy });
                                    }}
                                    placeholder="e.g. Dr. Nimal Wickramasinghe"
                                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600">Category Tag</label>
                                  <input
                                    type="text"
                                    value={v.category}
                                    onChange={(e) => {
                                      const copy = [...(cmsData.demoVideos || [])];
                                      copy[idx].category = e.target.value;
                                      setCmsData({ ...cmsData, demoVideos: copy });
                                    }}
                                    placeholder="e.g. Physics Demo / O/L Science"
                                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-300"
                                  />
                                </div>
                              </div>

                              <VideoUploadInput
                                label="Video File / YouTube Link"
                                value={v.videoUrl || ''}
                                onChange={(val) => {
                                  const copy = [...(cmsData.demoVideos || [])];
                                  copy[idx].videoUrl = val;
                                  setCmsData({ ...cmsData, demoVideos: copy });
                                }}
                              />
                            </div>
                          ))}
                        </div>
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

      {/* TAB: WhatsApp Message Templates Editor */}
      {isAdmin && activeTab === 'templates' && (
        <WhatsAppTemplatesEditor 
          cmsData={cmsData} 
          setCmsData={setCmsData} 
          handleSaveCms={handleSaveCms} 
          savingCms={savingCms}
          successMsg={successMsg}
          errorMsg={errorMsg}
        />
      )}

      {/* TAB: Manage Admin Accounts */}
      {isAdmin && activeTab === 'admins' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 tracking-tight">
                <Shield className="text-indigo-400" size={26} /> Manage System Administrator Accounts
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/80 font-medium mt-1">
                Create and view authorized system administrator accounts with full management privileges.
              </p>
            </div>
            <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-xs font-black uppercase tracking-wider text-indigo-300 backdrop-blur-md shrink-0">
              {adminList.length} Active Admins
            </div>
          </div>

          {/* Alert Message */}
          {adminMsg.text && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-sm ${
              adminMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {adminMsg.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0" /> : <AlertCircle size={20} className="text-rose-600 shrink-0" />}
              <span className="text-xs sm:text-sm font-bold">{adminMsg.text}</span>
            </div>
          )}

          {/* Grid Layout: Create Admin Form + Admins List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <UserCheck className="text-indigo-600" size={18} /> Create New Admin
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Enter details to grant system admin permissions.</p>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Admin Name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@kingswood.edu"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 text-white font-extrabold text-xs shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {creatingAdmin ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Creating Account...
                    </>
                  ) : (
                    <>
                      <Shield size={16} /> Create Admin Account
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Admin List Column */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                    <Users className="text-indigo-600" size={18} /> Active System Administrators
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">List of users registered with admin privileges.</p>
                </div>
                <button
                  type="button"
                  onClick={fetchAdminAccounts}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Refresh List
                </button>
              </div>

              {loadingAdmins ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                  <span className="text-xs font-bold">Loading admin accounts...</span>
                </div>
              ) : adminList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Shield size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">No admin accounts found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {adminList.map((adm, idx) => (
                    <div
                      key={adm.uid || idx}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-indigo-200/80 transition-all flex items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {adm.name ? adm.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-extrabold text-slate-800 truncate">{adm.name || 'Admin User'}</h5>
                          <p className="text-[11px] font-semibold text-slate-500 truncate flex items-center gap-1">
                            <Mail size={11} className="text-indigo-400 shrink-0" /> {adm.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <Shield size={10} /> Admin
                        </span>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingAdmin({ ...adm })}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                          title="Edit Admin Account"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(adm)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                          title="Delete Admin Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Modal: Edit Admin */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingAdmin(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <Edit size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Edit Admin Account</h3>
                <p className="text-xs font-semibold text-slate-500">{editingAdmin.email}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingAdmin.name}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingAdmin}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-extrabold text-xs shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updatingAdmin ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

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

const parseInlineStyles = (text) => {
  if (!text) return null;
  const regex = /(\*.*?\*|_.*?_|`.*?`|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <strong key={i} className="font-extrabold text-white">{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={i} className="italic text-emerald-200/90">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return <code key={i} className="bg-emerald-950/70 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-emerald-700/50">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return <span key={i} className="text-sky-300 underline underline-offset-2 break-all">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

const formatWhatsAppLine = (line) => {
  if (!line) return <br />;
  const isQuote = line.startsWith('> ');
  const content = isQuote ? line.slice(2) : line;

  const renderedContent = parseInlineStyles(content);

  if (isQuote) {
    return (
      <div className="border-l-4 border-emerald-400/80 pl-2.5 my-0.5 text-slate-200 font-medium bg-emerald-900/20 py-0.5 rounded-r">
        {renderedContent}
      </div>
    );
  }

  return renderedContent;
};

const PRESET_TEMPLATES = {
  admissionPassTemplate: [
    {
      id: 'en_default',
      label: '🇬🇧 English Standard',
      template: `🎓 *KINGSWOOD EDUCATION CENTER STUDENT ADMISSION PASS*
Dear {student_name}, welcome to Kingswood Education Center Education!

🔐 *STUDENT PORTAL LOGIN DETAILS*
> 🆔 *Student ID:* \`{student_id}\`
> 📧 *Username:* \`{username}\`
> 🔒 *Password:* \`{password}\`

🌐 *Direct One-Tap Login Portal:*
{login_link}

📱 *YOUR ATTENDANCE QR CODE PASS*
> 📌 *QR Link:* {qr_link}

💡 _Note: Please save your QR Code pass to your photo gallery. Show this QR code to mark attendance at every class session._
───────────────────────────
🏛 *Kingswood Education Center Student Management System*`
    },
    {
      id: 'si_default',
      label: '🇱🇰 Sinhala Version',
      template: `🎓 *KINGSWOOD EDUCATION CENTER ශිෂ්‍ය ඇතුළත් වීමේ පත*
ආයුබෝවන් {student_name}, Kingswood Education Center ආයතනය වෙත සාදරයෙන් පිළිගනිමු!

🔐 *ශිෂ්‍ය ගිණුමේ තොරතුරු*
> 🆔 *ශිෂ්‍ය අංකය:* \`{student_id}\`
> 📧 *පරිශීලක නාමය:* \`{username}\`
> 🔒 *මුරපදය:* \`{password}\`

🌐 *ඍජුවම ගිණුමට පිවිසීමේ ලින්ක් එක:*
{login_link}

📱 *ඔබගේ පැමිණීමේ QR කේතය*
> 📌 *QR ලින්ක් එක:* {qr_link}

💡 _සැලකිය යුතුයි: කරුණාකර මෙම QR පත ඔබගේ ජංගම දුරකථනයට සුරක්ෂිතව තබා ගන්න. සෑම පන්තියකටම පැමිණීමේදී මෙම QR කේතය ඉදිරිපත් කරන්න._
───────────────────────────
🏛 *Kingswood Education Center ශිෂ්‍ය කළමනාකරණ පද්ධතිය*`
    },
    {
      id: 'short_simple',
      label: '⚡ Short & Direct',
      template: `🎓 *KINGSWOOD EDUCATION CENTER ADMISSION PASS*
Hello {student_name}!

🆔 Student ID: \`{student_id}\`
🔒 Password: \`{password}\`
🌐 Login: {login_link}
📌 QR Pass Link: {qr_link}`
    }
  ],
  paymentReceiptTemplate: [
    {
      id: 'en_receipt',
      label: '🇬🇧 English Receipt',
      template: `🎓 *KINGSWOOD EDUCATION CENTER OFFICIAL RECEIPT*
Dear {student_name},

Here is your official payment receipt details:

📌 *PAYMENT DETAILS*
> 🔢 *Receipt No:* *{receipt_no}*
> 📚 *Class Name:* *{class_name}*
> 🗓️ *Fee Type:* *{fee_type}*
> 💰 *Amount Paid:* *Rs. {amount}*
> 📅 *Date:* *{date}*

Thank you for your payment!
───────────────────────────
🏛 *Kingswood Education Center Finance Team*`
    },
    {
      id: 'si_receipt',
      label: '🇱🇰 Sinhala Receipt',
      template: `🎓 *KINGSWOOD EDUCATION CENTER නිල ගෙවීම් රිසිට්පත*
ආයුබෝවන් {student_name},

ඔබගේ පන්ති ගාස්තු ගෙවීම් විස්තර පහත පරිදි වේ:

📌 *ගෙවීම් විස්තර*
> 🔢 *රිසිට් අංකය:* *{receipt_no}*
> 📚 *පන්තිය:* *{class_name}*
> 🗓️ *ගාස්තු මාදිලිය:* *{fee_type}*
> 💰 *ගෙවූ මුදල:* *රු. {amount}*
> 📅 *දිනය:* *{date}*

ඔබගේ ගෙවීමට ස්තූතියි!
───────────────────────────
🏛 *Kingswood Education Center මුදල් අංශය*`
    }
  ],
  paymentReminderTemplate: [
    {
      id: 'en_remind',
      label: '🇬🇧 English Reminder',
      template: `📢 *FEE PAYMENT REMINDER*
───────────────────────────
🏛 *Kingswood Education Center*

Hello *{student_name}*,

This is a gentle reminder regarding your pending class fee.

📌 *REMINDER DETAILS*
> 📚 *Fee Month:* *{fee_month}*
> ⚠️ *Status:* Pending Payment

Please complete your payment during your next class session. If you have already completed the payment, kindly ignore this message.

Thank you for your cooperation!
───────────────────────────
🏛 *Kingswood Education Center Finance Team*`
    },
    {
      id: 'si_remind',
      label: '🇱🇰 Sinhala Reminder',
      template: `📢 *පන්ති ගාස්තු මතක් කිරීම*
───────────────────────────
🏛 *Kingswood Education Center*

ආයුබෝවන් *{student_name}*,

ඔබගේ පන්ති ගාස්තු ගෙවීම සම්බන්ධයෙන් කරුණාවෙන් මතක් කර සිටිමු.

📌 *විස්තර*
> 📚 *අදාළ මාසය:* *{fee_month}*
> ⚠️ *තත්ත්වය:* ගෙවීමට ඇත

කරුණාකර ඉදිරි පන්ති වාරයේදී ගෙවීම් කටයුතු සම්පූර්ණ කරන්න. ගෙවා ඇත්නම් මෙය නොසලකා හරින්න.

ස්තූතියි!
───────────────────────────
🏛 *Kingswood Education Center මුදල් අංශය*`
    }
  ],
  attendanceWarningTemplate: [
    {
      id: 'en_att',
      label: '🇬🇧 English Warning',
      template: `📢 *ATTENDANCE WARNING NOTICE*
───────────────────────────
🏛 *Kingswood Education Center*

📊 *ATTENDANCE REPORT*
> 👤 *Student:* *{student_name}*
> 📚 *Class:* *{class_name}*
> 📅 *Month:* *{month}*
> 📉 *Attendance Rate:* *{attendance_rate}%*

⚠️ *Notice:* Attendance for this period is below the required attendance threshold. Please ensure regular attendance for upcoming sessions.

If you have any questions, feel free to contact the institute administration.
───────────────────────────
🏛 *Kingswood Education Center Student Support*`
    },
    {
      id: 'si_att',
      label: '🇱🇰 Sinhala Warning',
      template: `📢 *පැමිණීමේ අවම වීම පිළිබඳ දැනුම්දීම*
───────────────────────────
🏛 *Kingswood Education Center*

📊 *පැමිණීමේ වාර්තාව*
> 👤 *ශිෂ්‍යයා:* *{student_name}*
> 📚 *පන්තිය:* *{class_name}*
> 📅 *මාසය:* *{month}*
> 📉 *පැමිණීමේ ප්‍රතිශතය:* *{attendance_rate}%*

⚠️ *දැනුම්දීම:* මෙම කාලසීමාව තුළ පැමිණීම අවම මට්ටමක පවතී. ඉදිරි පන්ති සඳහා නිසි පරිදි සහභාගී වන ලෙස දන්වා සිටිමු.

───────────────────────────
🏛 *Kingswood Education Center ශිෂ්‍ය සහායක අංශය*`
    }
  ]
};

const WhatsAppTemplatesEditor = ({ cmsData, setCmsData, handleSaveCms, savingCms, successMsg, errorMsg }) => {
  const [selectedKey, setSelectedKey] = useState('admissionPassTemplate');
  const [editorMode, setEditorMode] = useState('simple'); // 'simple' or 'advanced'

  const configs = [
    {
      key: 'admissionPassTemplate',
      name: 'Student Admission Pass',
      badge: '🎓 Admission Pass (Student Pass)',
      description: 'Message sent via WhatsApp when registering a new student or clicking "Send Admission Pass" on student cards.',
      tags: [
        { tag: '{student_name}', label: 'Student Name' },
        { tag: '{student_id}', label: 'Student ID' },
        { tag: '{username}', label: 'Username' },
        { tag: '{password}', label: 'Password' },
        { tag: '{login_link}', label: 'One-Tap Login URL' },
        { tag: '{qr_link}', label: 'QR Pass Link' }
      ],
      sampleReplacements: {
        '{student_name}': 'Kasun Perera',
        '{student_id}': 'KWS-15464',
        '{username}': 'kws-15464@kingswood.edu',
        '{password}': '0769776315',
        '{login_link}': 'https://kingswood-connect.vercel.app/login?email=kws-15464%40kingswood.edu&password=0769776315',
        '{qr_link}': 'https://kingswood-connect.vercel.app/api/qr/KWS-15464.png'
      }
    },
    {
      key: 'paymentReceiptTemplate',
      name: 'Official Fee Receipt',
      badge: '🧾 Fee Receipt',
      description: 'Message sent when issuing digital receipts to students upon payment confirmation.',
      tags: [
        { tag: '{student_name}', label: 'Student Name' },
        { tag: '{receipt_no}', label: 'Receipt No' },
        { tag: '{class_name}', label: 'Class Name' },
        { tag: '{fee_type}', label: 'Fee Type' },
        { tag: '{amount}', label: 'Amount (Rs.)' },
        { tag: '{date}', label: 'Payment Date' }
      ],
      sampleReplacements: {
        '{student_name}': 'Kasun Perera',
        '{receipt_no}': 'REC-2026-0042',
        '{class_name}': 'Grade 13 Physics (Theory)',
        '{fee_type}': 'Monthly Fee',
        '{amount}': '3,500',
        '{date}': '2026-08-22'
      }
    },
    {
      key: 'paymentReminderTemplate',
      name: 'Fee Payment Reminder',
      badge: '🔔 Fee Reminder',
      description: 'Message sent when notifying students/parents of outstanding class fees.',
      tags: [
        { tag: '{student_name}', label: 'Student Name' },
        { tag: '{fee_month}', label: 'Fee Month' }
      ],
      sampleReplacements: {
        '{student_name}': 'Kasun Perera',
        '{fee_month}': 'August 2026'
      }
    },
    {
      key: 'attendanceWarningTemplate',
      name: 'Low Attendance Notice',
      badge: '📊 Attendance Warning',
      description: 'Message sent when a student\'s class attendance falls below the minimum required percentage.',
      tags: [
        { tag: '{student_name}', label: 'Student Name' },
        { tag: '{class_name}', label: 'Class Name' },
        { tag: '{month}', label: 'Report Month' },
        { tag: '{attendance_rate}', label: 'Attendance %' }
      ],
      sampleReplacements: {
        '{student_name}': 'Kasun Perera',
        '{class_name}': 'Grade 13 Physics (Theory)',
        '{month}': 'August 2026',
        '{attendance_rate}': '45'
      }
    }
  ];

  const currentConfig = configs.find(c => c.key === selectedKey) || configs[0];
  const templateValue = cmsData[selectedKey] || DEFAULT_WA_TEMPLATES[selectedKey] || '';
  const currentPresets = PRESET_TEMPLATES[selectedKey] || [];

  const handleTagClick = (tag) => {
    setCmsData(prev => ({
      ...prev,
      [selectedKey]: (prev[selectedKey] || '') + ' ' + tag
    }));
  };

  const handleApplyPreset = (presetTemplate) => {
    setCmsData(prev => ({
      ...prev,
      [selectedKey]: presetTemplate
    }));
  };

  const handleResetCurrent = () => {
    if (window.confirm(`Reset "${currentConfig.name}" template back to default system layout?`)) {
      setCmsData(prev => ({
        ...prev,
        [selectedKey]: DEFAULT_WA_TEMPLATES[selectedKey]
      }));
    }
  };

  // Extract simple input fields from current template string
  const getSimpleFields = () => {
    const lines = templateValue.split('\n').map(l => l.trim());
    const headerTitle = lines[0] || '';
    const greetingText = lines.find(l => l.toLowerCase().includes('dear') || l.toLowerCase().includes('hello') || l.toLowerCase().includes('ආයුබෝවන්')) || lines[1] || '';
    
    // Extract instruction note
    let noteText = '';
    const noteMatch = templateValue.match(/💡 _?([\s\S]*?)_?\n/);
    if (noteMatch && noteMatch[1]) {
      noteText = noteMatch[1].replace(/^_/, '').replace(/_$/, '').trim();
    } else if (lines.length > 3) {
      noteText = lines[lines.length - 3] || '';
    }

    // Extract footer sign-off
    const footerLine = lines[lines.length - 1] || '';
    const footerText = footerLine.replace(/^🏛\s*\**/, '').replace(/\**$/, '').trim();

    return { headerTitle, greetingText, noteText, footerText };
  };

  const simpleFields = getSimpleFields();

  const handleSimpleFieldChange = (fieldType, newValue) => {
    let newTemplate = templateValue;

    if (selectedKey === 'admissionPassTemplate') {
      const title = fieldType === 'headerTitle' ? newValue : simpleFields.headerTitle;
      const greeting = fieldType === 'greetingText' ? newValue : simpleFields.greetingText;
      const note = fieldType === 'noteText' ? newValue : simpleFields.noteText;
      const footer = fieldType === 'footerText' ? newValue : simpleFields.footerText;

      newTemplate = `${title}
${greeting}

🔐 *STUDENT PORTAL LOGIN DETAILS*
> 🆔 *Student ID:* \`{student_id}\`
> 📧 *Username:* \`{username}\`
> 🔒 *Password:* \`{password}\`

🌐 *Direct One-Tap Login Portal:*
{login_link}

📱 *YOUR ATTENDANCE QR CODE PASS*
> 📌 *QR Link:* {qr_link}

💡 _${note}_
───────────────────────────
🏛 *${footer}*`;
    } else if (selectedKey === 'paymentReceiptTemplate') {
      const title = fieldType === 'headerTitle' ? newValue : simpleFields.headerTitle;
      const greeting = fieldType === 'greetingText' ? newValue : simpleFields.greetingText;
      const note = fieldType === 'noteText' ? newValue : simpleFields.noteText;
      const footer = fieldType === 'footerText' ? newValue : simpleFields.footerText;

      newTemplate = `${title}
${greeting}

📌 *PAYMENT DETAILS*
> 🔢 *Receipt No:* *{receipt_no}*
> 📚 *Class Name:* *{class_name}*
> 🗓️ *Fee Type:* *{fee_type}*
> 💰 *Amount Paid:* *Rs. {amount}*
> 📅 *Date:* *{date}*

${note || 'Thank you for your payment!'}
───────────────────────────
🏛 *${footer}*`;
    } else if (selectedKey === 'paymentReminderTemplate') {
      const title = fieldType === 'headerTitle' ? newValue : simpleFields.headerTitle;
      const greeting = fieldType === 'greetingText' ? newValue : simpleFields.greetingText;
      const note = fieldType === 'noteText' ? newValue : simpleFields.noteText;
      const footer = fieldType === 'footerText' ? newValue : simpleFields.footerText;

      newTemplate = `${title}
───────────────────────────
🏛 *Kingswood Education Center*

${greeting}

${note || 'This is a gentle reminder regarding your pending class fee.'}

📌 *REMINDER DETAILS*
> 📚 *Fee Month:* *{fee_month}*
> ⚠️ *Status:* Pending Payment

Please complete your payment during your next class session.

───────────────────────────
🏛 *${footer}*`;
    } else {
      const title = fieldType === 'headerTitle' ? newValue : simpleFields.headerTitle;
      const note = fieldType === 'noteText' ? newValue : simpleFields.noteText;
      const footer = fieldType === 'footerText' ? newValue : simpleFields.footerText;

      newTemplate = `${title}
───────────────────────────
🏛 *Kingswood Education Center*

📊 *ATTENDANCE REPORT*
> 👤 *Student:* *{student_name}*
> 📚 *Class:* *{class_name}*
> 📅 *Month:* *{month}*
> 📉 *Attendance Rate:* *{attendance_rate}%*

⚠️ *Notice:* ${note || 'Attendance for this period is below the required attendance threshold.'}

───────────────────────────
🏛 *${footer}*`;
    }

    setCmsData(prev => ({ ...prev, [selectedKey]: newTemplate }));
  };

  const renderPreviewText = () => {
    let text = templateValue;
    Object.entries(currentConfig.sampleReplacements).forEach(([tag, val]) => {
      text = text.replaceAll(tag, val);
    });
    return text.split('\n').map((line, idx) => (
      <div key={idx} className="min-h-[1.2rem]">
        {formatWhatsAppLine(line)}
      </div>
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 p-6 sm:p-8 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30 inline-flex items-center gap-1.5 mb-2">
            <MessageSquare size={13} /> WhatsApp Message Editor
          </span>
          <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2.5 tracking-tight">
            Customize WhatsApp Message Templates
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200/80 font-medium mt-1 max-w-2xl">
            Easily update text sent to students via WhatsApp using simple form fields or 1-click presets.
          </p>
        </div>
        <button
          onClick={handleSaveCms}
          disabled={savingCms}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Save size={16} />
          {savingCms ? 'Saving Templates...' : 'Save All Templates'}
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center gap-3 font-semibold text-sm shadow-sm animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl flex items-center gap-3 font-semibold text-sm shadow-sm animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Sub-Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {configs.map((cfg) => {
          const isActive = selectedKey === cfg.key;
          return (
            <button
              key={cfg.key}
              onClick={() => setSelectedKey(cfg.key)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02] ring-2 ring-emerald-500/50'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-black uppercase tracking-wide opacity-90">{cfg.badge}</div>
              <div className="text-sm font-extrabold truncate">{cfg.name}</div>
            </button>
          );
        })}
      </div>

      {/* Editor & WhatsApp Preview Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Template Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                  {currentConfig.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {currentConfig.description}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setEditorMode('simple')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'simple' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Simple Mode
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('advanced')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    editorMode === 'advanced' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🛠️ Advanced Code Mode
                </button>
              </div>
            </div>
          </div>

          {/* 1-Click Quick Presets */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" /> 1-Click Quick Templates:
              </span>
              <button
                type="button"
                onClick={handleResetCurrent}
                className="text-[11px] font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer"
              >
                Reset to Default
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentPresets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p.template)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-600 text-slate-800 hover:text-white border border-emerald-300 font-extrabold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SIMPLE MODE FORM FIELDS (Default for Non-Technical Users) */}
          {editorMode === 'simple' ? (
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-500" /> Easy Section Form Fields
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Type text in any box to update message</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">1. Header Title Text:</label>
                <input
                  type="text"
                  value={simpleFields.headerTitle}
                  onChange={(e) => handleSimpleFieldChange('headerTitle', e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Header Title Text"
                />
              </div>

              {(selectedKey === 'admissionPassTemplate' || selectedKey === 'paymentReceiptTemplate' || selectedKey === 'paymentReminderTemplate') && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700">2. Greeting / Welcome Line:</label>
                  <input
                    type="text"
                    value={simpleFields.greetingText}
                    onChange={(e) => handleSimpleFieldChange('greetingText', e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    placeholder="Greeting line"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">
                  {selectedKey === 'admissionPassTemplate' ? '3. Note / Help Instruction Message:' : '3. Custom Message Text:'}
                </label>
                <textarea
                  rows={3}
                  value={simpleFields.noteText}
                  onChange={(e) => handleSimpleFieldChange('noteText', e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Note or additional instructions..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-700">4. Footer System Name / Sign-off:</label>
                <input
                  type="text"
                  value={simpleFields.footerText}
                  onChange={(e) => handleSimpleFieldChange('footerText', e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Footer Sign-off"
                />
              </div>
            </div>
          ) : (
            /* ADVANCED MODE (Raw Code Editor) */
            <div className="space-y-4">
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-500" /> Insert Student Info Tags:
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentConfig.tags.map((t) => (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => handleTagClick(t.tag)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-mono text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      title={`Click to insert ${t.label}`}
                    >
                      <span className="text-emerald-600 font-bold">+</span> {t.tag}
                      <span className="text-[10px] text-slate-400 font-sans">({t.label})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Message Template Code (Supports WhatsApp *bold*, _italic_, `code`, and newlines):
                </label>
                <textarea
                  rows={14}
                  value={templateValue}
                  onChange={(e) => setCmsData({ ...cmsData, [selectedKey]: e.target.value })}
                  className="w-full p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs sm:text-sm border border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all leading-relaxed"
                  placeholder="Type your custom WhatsApp message layout..."
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Simulated WhatsApp Chat Screen (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-emerald-400">
              <MessageSquare size={14} /> Live WhatsApp Chat Preview
            </span>
            <span className="text-[10px] font-bold bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/40">
              Real-time Format
            </span>
          </div>

          {/* WhatsApp Phone Mockup Container */}
          <div className="bg-[#0b141a] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            
            {/* Mock Header */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 border-b border-slate-700/60">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                KC
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                  Kingswood Education Center <span className="text-emerald-400 text-[10px]">✓</span>
                </div>
                <div className="text-[10px] text-slate-400">Official Student Management System</div>
              </div>
            </div>

            {/* Chat Screen Background */}
            <div className="p-4 bg-[#0b141a] bg-[radial-gradient(#111b21_1px,transparent_1px)] [background-size:16px_16px] min-h-[380px] flex flex-col justify-end">
              
              {/* WhatsApp Message Bubble */}
              <div className="bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-none p-4 shadow-md max-w-full space-y-2 border border-emerald-600/20 relative">
                
                {/* Formatted Message Content */}
                <div className="space-y-1">
                  {renderPreviewText()}
                </div>

                {/* Footer Timestamp */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/70 pt-1">
                  <span>13:11</span>
                  <span className="text-sky-300 font-bold">✓✓</span>
                </div>
              </div>

            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            This preview shows how WhatsApp displays your message on mobile screens.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
