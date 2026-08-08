'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import SettingsSection from '../../../../components/admin/crud/SettingsSection';
import api, { errMsg } from '../../../../utils/api';
import { useToast } from '../../../../components/shared/ToastProvider';

function TestEmailCard() {
  const { notify } = useToast();
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/settings/test-email', { to });
      notify(data.message || 'تم الإرسال', 'success');
    } catch (e) { notify(errMsg(e), 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="admin-card p-5">
      <h3 className="font-bold text-dark mb-1">اختبار إعدادات البريد</h3>
      <p className="text-sm text-gray-500 mb-4">احفظ الإعدادات أولاً ثم أرسل بريداً تجريبياً للتأكد من صحتها.</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input className="input flex-1" dir="ltr" value={to} onChange={(e) => setTo(e.target.value)} placeholder="البريد المستلم (اختياري)" />
        <button type="button" onClick={send} disabled={busy} className="btn btn-sm btn-primary shrink-0">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} إرسال بريد تجريبي
        </button>
      </div>
    </div>
  );
}

export default function SmtpSettingsPage() {
  return (
    <SettingsSection
      group="smtp"
      title="إعدادات البريد الإلكتروني (SMTP)"
      subtitle="تُستخدم لإرسال التنبيهات والردود على العملاء واستعادة كلمة المرور"
      breadcrumbLabel="إعدادات البريد"
      defaults={{ host: '', port: 587, user: '', pass: '', encryption: 'tls', fromName: '', fromEmail: '' }}
      fields={[
        { name: 'host', label: 'خادم SMTP', dir: 'ltr', placeholder: 'smtp.gmail.com' },
        { name: 'port', label: 'المنفذ', type: 'number', placeholder: '587' },
        { name: 'user', label: 'اسم المستخدم', dir: 'ltr' },
        { name: 'pass', label: 'كلمة المرور', type: 'password', dir: 'ltr', hint: 'تُخزَّن بشكل آمن ولا تظهر للعامة' },
        {
          name: 'encryption',
          label: 'نوع التشفير',
          type: 'select',
          options: [{ value: 'tls', label: 'TLS' }, { value: 'ssl', label: 'SSL' }, { value: 'none', label: 'بدون' }],
        },
        { name: 'fromName', label: 'اسم المُرسِل' },
        { name: 'fromEmail', label: 'بريد المُرسِل', type: 'email', dir: 'ltr', cols: 2 },
      ]}
      extra={<TestEmailCard />}
    />
  );
}
