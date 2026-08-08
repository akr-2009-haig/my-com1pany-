'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';

export default function SecuritySettingsPage() {
  return (
    <SettingsSection
      group="security"
      title="إعدادات الأمان"
      subtitle="حماية النماذج من السبام وحماية لوحة التحكم من محاولات الدخول المتكررة"
      breadcrumbLabel="الأمان"
      defaults={{ recaptchaEnabled: false, siteKey: '', secretKey: '', maxAttempts: 5, blockDuration: 30, twoFactor: false }}
      fields={[
        { name: 'recaptchaEnabled', label: 'تفعيل reCAPTCHA على النماذج', type: 'toggle' },
        { name: 'twoFactor', label: 'إتاحة التحقق الثنائي للمستخدمين', type: 'toggle' },
        { name: 'siteKey', label: 'reCAPTCHA Site Key', dir: 'ltr', when: (f) => f.recaptchaEnabled },
        { name: 'secretKey', label: 'reCAPTCHA Secret Key', dir: 'ltr', type: 'password', when: (f) => f.recaptchaEnabled },
        { name: 'maxAttempts', label: 'عدد محاولات الدخول قبل الحظر', type: 'number', min: 1, max: 20 },
        { name: 'blockDuration', label: 'مدة الحظر (بالدقائق)', type: 'number', min: 1, max: 1440 },
      ]}
    />
  );
}
