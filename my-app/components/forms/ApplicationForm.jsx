'use client';

import { useState } from 'react';
import { UploadCloud, Send, Loader2, CheckCircle2, FileText, X } from 'lucide-react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../shared/ToastProvider';
import { formatBytes } from '../../utils/formatDate';
import DropdownField from './DropdownField';

const FALLBACK_SOURCE = ['موقع الشركة', 'LinkedIn', 'منصة بيت.كوم', 'منصة Glassdoor', 'توصية من موظف', 'منصة X (تويتر)', 'محرك بحث', 'أخرى'];
const FALLBACK_EXPERIENCE = ['بدون خبرة (مبتدئ)', 'أقل من سنة', '1 – 2 سنة', '3 – 5 سنوات', '5 – 10 سنوات', 'أكثر من 10 سنوات'];

export default function ApplicationForm({ jobId, jobTitle, dropdowns = {} }) {
  const { notify } = useToast();
  const [v, setV] = useState({ name: '', email: '', phone: '', portfolioUrl: '', coverLetter: '', source: '', experience: '', website: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const dd = dropdowns || {};
  const careersSource = dd.careersSource || {};
  const careersExperience = dd.careersExperience || {};

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(v).forEach(([k, val]) => fd.append(k, val));
      fd.append('jobId', jobId);
      if (file) fd.append('resume', file);
      const { data } = await api.post('/applications/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify(data?.message || 'تم إرسال طلبك بنجاح', 'success');
      setDone(true);
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-dark mb-2">تم استلام طلبك</h3>
        <p className="text-gray-500 text-sm">شكراً لتقديمك على وظيفة «{jobTitle}». سيتواصل معك فريق التوظيف قريباً.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 md:p-8">
      <h3 className="text-xl font-bold text-dark mb-1">التقديم على الوظيفة</h3>
      <p className="text-gray-400 text-sm mb-6">{jobTitle}</p>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden"
        value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} aria-hidden />

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div><label className="label">الاسم الكامل *</label>
          <input required className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
        <div><label className="label">البريد الإلكتروني *</label>
          <input required type="email" className="input" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></div>
        <div><label className="label">رقم الهاتف</label>
          <input className="input" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></div>
        <div><label className="label">رابط أعمالك (اختياري)</label>
          <input className="input" dir="ltr" placeholder="https://" value={v.portfolioUrl} onChange={(e) => setV({ ...v, portfolioUrl: e.target.value })} /></div>
      </div>

      <div className="mb-4">
        <label className="label">رسالة تعريفية</label>
        <textarea rows={5} className="input resize-none" placeholder="عرّفنا بخبرتك ولماذا أنت مناسب لهذه الوظيفة…"
          value={v.coverLetter} onChange={(e) => setV({ ...v, coverLetter: e.target.value })} />
      </div>

      {careersSource.visible !== false ? (
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">مصدر معرفتك بالوظيفة{careersSource.required === true ? ' *' : ''}</label>
            <DropdownField
              value={v.source}
              onChange={(x) => setV({ ...v, source: x })}
              options={careersSource.options && careersSource.options.length ? careersSource.options : FALLBACK_SOURCE}
              placeholder={careersSource.placeholder || 'كيف علمت بهذه الوظيفة؟...'}
              required={careersSource.required === true}
              name="source"
            />
          </div>
          <div>
            <label className="label">سنوات الخبرة{careersExperience.required === true ? ' *' : ''}</label>
            <DropdownField
              value={v.experience}
              onChange={(x) => setV({ ...v, experience: x })}
              options={careersExperience.options && careersExperience.options.length ? careersExperience.options : FALLBACK_EXPERIENCE}
              placeholder={careersExperience.placeholder || 'كم سنة خبرتك؟...'}
              required={careersExperience.required === true}
              name="experience"
            />
          </div>
        </div>
      ) : careersExperience.visible !== false ? (
        <div className="mb-4">
          <label className="label">سنوات الخبرة{careersExperience.required === true ? ' *' : ''}</label>
          <DropdownField
            value={v.experience}
            onChange={(x) => setV({ ...v, experience: x })}
            options={careersExperience.options && careersExperience.options.length ? careersExperience.options : FALLBACK_EXPERIENCE}
            placeholder={careersExperience.placeholder || 'كم سنة خبرتك؟...'}
            required={careersExperience.required === true}
            name="experience"
          />
        </div>
      ) : null}

      <div className="mb-6">
        <label className="label">السيرة الذاتية (PDF / DOC)</label>
        {file ? (
          <div className="flex items-center justify-between gap-3 bg-soft rounded-xl px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-gray-700 truncate"><FileText className="w-4 h-4 text-primary" />{file.name}</span>
            <span className="text-xs text-gray-400">{formatBytes(file.size)}</span>
            <button type="button" onClick={() => setFile(null)} aria-label="حذف" className="text-danger"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/[.03] transition-colors">
            <UploadCloud className="w-7 h-7 text-primary" />
            <span className="text-sm text-gray-600">اضغط لرفع السيرة الذاتية</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 10 * 1024 * 1024) { notify('حجم الملف يتجاوز 10 ميجابايت', 'warning'); return; }
                setFile(f);
              }} />
          </label>
        )}
      </div>

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
        {busy ? 'جارٍ الإرسال…' : 'تقديم الطلب'}
      </button>
    </form>
  );
}
