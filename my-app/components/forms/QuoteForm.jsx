'use client';

import { useState } from 'react';
import { UploadCloud, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../shared/ToastProvider';
import { formatBytes } from '../../utils/formatDate';

const DEFAULT_FIELDS = [
  { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
  { name: 'company', label: 'اسم الشركة', type: 'text', required: false, visible: true },
  { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
  { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, visible: true },
  { name: 'projectType', label: 'نوع المشروع', type: 'service', required: true, visible: true },
  { name: 'budget', label: 'الميزانية التقريبية', type: 'budget', required: false, visible: true },
  { name: 'timeline', label: 'الجدول الزمني', type: 'timeline', required: false, visible: true },
  { name: 'description', label: 'وصف المشروع', type: 'textarea', required: true, visible: true },
  { name: 'attachments', label: 'ملفات مرفقة', type: 'file', required: false, visible: true },
];

export default function QuoteForm({ config = {}, services = [] }) {
  const { notify } = useToast();
  const [values, setValues] = useState({});
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');

  const cfg = config || {};
  const fields = (cfg.fields && cfg.fields.length ? cfg.fields : DEFAULT_FIELDS).filter((f) => f.visible !== false);
  const budgets = cfg.budgets || ['أقل من 5,000$', '5,000$ - 10,000$', '10,000$ - 25,000$', 'أكثر من 25,000$'];
  const timelines = cfg.timelines || ['أقل من شهر', '1 - 3 أشهر', '3 - 6 أشهر', 'أكثر من 6 أشهر'];
  const allowed = cfg.allowedTypes || ['pdf', 'doc', 'docx', 'png', 'jpg'];
  const maxMb = Number(cfg.maxFileSizeMb) || 10;

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const addFiles = (list) => {
    const picked = [];
    for (const f of Array.from(list)) {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      if (allowed.length && !allowed.includes(ext)) { notify(`نوع الملف .${ext} غير مسموح`, 'warning'); continue; }
      if (f.size > maxMb * 1024 * 1024) { notify(`حجم ${f.name} يتجاوز ${maxMb} ميجابايت`, 'warning'); continue; }
      picked.push(f);
    }
    setFiles((cur) => [...cur, ...picked].slice(0, 5));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => fd.append(k, v ?? ''));
      files.forEach((f) => fd.append('attachments', f));
      const { data } = await api.post('/quotes/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const msg = data?.message || cfg.successMessage || 'تم استلام طلبك بنجاح';
      setDone(msg);
      notify(msg, 'success');
      setValues({}); setFiles([]);
      e.target.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-14">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-dark mb-2">تم إرسال طلبك</h3>
        <p className="text-gray-500 max-w-md mx-auto">{done}</p>
        <button type="button" onClick={() => setDone('')} className="btn-outline mt-7">إرسال طلب آخر</button>
      </div>
    );
  }

  const render = (f) => {
    if (f.type === 'textarea') {
      return <textarea name={f.name} required={f.required} rows={6} value={values[f.name] || ''}
        onChange={(e) => set(f.name, e.target.value)} placeholder="اشرح فكرة مشروعك بالتفصيل…" className="input resize-none" />;
    }
    if (f.type === 'service' || f.type === 'budget' || f.type === 'timeline' || f.type === 'select') {
      const opts = f.type === 'service' ? services.map((s) => s.title)
        : f.type === 'budget' ? budgets
          : f.type === 'timeline' ? timelines : (f.options || []);
      return (
        <select name={f.name} required={f.required} value={values[f.name] || ''} onChange={(e) => set(f.name, e.target.value)} className="input">
          <option value="">اختر…</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
          {f.type === 'service' && <option value="أخرى">أخرى</option>}
        </select>
      );
    }
    if (f.type === 'file') {
      return (
        <div>
          <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/[.03] transition-colors">
            <UploadCloud className="w-8 h-8 text-primary" />
            <span className="text-sm text-gray-600 font-medium">اسحب الملفات هنا أو اضغط للاختيار</span>
            <span className="text-xs text-gray-400">{allowed.join(' , ').toUpperCase()} — حتى {maxMb}MB لكل ملف</span>
            <input type="file" multiple className="hidden" accept={allowed.map((a) => `.${a}`).join(',')}
              onChange={(e) => addFiles(e.target.files)} />
          </label>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3 bg-soft rounded-lg px-3.5 py-2 text-sm">
                  <span className="truncate">{f.name}</span>
                  <span className="text-gray-400 text-xs shrink-0">{formatBytes(f.size)}</span>
                  <button type="button" onClick={() => setFiles((c) => c.filter((_, x) => x !== i))} aria-label="حذف" className="text-danger">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    return (
      <input
        type={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'text'}
        name={f.name} required={f.required} value={values[f.name] || ''}
        onChange={(e) => set(f.name, e.target.value)} placeholder={f.label} className="input"
      />
    );
  };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-5">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" onChange={(e) => set('website', e.target.value)} aria-hidden />
      {fields.map((f) => (
        <div key={f.name} className={['textarea', 'file'].includes(f.type) ? 'sm:col-span-2' : ''}>
          <label className="label">{f.label}{f.required ? ' *' : ''}</label>
          {render(f)}
        </div>
      ))}
      <div className="sm:col-span-2">
        <button type="submit" disabled={busy} className="btn-primary w-full text-base py-4">
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {busy ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
        </button>
      </div>
    </form>
  );
}
