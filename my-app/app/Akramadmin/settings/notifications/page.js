'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';

export default function NotificationsSettingsPage() {
  return (
    <SettingsSection
      group="notifications"
      title="إعدادات التنبيهات"
      subtitle="تحكّم في التنبيهات الداخلية ورسائل البريد عند وصول طلب جديد"
      breadcrumbLabel="التنبيهات"
      defaults={{ onMessage: true, onQuote: true, onPackage: true, onApplication: true, onComment: true, emailCopy: false, email: '' }}
      fields={[
        { name: 'onMessage', label: 'تنبيه عند وصول رسالة تواصل', type: 'toggle', default: true },
        { name: 'onQuote', label: 'تنبيه عند طلب عرض سعر', type: 'toggle', default: true },
        { name: 'onPackage', label: 'تنبيه عند طلب باقة', type: 'toggle', default: true },
        { name: 'onApplication', label: 'تنبيه عند طلب توظيف', type: 'toggle', default: true },
        { name: 'onComment', label: 'تنبيه عند تعليق جديد', type: 'toggle', default: true },
        { name: 'emailCopy', label: 'إرسال نسخة بالبريد الإلكتروني', type: 'toggle' },
        { name: 'email', label: 'بريد استقبال التنبيهات', type: 'email', dir: 'ltr', cols: 2, hint: 'اتركه فارغاً لاستخدام بريد الشركة' },
      ]}
    />
  );
}
