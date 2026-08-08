'use client';

import PageEditor from '../../../../components/admin/crud/PageEditor';

const FIELD_TYPES = [
  { value: 'text', label: 'نص' },
  { value: 'email', label: 'بريد إلكتروني' },
  { value: 'tel', label: 'هاتف' },
  { value: 'textarea', label: 'نص طويل' },
  { value: 'service', label: 'قائمة الخدمات' },
  { value: 'budget', label: 'قائمة الميزانيات' },
  { value: 'timeline', label: 'قائمة المدد الزمنية' },
  { value: 'file', label: 'رفع ملفات' },
];

export default function QuotePageEditor() {
  return (
    <PageEditor
      pageKey="quote"
      title="إعدادات صفحة «اطلب عرض سعر»"
      subtitle="حقول النموذج، خيارات الميزانية والمدة، وقيود رفع الملفات"
      breadcrumb={[{ label: 'الصفحات' }, { label: 'طلب عرض سعر' }]}
      previewHref="/quote"
      withTitle={false}
      defaults={{
        fields: [
          { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
          { name: 'company', label: 'اسم الشركة', type: 'text', required: false, visible: true },
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
          { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, visible: true },
          { name: 'projectType', label: 'نوع المشروع', type: 'service', required: true, visible: true },
          { name: 'budget', label: 'الميزانية التقريبية', type: 'budget', required: false, visible: true },
          { name: 'timeline', label: 'الجدول الزمني', type: 'timeline', required: false, visible: true },
          { name: 'description', label: 'وصف المشروع', type: 'textarea', required: true, visible: true },
          { name: 'attachments', label: 'ملفات مرفقة', type: 'file', required: false, visible: true },
        ],
        budgets: ['أقل من 5,000$', '5,000$ - 10,000$', '10,000$ - 25,000$', 'أكثر من 25,000$'],
        timelines: ['أقل من شهر', '1 - 3 أشهر', '3 - 6 أشهر', 'أكثر من 6 أشهر'],
        allowedTypes: ['pdf', 'doc', 'docx', 'png', 'jpg'],
        maxFileSizeMb: 10,
        successMessage: 'تم استلام طلبك، سنرسل لك عرض السعر قريباً',
        recipientEmail: '',
      }}
      dataGroups={[
        {
          label: 'حقول النموذج',
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
          label: 'الخيارات',
          fields: [
            { name: 'budgets', label: 'خيارات الميزانية', type: 'tags', cols: 2, placeholder: 'أضف خياراً ثم Enter' },
            { name: 'timelines', label: 'خيارات المدة الزمنية', type: 'tags', cols: 2, placeholder: 'أضف خياراً ثم Enter' },
          ],
        },
        {
          label: 'الملفات والرسائل',
          fields: [
            { name: 'allowedTypes', label: 'امتدادات الملفات المسموحة', type: 'tags', cols: 2, placeholder: 'pdf ثم Enter' },
            { name: 'maxFileSizeMb', label: 'الحد الأقصى لحجم الملف (ميجابايت)', type: 'number', min: 1, max: 50 },
            { name: 'recipientEmail', label: 'بريد استقبال الطلبات', type: 'email', dir: 'ltr' },
            { name: 'successMessage', label: 'رسالة النجاح', type: 'textarea', rows: 3, cols: 2 },
          ],
        },
      ]}
    />
  );
}
