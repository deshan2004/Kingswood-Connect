import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, Link as LinkIcon, Trash2, Plus, X, CheckCircle2, AlertCircle, FileText, Video, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Select from 'react-select';
import { storage } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Materials = () => {
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Tute');
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchMaterials();
    } else {
      setMaterials([]);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      let classes = res.data;
      if (user?.role === 'teacher' && user?.linkedId) {
        classes = classes.filter(c => c.teacherId === user.linkedId);
      } else if (user?.role === 'student' && user?.enrolledClasses) {
        classes = classes.filter(c => user.enrolledClasses.includes(c.classId));
      }
      setClassesList(classes);
      if (classes.length > 0) {
        setSelectedClass(classes[0].classId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/materials/class/${selectedClass}`);
      setMaterials(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !title || (!link && !file)) {
      showToast('error', 'Please provide a link or upload a file.');
      return;
    }
    
    setSubmitting(true);
    setUploadProgress(0);
    
    try {
      let finalLink = link;

      if (file) {
        // Upload to Firebase Storage
        const fileRef = ref(storage, `materials/${selectedClass}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        finalLink = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      const res = await axios.post(`${API_URL}/materials`, {
        classId: selectedClass,
        title,
        type,
        link: finalLink,
        description,
        teacherId: user?.linkedId || 'admin'
      });
      
      setMaterials([res.data.material, ...materials]);
      showToast('success', 'Material added successfully!');
      setShowAddModal(false);
      // Reset form
      setTitle('');
      setLink('');
      setFile(null);
      setDescription('');
      setType('Tute');
      setUploadProgress(0);
    } catch (error) {
      showToast('error', 'Failed to add material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await axios.delete(`${API_URL}/materials/${materialId}`);
      setMaterials(materials.filter(m => m.materialId !== materialId));
      showToast('success', 'Material deleted.');
    } catch (error) {
      showToast('error', 'Failed to delete material.');
    }
  };

  const getIcon = (type) => {
    if (type === 'Video') return <Video className="text-red-500" size={24} />;
    if (type === 'Exam Paper') return <FileText className="text-amber-500" size={24} />;
    return <BookOpen className="text-blue-500" size={24} />;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative">
      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm border ${
            toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-100 shrink-0" /> : <AlertCircle size={24} className="text-rose-100 shrink-0" />}
            <div>
              <h4 className="font-bold text-lg mb-0.5">{toast.type === 'success' ? 'Success!' : 'Error'}</h4>
              <p className="opacity-90 leading-tight text-sm">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-2 p-1.5 hover:bg-black/10 rounded-full transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Study Materials</h2>
          <p className="text-slate-500 font-medium mt-1">
            {user?.role === 'student' ? 'Access tutes, past papers, and video links shared by your teachers' : 'Share tutes, past papers, and video links with your students'}
          </p>
        </div>
        {user?.role !== 'student' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} /> Add Material
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {user?.role === 'student' ? 'Select Class to View' : 'Select Class to View/Add'}
          </label>
          <Select
            value={{ value: selectedClass, label: selectedClass ? classesList.find(c => c.classId === selectedClass)?.name : 'Select Class' }}
            onChange={(selectedOption) => setSelectedClass(selectedOption.value)}
            options={classesList.map(c => ({ value: c.classId, label: c.name }))}
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: '46px',
                borderRadius: '0.75rem',
                borderColor: state.isFocused ? '#4f46e5' : '#e2e8f0',
                boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none',
                '&:hover': {
                  borderColor: state.isFocused ? '#4f46e5' : '#cbd5e1'
                },
                backgroundColor: '#f8fafc',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#1e293b'
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f1f5f9' : 'transparent',
                color: state.isSelected ? '#ffffff' : '#1e293b',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '0.75rem',
                overflow: 'hidden',
                zIndex: 50
              })
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(material => (
            <div key={material.materialId} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-slate-50 p-3 rounded-2xl">
                  {getIcon(material.type)}
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {material.type}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-800 text-xl mb-2 line-clamp-2">{material.title}</h3>
              {material.description && (
                <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3">{material.description}</p>
              )}
              
              <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <a 
                  href={material.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl transition-colors"
                >
                  <Download size={16} /> {material.type === 'Video' ? 'Watch Video' : 'View / Download'}
                </a>
                
                {user?.role !== 'student' && (
                  <button 
                    onClick={() => handleDelete(material.materialId)}
                    className="p-2.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors shrink-0"
                    title="Delete Material"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
            <BookOpen size={48} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">No Materials Yet</h3>
          <p className="text-slate-500 max-w-sm mb-6">
            {user?.role === 'student' 
              ? "No tutes or exam papers have been uploaded for this class yet." 
              : "You haven't uploaded any tutes or exam papers for this class yet. Click the button below to add your first material."}
          </p>
          {user?.role !== 'student' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Add Material
            </button>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-slate-800 text-xl">Add New Material</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 bg-white shadow-sm p-1.5 rounded-full border border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Class</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                >
                  {classesList.map(c => (
                    <option key={c.classId} value={c.classId}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Unit 1 - Mechanics Tute"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  >
                    <option value="Tute">Tute</option>
                    <option value="Exam Paper">Exam Paper</option>
                    <option value="Video">Video / Recording</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Resource Link OR Upload File <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  <input 
                    type="url" 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    disabled={!!file}
                    placeholder="https://... (Google Drive, YouTube)"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <div className="relative text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-2 relative z-10">OR</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      if (e.target.files[0]) setLink('');
                    }}
                    disabled={!!link}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium disabled:bg-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Any additional instructions..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium resize-none"
                ></textarea>
              </div>
              </div>

              <div className="p-6 pt-4 border-t border-slate-100 flex gap-3 shrink-0 bg-white">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
