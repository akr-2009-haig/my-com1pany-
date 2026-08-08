'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl', full: 'max-w-6xl',
};

export default function Modal({
  open, title, subtitle, onClose, children, footer, size = 'md',
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div
        className={`bg-white rounded-2xl shadow-hover w-full ${SIZES[size] || SIZES.md} mx-auto my-4 flex flex-col max-h-[92vh]`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-dark">{title}</h3>
            {subtitle ? <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="text-gray-400 hover:text-danger transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {footer ? (
          <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
