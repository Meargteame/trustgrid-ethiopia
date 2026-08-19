import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  let bgClasses = 'bg-gray-900 text-white border-gray-800';
  let icon = <Info size={18} className="text-blue-400 flex-shrink-0" />;

  if (type === 'success') {
    bgClasses = 'bg-black text-white border-gray-800';
    icon = <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />;
  } else if (type === 'error') {
    bgClasses = 'bg-gray-950 text-white border-red-900/60 shadow-red-950/20';
    icon = <AlertCircle size={18} className="text-red-400 flex-shrink-0" />;
  } else if (type === 'warning') {
    bgClasses = 'bg-gray-950 text-white border-amber-900/60';
    icon = <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />;
  }

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[90%] sm:w-auto animate-bounce-in">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md ${bgClasses} transition-all`}>
        {icon}
        <p className="text-xs sm:text-sm font-bold leading-snug flex-1 pr-2">
          {message}
        </p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
