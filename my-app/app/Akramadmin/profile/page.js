'use client';

import { useEffect, useState } from 'react';
import {
  User, Save, KeyRound, ShieldCheck, Eye, EyeOff, Mail, Calendar, BadgeCheck,
} from 'lucide-react';
import api, { errMsg } from '../../../utils/api';
import { formatDate } from '../../../utils/formatDate';
import { useToast } from '../../../components/shared/ToastProvider';
import useAuth from '../../../hooks/useAuth';
import PageHeader from '../../../components/admin/ui/PageHeader';
import ImageUploader from '../../../components/admin/ui/ImageUploader';
import ToggleSwitch from '../../../components/admin/ui/ToggleSwitch';

function strengthOf(pw = '') {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score += 1;
  return score;
}
const STRENGTH = [
  { label: 'ضعيفة جداً', color: '#e74c3c', w: '20%' },
  { label: 'ضعيفة', color: '#e74c3c', w: '35%' },
  { label: 'متوسطة', color: '#f97316', w: '60%' },
  { label: 'جيدة', color: '#22c55e', w: '80%' },
  { label: 'قوية جداً', color: '#22c55e', w: '100%' },
];

export default function ProfilePage() {
  const { notify } = useToast();
  const { user, refresh } = useAuth();

  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({ name: '', email: '', username: '', phone: '', bio: '', avatar: '', twoFactorEnabled: false });
  const [savingInfo, setSavingInfo] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      twoFactorEnabled: !!user.twoFactorEnabled,
    });
  }, [user]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const saveInfo = async () => {
    if (!form.name.trim()) { notify('الاسم مطلوب', 'warning'); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) { notify('صيغة البريد غير صحيحة', 'warning'); return; }
    setSavingInfo(true);
    try {
      await api.put('/auth/profile', form);
      notify('تم حفظ الملف الشخصي بنجاح', 'success');
      refresh?.();
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  const savePassword = async () => {
    if (!pw.currentPassword) { notify('أدخل كلمة المرور الحالية', 'warning'); return; }
    if (pw.newPassword !== pw.confirm) { notify('كلمتا المرور غير متطابقتين', 'error'); return; }
    if (strengthOf(pw.newPassword) < 3) { notify('كلمة المرور ضعيفة — 8 أحرف مع حرف كبير وصغير ورقم', 'warning'); return; }
    setSavingPw(true);
    try {
      await api.put('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      notify('تم تغيير كلمة المرور بنجاح', 'success');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      notify(errMsg(e), 'error');
    } finally {
      setSavingPw(false);
    }
  };

  const toggle2fa = async (v) => {
    set('twoFactorEnabled', v);
    try {
      await api.put('/auth/profile', { twoFactorEnabled: v });
      notify(v ? 'تم تفعيل التحقق بخطوتين — سيصلك رمز على بريدك عند الدخول' : 'تم إيقاف التحقق بخطوتين', v ? 'success' : 'warning');
      refresh?.();
    } catch (e) {
      notify(errMsg(e), 'error');
      set('twoFactorEnabled', !v);
    }
  };

  const s = strengthOf(pw.newPassword);
  const meter = STRENGTH[s] || STRENGTH[0];

  const TABS = [
    { key: 'info', label: 'البيانات الشخصية', icon: User },
    { key: 'password', label: 'كلمة المرور', icon: KeyRound },
    { key: 'security', label: 'الأمان', icon: ShieldCheck },
  ];

  return (
    <div>
      <PageHeader
        title="الملف الشخصي"
        subtitle="حدّث بياناتك وكلمة مرورك وإعدادات أمان حسابك"
        breadcrumb={[{ label: 'الملف الشخصي' }]}
        icon={<User className="w-6 h-6 text-primary" />}
      />

      <div className="grid lg:grid-cols-[300px,1fr] gap-5 items-start">
        {/* Identity card */}
        <aside className="admin-card p-6 text-center lg:sticky lg:top-24">
          {form.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.avatar} alt={form.name} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-primary/10" />
          ) : (
            <span className="w-24 h-24 rounded-full grid place-items-center bg-primary/10 text-primary text-3xl font-extrabold mx-auto">
              {(form.name || '؟').trim().charAt(0)}
            </span>
          )}
          <h2 className="mt-4 text-lg font-bold text-dark">{form.name || '—'}</h2>
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-1">
            <Mail className="w-3 h-3" />{form.email}
          </p>
          <span className={`mt-3 inline-block ${user?.role === 'admin' ? 'badge-purple' : 'badge-primary'}`}>
            {user?.roleName || user?.role || 'مستخدم'}
          </span>

          <ul className="mt-5 space-y-2 text-right text-xs text-gray-500 border-t border-gray-100 pt-4">
            <li className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              انضم في: {formatDate(user?.createdAt)}
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className={`w-3.5 h-3.5 ${form.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              التحقق بخطوتين: {form.twoFactorEnabled ? 'مفعّل' : 'غير مفعّل'}
            </li>
          </ul>
        </aside>

        <section className="space-y-5">
          <div className="admin-card p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors
                  ${tab === t.key ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {tab === 'info' ? (
            <div className="admin-card p-5 sm:p-6">
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="sm:col-span-1">
                  <ImageUploader
                    label="الصورة الشخصية"
                    value={form.avatar}
                    onChange={(v) => set('avatar', v)}
                    folder="users"
                    ratio="aspect-square"
                  />
                </div>
                <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                  <div>
                    <span className="label">الاسم الكامل *</span>
                    <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" />
                  </div>
                  <div>
                    <span className="label">البريد الإلكتروني *</span>
                    <input type="email" dir="ltr" value={form.email} onChange={(e) => set('email', e.target.value)} className="input text-left" />
                  </div>
                  <div>
                    <span className="label">اسم المستخدم</span>
                    <input dir="ltr" value={form.username} onChange={(e) => set('username', e.target.value)} className="input text-left" />
                  </div>
                  <div>
                    <span className="label">رقم الهاتف</span>
                    <input dir="ltr" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input text-left" />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="label">نبذة تعريفية</span>
                    <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={4} className="input resize-y" placeholder="نبذة قصيرة عنك تظهر في المقالات التي تكتبها" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-5 border-t border-gray-100">
                <button type="button" onClick={saveInfo} disabled={savingInfo} className="btn btn-sm btn-primary">
                  <Save className="w-4 h-4" /> {savingInfo ? '...جارٍ الحفظ' : 'حفظ البيانات'}
                </button>
              </div>
            </div>
          ) : null}

          {tab === 'password' ? (
            <div className="admin-card p-5 sm:p-6 max-w-xl">
              <h3 className="font-bold text-dark mb-1">تغيير كلمة المرور</h3>
              <p className="text-xs text-gray-500 mb-5">اختر كلمة مرور قوية لا تستخدمها في مواقع أخرى.</p>

              <div className="space-y-4">
                <div>
                  <span className="label">كلمة المرور الحالية *</span>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      dir="ltr"
                      value={pw.currentPassword}
                      onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                      className="input text-left pl-10"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-primary" aria-label="إظهار">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="label">كلمة المرور الجديدة *</span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    dir="ltr"
                    value={pw.newPassword}
                    onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                    className="input text-left"
                  />
                  {pw.newPassword ? (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: meter.w, background: meter.color }} />
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: meter.color }}>قوة كلمة المرور: {meter.label}</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 mt-1">8 أحرف على الأقل مع حرف كبير وحرف صغير ورقم</p>
                  )}
                </div>

                <div>
                  <span className="label">تأكيد كلمة المرور *</span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    dir="ltr"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    className="input text-left"
                  />
                  {pw.confirm && pw.confirm !== pw.newPassword
                    ? <p className="text-xs text-danger mt-1">كلمتا المرور غير متطابقتين</p> : null}
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-5 border-t border-gray-100">
                <button type="button" onClick={savePassword} disabled={savingPw} className="btn btn-sm btn-primary">
                  <KeyRound className="w-4 h-4" /> {savingPw ? '...جارٍ التغيير' : 'تغيير كلمة المرور'}
                </button>
              </div>
            </div>
          ) : null}

          {tab === 'security' ? (
            <div className="space-y-5">
              <div className="admin-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-dark flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" /> التحقق بخطوتين (2FA)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-lg leading-relaxed">
                      عند التفعيل، سيُرسل رمز تحقق مكوّن من 6 أرقام إلى بريدك الإلكتروني في كل مرة تسجّل فيها الدخول،
                      مما يحمي حسابك حتى لو تسربت كلمة المرور.
                    </p>
                  </div>
                  <ToggleSwitch checked={form.twoFactorEnabled} onChange={toggle2fa} />
                </div>
              </div>

              <div className="admin-card p-5 sm:p-6">
                <h3 className="font-bold text-dark mb-3">نصائح لحماية حسابك</h3>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pr-5">
                  <li>لا تشارك بيانات دخولك مع أي شخص، ولا ترسلها عبر البريد أو الواتساب.</li>
                  <li>غيّر كلمة المرور كل 3 أشهر واستخدم كلمة فريدة لهذه اللوحة.</li>
                  <li>سجّل الخروج دائماً عند استخدام جهاز عام أو مشترك.</li>
                  <li>راجع «سجل الدخول» في قسم الأمان بشكل دوري للتأكد من عدم وجود محاولات مشبوهة.</li>
                </ul>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
