'use client';

import { KeyRound } from 'lucide-react';
import ImageUploader from '../ui/ImageUploader';
import ToggleSwitch from '../ui/ToggleSwitch';

export const USER_BLANK = {
  name: '', email: '', username: '', phone: '', bio: '',
  password: '', role: 'editor', avatar: '', isActive: true,
};

/** Shared client-side validation matching the API rules. */
export function validateUser(v, isEdit = false) {
  const e = {};
  if (!v.name?.trim()) e.name = 'الاسم مطلوب';
  if (!v.email?.trim()) e.email = 'البريد الإلكتروني مطلوب';
  else if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'صيغة البريد غير صحيحة';
  if (!isEdit && !v.password) e.password = 'كلمة المرور مطلوبة';
  else if (v.password && v.password.length < 8) e.password = 'كلمة المرور 8 أحرف على الأقل';
  else if (v.password && !(/[a-z]/.test(v.password) && /[A-Z]/.test(v.password) && /\d/.test(v.password))) {
    e.password = 'يجب أن تحتوي على حرف كبير وحرف صغير ورقم';
  }
  return e;
}

/** Reusable user form body used by both the list modal and the standalone add page. */
export default function UserFormFields({
  values, errors = {}, onChange, roleOptions = [], isEdit = false,
}) {
  const set = (k, v) => onChange(k, v);

  return (
    <div className="grid sm:grid-cols-3 gap-5">
      <div className="sm:col-span-1">
        <ImageUploader
          label="الصورة الشخصية"
          value={values.avatar}
          onChange={(v) => set('avatar', v)}
          folder="users"
          ratio="aspect-square"
        />
      </div>

      <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
        <div>
          <span className="label">الاسم الكامل *</span>
          <input value={values.name || ''} onChange={(e) => set('name', e.target.value)} className="input" placeholder="محمد أحمد" />
          {errors.name ? <p className="text-xs text-danger mt-1">{errors.name}</p> : null}
        </div>

        <div>
          <span className="label">البريد الإلكتروني *</span>
          <input type="email" dir="ltr" value={values.email || ''} onChange={(e) => set('email', e.target.value)} className="input text-left" placeholder="user@company.com" />
          {errors.email ? <p className="text-xs text-danger mt-1">{errors.email}</p> : null}
        </div>

        <div>
          <span className="label">اسم المستخدم</span>
          <input dir="ltr" value={values.username || ''} onChange={(e) => set('username', e.target.value)} className="input text-left" placeholder="username" />
        </div>

        <div>
          <span className="label">رقم الهاتف</span>
          <input dir="ltr" value={values.phone || ''} onChange={(e) => set('phone', e.target.value)} className="input text-left" placeholder="+966500000000" />
        </div>

        <div>
          <span className="label">{isEdit ? 'كلمة مرور جديدة (اتركها فارغة لعدم التغيير)' : 'كلمة المرور *'}</span>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
            <input type="password" dir="ltr" value={values.password || ''} onChange={(e) => set('password', e.target.value)} className="input pr-9 text-left" placeholder="••••••••" />
          </div>
          {errors.password
            ? <p className="text-xs text-danger mt-1">{errors.password}</p>
            : <p className="text-[11px] text-gray-400 mt-1">8 أحرف على الأقل مع حرف كبير وصغير ورقم</p>}
        </div>

        <div>
          <span className="label">الدور</span>
          <select value={values.role || 'editor'} onChange={(e) => set('role', e.target.value)} className="input">
            {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <span className="label">نبذة تعريفية</span>
          <textarea value={values.bio || ''} onChange={(e) => set('bio', e.target.value)} rows={3} className="input resize-y" placeholder="نبذة قصيرة عن المستخدم" />
        </div>

        <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 bg-gray-50">
          <div>
            <p className="text-sm font-semibold text-dark">تفعيل الحساب</p>
            <p className="text-xs text-gray-500">الحساب المعطل لا يستطيع تسجيل الدخول للوحة التحكم</p>
          </div>
          <ToggleSwitch checked={values.isActive !== false} onChange={(v) => set('isActive', v)} />
        </div>
      </div>
    </div>
  );
}
