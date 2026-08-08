'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import api, { errMsg } from '../../utils/api';
import { useToast } from '../shared/ToastProvider';

export default function CommentForm({ postId }) {
  const { notify } = useToast();
  const [v, setV] = useState({ name: '', email: '', content: '', website: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/comments/submit', { ...v, postId });
      notify(data?.message || 'تم إرسال تعليقك، سيظهر بعد موافقة الإدارة', 'success');
      setV({ name: '', email: '', content: '', website: '' });
    } catch (err) {
      notify(errMsg(err), 'error');
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="card p-6 md:p-7">
      <h3 className="text-lg font-bold text-dark mb-1">أضف تعليقاً</h3>
      <p className="text-gray-400 text-xs mb-5">لن يتم نشر بريدك الإلكتروني. التعليقات تظهر بعد مراجعة الإدارة.</p>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden"
        value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} aria-hidden />
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <input required placeholder="الاسم *" className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <input required type="email" placeholder="البريد الإلكتروني *" className="input" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      </div>
      <textarea required rows={4} placeholder="اكتب تعليقك…" className="input resize-none mb-4"
        value={v.content} onChange={(e) => setV({ ...v, content: e.target.value })} />
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Send className="w-4.5 h-4.5" />}
        إرسال التعليق
      </button>
    </form>
  );
}
