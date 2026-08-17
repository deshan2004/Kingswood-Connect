import React from 'react';
import { AlertTriangle, Trash2, HelpCircle, X, Loader2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger', // 'danger' | 'warning' | 'info'
  loading = false
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50 text-red-600 border-red-200',
      icon: Trash2,
      confirmBtn: 'bg-gradient-to-r from-red-600 via-red-600 to-rose-600 text-white shadow-md shadow-red-200 hover:shadow-red-300 hover:scale-[1.02]'
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      icon: AlertTriangle,
      confirmBtn: 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md shadow-amber-200 hover:shadow-amber-300 hover:scale-[1.02]'
    },
    info: {
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      icon: HelpCircle,
      confirmBtn: 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02]'
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;
  const IconComponent = currentVariant.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Icon Badge */}
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-xs ${currentVariant.iconBg}`}>
            <IconComponent size={30} />
          </div>

          {/* Title & Message */}
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full mt-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${currentVariant.confirmBtn}`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
