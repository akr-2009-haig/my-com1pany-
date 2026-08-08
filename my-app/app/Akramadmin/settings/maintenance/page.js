'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';

export default function MaintenanceSettingsPage() {
  return (
    <SettingsSection
      group="maintenance"
      title="وضع الصيانة"
      subtitle="عند التفعيل يرى الزوار صفحة صيانة، بينما تبقى لوحة التحكم متاحة لك"
      breadcrumbLabel="وضع الصيانة"
      defaults={{ enabled: false, title: 'الموقع تحت الصيانة', message: '', image: '', returnDate: '' }}
      fields={[
        { name: 'enabled', label: 'تفعيل وضع الصيانة', type: 'toggle', cols: 2 },
        { name: 'title', label: 'عنوان الصفحة', cols: 2 },
        { name: 'message', label: 'نص الرسالة', type: 'textarea', rows: 4, cols: 2 },
        { name: 'image', label: 'صورة الصيانة', type: 'image', folder: 'pages' },
        { name: 'returnDate', label: 'موعد العودة المتوقع', type: 'datetime-local' },
      ]}
    />
  );
}
