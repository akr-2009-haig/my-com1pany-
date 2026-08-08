'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({ notify: () => {} });
export const useToast = () => useContext(ToastContext);

const STYLES = {
  success: { bg: 'bg-green-600', Icon: CheckCircle2 },
  error: { bg: 'bg-danger', Icon: XCircle },
  warning: { bg: 'bg-orange-500', Icon: AlertTriangle },
  info: { bg: 'bg-primary', Icon: Info },
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const notify = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setItems((list) => [...list, { id, message, type }]);
    if (duration) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const value = useMemo(() => ({ notify, remove }), [notify, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[min(92vw,420px)] pointer-events-none">
        {items.map((t) => {
          const { bg, Icon: I } = STYLES[t.type] || STYLES.info;
          return (
            <div key={t.id} className={`${bg} text-white rounded-xl shadow-hover px-4 py-3 flex items-start gap-3 animate-fadeUp pointer-events-auto`}>
              <I className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed flex-1">{t.message}</p>
              <button type="button" onClick={() => remove(t.id)} aria-label="إغلاق" className="opacity-80 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
