'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';

export default function ContactSettingsPage() {
  return (
    <SettingsSection
      group={null}
      title="بيانات التواصل"
      subtitle="أرقام الهواتف والبريد والعنوان وخريطة الموقع الظاهرة في الفوتر وصفحة التواصل"
      breadcrumbLabel="بيانات التواصل"
      defaults={{
        phone: '', phone2: '', whatsapp: '', email: '', email2: '',
        address: '', addressEn: '', workingHours: '', mapEmbed: '', showMap: true,
      }}
      fields={[
        { name: 'phone', label: 'رقم الهاتف الأساسي', dir: 'ltr', placeholder: '+966500000000' },
        { name: 'phone2', label: 'رقم الهاتف الثانوي', dir: 'ltr' },
        { name: 'whatsapp', label: 'رقم واتساب', dir: 'ltr', placeholder: '966500000000', hint: 'بدون + أو مسافات' },
        { name: 'email', label: 'البريد الإلكتروني', type: 'email', dir: 'ltr' },
        { name: 'email2', label: 'بريد إلكتروني إضافي', type: 'email', dir: 'ltr' },
        { name: 'workingHours', label: 'ساعات العمل', placeholder: 'الأحد - الخميس، 9 صباحاً - 6 مساءً' },
        { name: 'address', label: 'العنوان', type: 'textarea', rows: 3, cols: 2 },
        { name: 'addressEn', label: 'العنوان (EN)', type: 'textarea', rows: 2, dir: 'ltr', cols: 2 },
        {
          name: 'mapEmbed',
          label: 'كود تضمين خرائط Google (iframe أو رابط)',
          type: 'textarea',
          rows: 4,
          dir: 'ltr',
          cols: 2,
          hint: 'انسخ كود «تضمين خريطة» من خرائط Google والصقه هنا',
        },
        { name: 'showMap', label: 'إظهار الخريطة في صفحة التواصل', type: 'toggle', default: true },
      ]}
    />
  );
}
