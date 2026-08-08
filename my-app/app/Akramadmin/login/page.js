'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle, Eye, EyeOff, KeyRound, Loader2, Lock, LogIn, Mail, ShieldCheck, ArrowRight,
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import api, { errMsg } from '../../../utils/api';
import { ADMIN_BASE } from '../../../utils/constants';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, verifyTwoFactor } = useAuth();

  const [step, setStep] = useState('login'); // login | 2fa | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState(null);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const next = params.get('next') || ADMIN_BASE;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setInfo(''); setAttemptsLeft(null);
    try {
      const data = await login(email.trim(), password, remember);
      if (data.twoFactorRequired) {
        setUserId(data.userId);
        setStep('2fa');
        setInfo(data.message || 'تم إرسال رمز التحقق إلى بريدك الإلكتروني');
      } else {
        router.replace(next);
      }
    } catch (ex) {
      setError(errMsg(ex));
      const left = ex?.response?.data?.attemptsLeft;
      if (typeof left === 'number' && left >= 0) setAttemptsLeft(left);
    } finally { setBusy(false); }
  };

  const submit2fa = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await verifyTwoFactor(userId, code.trim());
      router.replace(next);
    } catch (ex) { setError(errMsg(ex)); } finally { setBusy(false); }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() });
      setInfo(data.message || 'إذا كان البريد مسجلاً سيصلك رابط إعادة التعيين');
    } catch (ex) { setError(errMsg(ex)); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-adminbg" dir="rtl">
      {/* Brand side */}
      <div className="hidden lg:flex flex-col justify-between bg-dark text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <span className="w-14 h-14 rounded-2xl bg-primary grid place-items-center text-2xl font-black">A</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">لوحة تحكم الموقع</h2>
          <p className="text-white/70 leading-relaxed">
            تحكم كامل في محتوى الموقع: الخدمات، المشاريع، المدونة، الباقات، الطلبات والرسائل،
            المستخدمين والصلاحيات، التقارير والنسخ الاحتياطي — كل ذلك من مكان واحد.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            {['إدارة محتوى فورية على الموقع', 'صلاحيات دقيقة لكل مستخدم', 'حماية بتسجيل الدخول والتحقق الثنائي'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <span className="w-14 h-14 rounded-2xl bg-primary grid place-items-center text-2xl font-black text-white mx-auto">A</span>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-7 sm:p-9">
            {step === 'login' ? (
              <>
                <h1 className="text-2xl font-extrabold text-dark mb-1">تسجيل الدخول</h1>
                <p className="text-sm text-gray-500 mb-6">أدخل بياناتك للوصول إلى لوحة التحكم</p>

                {error ? (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-danger px-4 py-3 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>
                      {error}
                      {attemptsLeft !== null ? <span className="block text-xs mt-1 opacity-80">المحاولات المتبقية: {attemptsLeft}</span> : null}
                    </span>
                  </div>
                ) : null}

                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <span className="label">البريد الإلكتروني</span>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                      <input
                        type="email" required autoFocus dir="ltr"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@company.com"
                        className="input pr-10 text-left"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="label">كلمة المرور</span>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                      <input
                        type={show ? 'text' : 'password'} required dir="ltr"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input pr-10 pl-10 text-left"
                        autoComplete="current-password"
                      />
                      <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-primary" aria-label="إظهار كلمة المرور">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 accent-[#00BCD4]" />
                      تذكرني
                    </label>
                    <button type="button" onClick={() => { setStep('forgot'); setError(''); setInfo(''); }} className="text-sm text-primary hover:underline">
                      نسيت كلمة المرور؟
                    </button>
                  </div>

                  <button type="submit" disabled={busy} className="btn-primary w-full">
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                    {busy ? 'جارٍ التحقق...' : 'دخول'}
                  </button>
                </form>
              </>
            ) : step === '2fa' ? (
              <>
                <h1 className="text-2xl font-extrabold text-dark mb-1">التحقق الثنائي</h1>
                <p className="text-sm text-gray-500 mb-6">{info || 'أدخل الرمز المكوّن من 6 أرقام المرسل إلى بريدك'}</p>
                {error ? <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-danger px-4 py-3 text-sm">{error}</div> : null}
                <form onSubmit={submit2fa} className="space-y-4">
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                    <input
                      value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric" dir="ltr" placeholder="000000" required
                      className="input pr-10 text-center tracking-[0.6em] font-bold text-lg"
                    />
                  </div>
                  <button type="submit" disabled={busy || code.length < 6} className="btn-primary w-full">
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />} تأكيد الرمز
                  </button>
                  <button type="button" onClick={() => { setStep('login'); setError(''); }} className="w-full text-sm text-gray-500 hover:text-primary flex items-center justify-center gap-1">
                    <ArrowRight className="w-4 h-4" /> رجوع لتسجيل الدخول
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-dark mb-1">استعادة كلمة المرور</h1>
                <p className="text-sm text-gray-500 mb-6">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
                {error ? <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-danger px-4 py-3 text-sm">{error}</div> : null}
                {info ? <div className="mb-4 rounded-xl bg-green-50 border border-green-100 text-green-700 px-4 py-3 text-sm">{info}</div> : null}
                <form onSubmit={submitForgot} className="space-y-4">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                    <input type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" className="input pr-10 text-left" />
                  </div>
                  <button type="submit" disabled={busy} className="btn-primary w-full">
                    {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : null} إرسال الرابط
                  </button>
                  <button type="button" onClick={() => { setStep('login'); setError(''); setInfo(''); }} className="w-full text-sm text-gray-500 hover:text-primary flex items-center justify-center gap-1">
                    <ArrowRight className="w-4 h-4" /> رجوع لتسجيل الدخول
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            محاولات الدخول الفاشلة المتكررة تؤدي إلى حظر مؤقت لعنوان الـ IP.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-adminbg"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
