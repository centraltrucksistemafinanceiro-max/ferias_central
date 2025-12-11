import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-10 fade-in duration-300 ${
      type === 'success' 
        ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400 shadow-emerald-900/20' 
        : 'bg-red-950/80 border-red-500/30 text-red-400 shadow-red-900/20'
    }`}>
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <span className="font-medium text-sm pr-2">{message}</span>
      <button onClick={onClose} className="ml-auto hover:bg-white/10 p-1 rounded-full transition-colors">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;