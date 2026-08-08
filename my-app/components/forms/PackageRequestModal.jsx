'use client';

import { useEffect, useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../shared/ToastProvider';

export default function PackageRequestModal({ pkg, yearly = false, onClose }) {
  const { notify } = useToast();
  const [v, setV] = useState({ name: '', email: '', phone: '', company: '', message: '', website: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pkg) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [pkg, onClose]);

  if (!pkg) return null;

  // external link (whatsapp / custom page) → just navigate
  if (pkg.buttonLink && /^(https?:|\/)/.test(pkg.buttonLink) && pkg.buttonLink !== '#') {
    if (typeof window !== 'undefined') window.location.href = pkg.buttonLink;
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/package-requests/submit', {
        ...v, packageId: pkg._id, packageName: pkg.name, billing: yearly ? 'yearly' : 'monthly',
      });
      notify(data?.message || 'تم إرسال طلبك بنجاح', 'success');
      onClose?.();
      setV({ name: '', email: '', phone: '', company: '', message: '', website: '' });
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[95] bg-black/55 grid place-items-center p-4 animate-fadeIn" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-hover max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="font-bold text-dark">طلب باقة «{pkg.name}»</h3>
            <p className="text-xs text-gray-400 mt-0.5">الدورة: {yearly ? 'سنوية' : 'شهرية'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="w-9 h-9 grid place-items-center rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden"
            value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} aria-hidden />
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="الاسم الكامل *" className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
            <input required type="email" placeholder="البريد الإلكتروني *" className="input" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
            <input placeholder="رقم الهاتف" className="input" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
            <input placeholder="اسم الشركة" className="input" value={v.company} onChange={(e) => setV({ ...v, company: e.target.value })} />
          </div>
          <textarea rows={4} placeholder="تفاصيل إضافية…" className="input resize-none" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} />
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
              إرسال الطلب
            </button>
            <button type="button" onClick={onClose} className="btn-muted">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
