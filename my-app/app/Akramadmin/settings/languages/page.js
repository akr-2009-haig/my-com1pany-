'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';

export default function LanguagesSettingsPage() {
  return (
    <SettingsSection
      group="languages"
      title="إعدادات اللغات"
      subtitle="تفعيل الموقع ثنائي اللغة واختيار اللغة الافتراضية"
      breadcrumbLabel="اللغات"
      defaults={{ bilingual: false, defaultLang: 'ar' }}
      fields={[
        { name: 'bilingual', label: 'تفعيل الموقع ثنائي اللغة (عربي/إنجليزي)', type: 'toggle' },
        {
          name: 'defaultLang',
          label: 'اللغة الافتراضية',
          type: 'select',
          options: [{ value: 'ar', label: 'العربية (RTL)' }, { value: 'en', label: 'English (LTR)' }],
        },
      ]}
    />
  );
}
