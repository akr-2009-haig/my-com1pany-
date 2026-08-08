'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';

export default function WhatsappSettingsPage() {
  return (
    <SettingsSection
      group="whatsappSettings"
      title="زر واتساب العائم"
      subtitle="الزر الظاهر في جميع صفحات الموقع للتواصل السريع"
      breadcrumbLabel="زر واتساب"
      defaults={{ enabled: true, number: '', welcomeMessage: '', tooltip: '', showTooltip: true, position: 'left' }}
      fields={[
        { name: 'enabled', label: 'تفعيل الزر', type: 'toggle', default: true },
        { name: 'number', label: 'رقم واتساب', dir: 'ltr', placeholder: '966500000000', hint: 'رمز الدولة بدون + أو مسافات' },
        { name: 'welcomeMessage', label: 'الرسالة الافتراضية', type: 'textarea', rows: 3, cols: 2 },
        { name: 'tooltip', label: 'نص التلميح', placeholder: 'تحتاج مساعدة؟' },
        { name: 'showTooltip', label: 'إظهار التلميح', type: 'toggle', default: true },
        {
          name: 'position',
          label: 'موضع الزر',
          type: 'select',
          options: [{ value: 'left', label: 'أسفل اليسار' }, { value: 'right', label: 'أسفل اليمين' }],
        },
      ]}
    />
  );
}
