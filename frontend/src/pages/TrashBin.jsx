import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, RotateCcw, Search, Filter, AlertCircle, CheckCircle2, X, RefreshCw, Layers, User, BookOpen, UserCog } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const TrashBin = () => {
  const { user } = useAuth();
  const [trashItems, setTrashItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTrashItems();
  }, []);

  const fetchTrashItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/trash`);
      setTrashItems(res.data || []);
    } catch (error) {
      console.error('Failed to fetch trash items:', error);
      showToast('error', 'Failed to load deleted items');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRestore = async (item) => {
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/trash/restore/${item.trashId}`);
      showToast('success', `"${item.title}" restored successfully!`);
      fetchTrashItems();
    } catch (error) {
      console.error('Restore error:', error);
      showToast('error', 'Failed to restore item');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = (item) => {
    setConfirmModal({
      title: 'Permanently Delete Item',
      message: (
        <span>
          Are you sure you want to permanently delete <strong className="text-slate-900 font-black">"{item.title}"</strong>? This item will be <span className="text-rose-600 font-bold">destroyed forever</span> and cannot be restored.
        </span>
      ),
      confirmText: 'Delete Permanently',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await axios.delete(`${API_URL}/trash/${item.trashId}`);
          showToast('success', `"${item.title}" deleted permanently.`);
          fetchTrashItems();
        } catch (error) {
          console.error('Delete error:', error);
          showToast('error', 'Failed to delete item permanently');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleEmptyTrash = () => {
    if (trashItems.length === 0) return;
    setConfirmModal({
      title: 'Empty Entire Trash Bin',
      message: (
        <span>
          Are you sure you want to permanently delete ALL <strong className="text-slate-900 font-black">{trashItems.length} items</strong> in the Trash Bin? <span className="text-rose-600 font-bold">This action cannot be undone.</span>
        </span>
      ),
      confirmText: 'Empty Trash Now',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await axios.delete(`${API_URL}/trash`);
          showToast('success', 'Trash Bin emptied completely.');
          fetchTrashItems();
        } catch (error) {
          console.error('Empty trash error:', error);
          showToast('error', 'Failed to empty trash');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const filteredItems = trashItems.filter(item => {
    if (typeFilter !== 'all' && item.type?.toLowerCase() !== typeFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(q);
      const subtitleMatch = item.subtitle?.toLowerCase().includes(q);
      const idMatch = item.originalId?.toLowerCase().includes(q);
      return titleMatch || subtitleMatch || idMatch;
    }
    return true;
  });

  const getTypeBadge = (type) => {
    switch (type?.toLowerCase()) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            <User size={12} /> Student
          </span>
        );
      case 'material':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            <BookOpen size={12} /> Material
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
            <UserCog size={12} /> Teacher
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
            <Layers size={12} /> {type || 'Item'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 relative">
      
      {/* Toast Notification */}
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-5 shadow-xs ring-4 ring-rose-50/50">
              <Trash2 size={26} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">{confirmModal.title || 'Are you sure?'}</h3>
            <div className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
              {confirmModal.message}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmModal.onConfirm;
                  setConfirmModal(null);
                  if (action) action();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={15} />
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Trash2 className="text-rose-600" size={32} /> Trash Bin (Recycle Bin)
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            View, restore, or permanently delete removed students, materials, and records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTrashItems}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Refresh Trash Bin"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-indigo-600" : ""} />
          </button>

          {trashItems.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              disabled={actionLoading}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-sm shadow-xs cursor-pointer"
            >
              <Trash2 size={16} /> Empty Trash ({trashItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Filter Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search deleted items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'student', label: 'Students' },
                { id: 'material', label: 'Materials' },
                { id: 'teacher', label: 'Teachers' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    typeFilter === tab.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 shadow-xs">
            {filteredItems.length} items in trash
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-rose-500" />
            <p className="font-bold text-sm">Loading deleted records...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Trash2 size={48} className="mx-auto mb-3 opacity-20 text-slate-500" />
            <p className="font-extrabold text-lg text-slate-700">Trash Bin is Empty</p>
            <p className="text-xs text-slate-400 mt-1">No deleted items match your search or filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div
                key={item.trashId}
                className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getTypeBadge(item.type)}
                    <h3 className="font-extrabold text-base text-slate-900">{item.title}</h3>
                  </div>
                  {item.subtitle && (
                    <p className="text-xs font-medium text-slate-600">{item.subtitle}</p>
                  )}
                  <p className="text-[11px] font-bold text-slate-400">
                    Deleted on: {new Date(item.deletedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                    title="Restore item back to active state"
                  >
                    <RotateCcw size={14} /> Restore Item
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(item)}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 size={14} /> Delete Permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashBin;
