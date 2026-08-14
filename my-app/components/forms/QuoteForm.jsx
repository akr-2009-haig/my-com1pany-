'use client';

import { useState } from 'react';
import { UploadCloud, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../shared/ToastProvider';
import { formatBytes } from '../../utils/formatDate';
import DropdownField from './DropdownField';

const DEFAULT_FIELDS = [
  { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
  { name: 'company', label: 'اسم الشركة', type: 'text', required: false, visible: true },
  { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
  { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, visible: true },
  { name: 'projectType', label: 'نوع المشروع', type: 'projectType', required: true, visible: true },
  { name: 'budget', label: 'الميزانية التقريبية', type: 'budget', required: false, visible: true },
  { name: 'timeline', label: 'الجدول الزمني', type: 'timeline', required: false, visible: true },
  { name: 'source', label: 'كيف سمعت عنا؟', type: 'source', required: false, visible: true },
  { name: 'description', label: 'وصف المشروع', type: 'textarea', required: true, visible: true },
  { name: 'attachments', label: 'ملفات مرفقة', type: 'file', required: false, visible: true },
];

const DROPDOWN_TYPES = ['projectType', 'service', 'budget', 'timeline', 'source', 'select'];

const FALLBACK_PROJECT = [
  { label: 'موقع ويب', desc: 'موقع شركة، متجر، مدونة...' },
  { label: 'تطبيق موبايل', desc: 'iOS، Android، أو كليهما' },
  { label: 'نظام إدارة', desc: 'ERP، CRM، نظام مخصص' },
  { label: 'متجر إلكتروني', desc: 'بيع منتجات أو خدمات' },
  { label: 'تصميم UI/UX', desc: 'تصميم واجهات فقط' },
  { label: 'تحسين موقع قائم', desc: 'إضافة ميزات أو إعادة تصميم' },
  { label: 'تطبيق ويب', desc: 'SaaS، منصة، لوحة تحكم' },
  { label: 'مشروع ذكاء اصطناعي', desc: 'chatbot، تحليل بيانات...' },
  { label: 'أخرى', desc: 'سأشرح في التفاصيل' },
];
const FALLBACK_BUDGET = ['أقل من 1,000$', '1,000$ – 5,000$', '5,000$ – 10,000$', '10,000$ – 25,000$', '25,000$ – 50,000$', '50,000$ – 100,000$', 'أكثر من 100,000$', 'لم أحدد الميزانية بعد'];
const FALLBACK_TIMELINE = ['عاجل جداً — أقل من أسبوعين', 'قريباً — من أسبوعين إلى شهر', 'معتدل — من 1 إلى 3 أشهر', 'متأنٍّ — من 3 إلى 6 أشهر', 'طويل المدى — أكثر من 6 أشهر', 'مرن — لا يوجد موعد محدد'];
const FALLBACK_SOURCE = ['🔍 محرك بحث (Google، Bing...)', '📱 وسائل التواصل الاجتماعي', '👥 توصية من صديق أو زميل', '📢 إعلان ممول', '🎙️ مؤتمر أو فعالية', '📰 مقال أو مدونة', '📧 بريد إلكتروني', '🎯 أخرى'];

export default function QuoteForm({ config = {}, services = [], dropdowns = {} }) {
  const { notify } = useToast();
  const [values, setValues] = useState({});
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');

  const cfg = config || {};

  const dd = {
    projectType: dropdowns.quoteProjectType || {},
    budget: dropdowns.quoteBudget || {},
    timeline: dropdowns.quoteTimeline || {},
    source: dropdowns.quoteSource || {},
  };

  const projectTypeOptions = dd.projectType.dynamicFromServices === true || !(dd.projectType.options && dd.projectType.options.length)
    ? [...services.map((s) => s.title), 'أخرى']
    : dd.projectType.options;
  const budgetOptions = dd.budget.options && dd.budget.options.length ? dd.budget.options : FALLBACK_BUDGET;
  const timelineOptions = dd.timeline.options && dd.timeline.options.length ? dd.timeline.options : FALLBACK_TIMELINE;
  const sourceOptions = dd.source.options && dd.source.options.length ? dd.source.options : FALLBACK_SOURCE;

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

  const dropdownProps = (name) => {
    if (name === 'projectType') {
      return {
        options: projectTypeOptions,
        placeholder: dd.projectType.placeholder || 'ما نوع مشروعك؟...',
        required: dd.projectType.required === true,
        showDescriptions: dd.projectType.showDescriptions !== false,
      };
    }
    if (name === 'budget') {
      return {
        options: budgetOptions,
        placeholder: dd.budget.placeholder || 'حدد ميزانيتك التقريبية...',
        required: dd.budget.required === true,
        showIcon: dd.budget.showIcon === true,
        icon: '💰',
      };
    }
    if (name === 'timeline') {
      return {
        options: timelineOptions,
        placeholder: dd.timeline.placeholder || 'متى تحتاج المشروع؟...',
        required: dd.timeline.required === true,
        showIcon: dd.timeline.showIcon === true,
        icon: '⏱️',
      };
    }
    // source / generic select
    return {
      options: name === 'source' ? sourceOptions : (dd[name]?.options || []),
      placeholder: dd[name]?.placeholder || 'اختر...',
      required: dd[name]?.required === true,
    };
  };

  const fields = (cfg.fields && cfg.fields.length ? cfg.fields : DEFAULT_FIELDS)
    .filter((f) => f.visible !== false)
    .filter((f) => !(DROPDOWN_TYPES.includes(f.type) && dd[f.name] && dd[f.name].visible === false));

  const render = (f) => {
    if (f.type === 'textarea') {
      return <textarea name={f.name} required={f.required} rows={6} value={values[f.name] || ''}
        onChange={(e) => set(f.name, e.target.value)} placeholder="اشرح فكرة مشروعك بالتفصيل…" className="input resize-none" />;
    }
    if (DROPDOWN_TYPES.includes(f.type)) {
      const p = dropdownProps(f.name);
      return (
        <DropdownField
          value={values[f.name] || ''}
          onChange={(v) => set(f.name, v)}
          options={p.options}
          placeholder={p.placeholder}
          required={p.required}
          showIcon={p.showIcon}
          icon={p.icon}
          showDescriptions={p.showDescriptions}
          name={f.name}
        />
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
