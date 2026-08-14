'use client';

import PageEditor from '../../../../components/admin/crud/PageEditor';
import DropdownManager from '../../../../components/admin/ui/DropdownManager';

const FIELD_TYPES = [
  { value: 'text', label: 'نص' },
  { value: 'email', label: 'بريد إلكتروني' },
  { value: 'tel', label: 'هاتف' },
  { value: 'textarea', label: 'نص طويل' },
  { value: 'service', label: 'قائمة الخدمات' },
];

const SERVICE_DEFAULTS = {
  options: [
    'تطوير مواقع الويب',
    'تطوير تطبيقات الموبايل (iOS & Android)',
    'تصميم واجهات المستخدم (UI/UX)',
    'أنظمة ERP & CRM',
    'التجارة الإلكترونية',
    'الذكاء الاصطناعي وتحليل البيانات',
    'الحوسبة السحابية',
    'أمن المعلومات والحماية',
    'الدعم الفني والصيانة',
    'استشارات تقنية',
    'أخرى',
  ],
  placeholder: 'اختر نوع الخدمة...',
  visible: true,
  required: false,
  dynamicFromServices: false,
};

const SUBJECT_DEFAULTS = {
  options: [
    'استفسار عن خدمة',
    'طلب عرض سعر',
    'الإبلاغ عن مشكلة تقنية',
    'اقتراح أو شكوى',
    'فرصة شراكة أو تعاون',
    'التواصل مع فريق المبيعات',
    'أخرى',
  ],
  placeholder: 'اختر موضوع رسالتك...',
  visible: true,
  required: false,
};

export default function ContactPageEditor() {
  return (
    <PageEditor
      pageKey="contact"
      title="إعدادات صفحة «تواصل معنا»"
      subtitle="تحكّم في حقول نموذج التواصل والقوائم المنسدلة ورسالة النجاح وخريطة الموقع"
      breadcrumb={[{ label: 'الصفحات' }, { label: 'تواصل معنا' }]}
      previewHref="/contact"
      withTitle={false}
      defaults={{
        fields: [
          { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
          { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: false, visible: true },
          { name: 'message', label: 'رسالتك', type: 'textarea', required: true, visible: true },
        ],
        contactService: SERVICE_DEFAULTS,
        contactSubject: SUBJECT_DEFAULTS,
        successMessage: 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً',
        recipientEmail: '',
        showMap: true,
        recaptcha: false,
      }}
      dataGroups={[
        {
          label: 'إعدادات حقل نوع الخدمة',
          description: 'أدر الخيارات والظهور والإلزام والـ placeholder لقائمة نوع الخدمة.',
          fields: [
            {
              name: 'contactService',
              label: 'نوع الخدمة',
              type: 'custom',
              cols: 2,
              render: ({ value, set }) => (
                <DropdownManager
                  title="قائمة نوع الخدمة"
                  description="اسحب لترتيب، عدّل النص، واحذف أي خيار. عند تفعيل «ديناميكي من الخدمات» تُسحب الخيارات من الخدمات المفعّلة تلقائياً."
                  value={value}
                  onChange={set}
                  opts={{ withDynamicFromServices: true }}
                />
              ),
            },
          ],
        },
        {
          label: 'إعدادات حقل الموضوع',
          description: 'أدر خيارات قائمة «الموضوع» وضبط ظهورها وإلزامها.',
          fields: [
            {
              name: 'contactSubject',
              label: 'الموضوع',
              type: 'custom',
              cols: 2,
              render: ({ value, set }) => (
                <DropdownManager
                  title="قائمة الموضوع"
                  description="أضف/عدّل/حذف/رتّب خيارات الموضوع بحرية كاملة."
                  value={value}
                  onChange={set}
                />
              ),
            },
          ],
        },
        {
          label: 'الحقول الأخرى',
          description: 'الحقول النصية (يمكن إخفاؤها أو إلزامها).',
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
