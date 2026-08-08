'use client';

import PageEditor from '../../../../components/admin/crud/PageEditor';

const FIELD_TYPES = [
  { value: 'text', label: 'نص' },
  { value: 'email', label: 'بريد إلكتروني' },
  { value: 'tel', label: 'هاتف' },
  { value: 'textarea', label: 'نص طويل' },
  { value: 'service', label: 'قائمة الخدمات' },
];

export default function ContactPageEditor() {
  return (
    <PageEditor
      pageKey="contact"
      title="إعدادات صفحة «تواصل معنا»"
      subtitle="تحكّم في حقول نموذج التواصل ورسالة النجاح وخريطة الموقع"
      breadcrumb={[{ label: 'الصفحات' }, { label: 'تواصل معنا' }]}
      previewHref="/contact"
      withTitle={false}
      defaults={{
        fields: [
          { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
          { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: false, visible: true },
          { name: 'service', label: 'نوع الخدمة', type: 'service', required: false, visible: true },
          { name: 'message', label: 'رسالتك', type: 'textarea', required: true, visible: true },
        ],
        successMessage: 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً',
        recipientEmail: '',
        showMap: true,
        recaptcha: false,
      }}
      dataGroups={[
        {
          label: 'حقول النموذج',
          description: 'يمكنك إخفاء أي حقل أو جعله إلزامياً، وترتيبها بالأسهم.',
          fields: [
            {
              name: 'fields',
              label: 'الحقول',
              type: 'list',
              cols: 2,
              addLabel: 'إضافة حقل',
              fields: [
                { key: 'name', label: 'الاسم البرمجي (name)', type: 'text' },
                { key: 'label', label: 'التسمية الظاهرة', type: 'text' },
                { key: 'type', label: 'النوع', type: 'select', options: FIELD_TYPES },
                { key: 'required', label: 'إلزامي', type: 'toggle' },
                { key: 'visible', label: 'ظاهر', type: 'toggle' },
              ],
            },
          ],
        },
        {
          label: 'الإعدادات',
          fields: [
            { name: 'successMessage', label: 'رسالة النجاح', type: 'textarea', rows: 3, cols: 2 },
            { name: 'recipientEmail', label: 'بريد استقبال الرسائل', type: 'email', dir: 'ltr', hint: 'اتركه فارغاً لاستخدام بريد الشركة الافتراضي' },
            { name: 'showMap', label: 'إظهار خريطة الموقع', type: 'toggle', default: true },
            { name: 'recaptcha', label: 'تفعيل reCAPTCHA', type: 'toggle' },
          ],
        },
      ]}
    />
  );
}
