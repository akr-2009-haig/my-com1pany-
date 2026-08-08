'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  open,
  title = 'تأكيد العملية',
  message = 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.',
  confirmText = 'نعم، متابعة',
  cancelText = 'إلغاء',
  danger = true,
  onConfirm,
  onCancel,
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) { setBusy(false); return undefined; }
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const run = async () => {
    setBusy(true);
    try { await onConfirm?.(); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-hover w-full max-w-md overflow-hidden">
        <div className="flex items-start gap-4 p-6">
          <span className={`grid place-items-center w-12 h-12 rounded-full shrink-0 ${danger ? 'bg-red-50 text-danger' : 'bg-cyan-50 text-primary'}`}>
            <AlertTriangle className="w-6 h-6" />
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-dark mb-1">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="إغلاق" className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="btn btn-sm bg-[#6c757d] text-white hover:bg-[#5a6268]">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className={`btn btn-sm text-white ${danger ? 'bg-danger hover:bg-red-600' : 'bg-primary hover:bg-primary-dark'}`}
          >
            {busy ? '...جارٍ التنفيذ' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
