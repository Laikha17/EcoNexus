import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useEcoNexus();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      {toasts.map(toast => {
        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 animate-slideInRight bg-white',
              toast.type === 'success' && 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
              toast.type === 'error' && 'border-rose-200 bg-rose-50/90 text-rose-900',
              toast.type === 'info' && 'border-emerald-200 bg-emerald-50/90 text-emerald-900'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5 rounded-md hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
