'use client';

import { useState } from 'react';
import { User, Mail, Phone, Send, Loader2, FileText } from 'lucide-react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../shared/ToastProvider';

const DEFAULT_FIELDS = [
  { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
  { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
  { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: false, visible: true },
  { name: 'service', label: 'نوع الخدمة', type: 'service', required: false, visible: true },
  { name: 'message', label: 'رسالتك', type: 'textarea', required: true, visible: true },
];

const ICONS = { name: User, email: Mail, phone: Phone, subject: FileText };

export default function ContactForm({ config = {}, services = [], compact = false }) {
  const { notify } = useToast();
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');

  const fields = (config.fields && config.fields.length ? config.fields : DEFAULT_FIELDS).filter((f) => f.visible !== false);
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/messages/submit', values);
      const msg = data?.message || config.successMessage || 'تم إرسال رسالتك بنجاح';
      setDone(msg);
      notify(msg, 'success');
      setValues({});
      e.target.reset();
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const renderField = (f) => {
    const Ico = ICONS[f.name];
    const common = {
      name: f.name,
      required: Boolean(f.required),
      value: values[f.name] || '',
      onChange: (e) => set(f.name, e.target.value),
      placeholder: f.label + (f.required ? ' *' : ''),
      'aria-label': f.label,
      className: `input ${Ico ? 'pr-11' : ''}`,
    };

    if (f.type === 'textarea') {
      return <textarea {...common} rows={compact ? 4 : 5} className="input resize-none" />;
    }
    if (f.type === 'service') {
      return (
        <select {...common} className="input">
          <option value="">{f.label}{f.required ? ' *' : ''}</option>
          {services.map((s) => <option key={s._id} value={s.title}>{s.title}</option>)}
          <option value="أخرى">أخرى</option>
        </select>
      );
    }
    return (
      <div className="relative">
        {Ico && <Ico className="w-4.5 h-4.5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />}
        <input type={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'text'} {...common} />
      </div>
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate={false}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden"
        onChange={(e) => set('website', e.target.value)} aria-hidden />

      {fields.map((f) => (
        <div key={f.name}>
          {!compact && <label className="label" htmlFor={f.name}>{f.label}{f.required ? ' *' : ''}</label>}
          {renderField(f)}
        </div>
      ))}

      {done && <p className="text-green-600 text-sm bg-green-50 border border-green-100 rounded-xl px-4 py-3">{done}</p>}

      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
        {busy ? 'جارٍ الإرسال…' : 'إرسال'}
      </button>
    </form>
  );
}
