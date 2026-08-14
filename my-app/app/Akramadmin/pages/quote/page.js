'use client';

import PageEditor from '../../../../components/admin/crud/PageEditor';
import DropdownManager from '../../../../components/admin/ui/DropdownManager';

const FIELD_TYPES = [
  { value: 'text', label: 'نص' },
  { value: 'email', label: 'بريد إلكتروني' },
  { value: 'tel', label: 'هاتف' },
  { value: 'textarea', label: 'نص طويل' },
  { value: 'file', label: 'رفع ملفات' },
];

const PROJECT_TYPE_DEFAULTS = {
  options: [
    { label: 'موقع ويب', desc: 'موقع شركة، متجر، مدونة...' },
    { label: 'تطبيق موبايل', desc: 'iOS، Android، أو كليهما' },
    { label: 'نظام إدارة', desc: 'ERP، CRM، نظام مخصص' },
    { label: 'متجر إلكتروني', desc: 'بيع منتجات أو خدمات' },
    { label: 'تصميم UI/UX', desc: 'تصميم واجهات فقط' },
    { label: 'تحسين موقع قائم', desc: 'إضافة ميزات أو إعادة تصميم' },
    { label: 'تطبيق ويب', desc: 'SaaS، منصة، لوحة تحكم' },
    { label: 'مشروع ذكاء اصطناعي', desc: 'chatbot، تحليل بيانات...' },
    { label: 'أخرى', desc: 'سأشرح في التفاصيل' },
  ],
  placeholder: 'ما نوع مشروعك؟...',
  visible: true,
  required: true,
  dynamicFromServices: false,
  showDescriptions: true,
};

const BUDGET_DEFAULTS = {
  options: [
    'أقل من 1,000$', '1,000$ – 5,000$', '5,000$ – 10,000$', '10,000$ – 25,000$',
    '25,000$ – 50,000$', '50,000$ – 100,000$', 'أكثر من 100,000$', 'لم أحدد الميزانية بعد',
  ],
  placeholder: 'حدد ميزانيتك التقريبية...',
  visible: true,
  required: false,
  showIcon: true,
  currencySymbol: '$',
};

const TIMELINE_DEFAULTS = {
  options: [
    'عاجل جداً — أقل من أسبوعين', 'قريباً — من أسبوعين إلى شهر', 'معتدل — من 1 إلى 3 أشهر',
    'متأنٍّ — من 3 إلى 6 أشهر', 'طويل المدى — أكثر من 6 أشهر', 'مرن — لا يوجد موعد محدد',
  ],
  placeholder: 'متى تحتاج المشروع؟...',
  visible: true,
  required: false,
  showIcon: true,
};

const SOURCE_DEFAULTS = {
  options: [
    '🔍 محرك بحث (Google، Bing...)', '📱 وسائل التواصل الاجتماعي', '👥 توصية من صديق أو زميل', '📢 إعلان ممول',
    '🎙️ مؤتمر أو فعالية', '📰 مقال أو مدونة', '📧 بريد إلكتروني', '🎯 أخرى',
  ],
  placeholder: 'كيف وصلت إلينا؟...',
  visible: false,
  required: false,
};

export default function QuotePageEditor() {
  return (
    <PageEditor
      pageKey="quote"
      title="إعدادات صفحة «اطلب عرض سعر»"
      subtitle="القوائم المنسدلة للنموذج (نوع المشروع / الميزانية / المدة / المصدر) وقيود رفع الملفات"
      breadcrumb={[{ label: 'الصفحات' }, { label: 'طلب عرض سعر' }]}
      previewHref="/quote"
      withTitle={false}
      defaults={{
        fields: [
          { name: 'name', label: 'الاسم الكامل', type: 'text', required: true, visible: true },
          { name: 'company', label: 'اسم الشركة', type: 'text', required: false, visible: true },
          { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, visible: true },
          { name: 'phone', label: 'رقم الهاتف', type: 'tel', required: true, visible: true },
          { name: 'description', label: 'وصف المشروع', type: 'textarea', required: true, visible: true },
          { name: 'attachments', label: 'ملفات مرفقة', type: 'file', required: false, visible: true },
        ],
        quoteProjectType: PROJECT_TYPE_DEFAULTS,
        quoteBudget: BUDGET_DEFAULTS,
        quoteTimeline: TIMELINE_DEFAULTS,
        quoteSource: SOURCE_DEFAULTS,
        allowedTypes: ['pdf', 'doc', 'docx', 'png', 'jpg'],
        maxFileSizeMb: 10,
        successMessage: 'تم استلام طلبك، سنرسل لك عرض السعر قريباً',
        recipientEmail: '',
      }}
      dataGroups={[
        {
          label: 'إعدادات حقل نوع المشروع',
          description: 'أدر خيارات نوع المشروع، وأظهر/أخفِ الأوصاف، وفعّل السحب من الخدمات.',
          fields: [
            {
              name: 'quoteProjectType',
              label: 'نوع المشروع',
              type: 'custom',
              cols: 2,
              render: ({ value, set }) => (
                <DropdownManager
                  title="قائمة نوع المشروع"
                  description="كل خيار يتكوّن من اسم رئيسي ووصف مختصر (اختياري)."
                  value={value}
                  onChange={set}
                  opts={{ withDynamicFromServices: true, withDescriptions: true, addLabel: '+ إضافة نوع مشروع' }}
                />
              ),
            },
          ],
        },
        {
          label: 'إعدادات حقل الميزانية',
          description: 'أدر نطاقات الميزانية وأيقونة 💰 والعملة الافتراضية للعرض.',
          fields: [
            {
              name: 'quoteBudget',
              label: 'الميزانية',
              type: 'custom',
              cols: 2,
              render: ({ value, set }) => (
                <DropdownManager
                  title="قائمة الميزانية التقريبية"
                  description="أضف أي نطاق ميزاني تريده، وفعّل/أطفئ أيقونة 💰 وغيّر العملة الافتراضية."
                  value={value}
                  onChange={set}
                  opts={{ withIcon: true, icon: '💰', withCurrencySymbol: true, addLabel: '+ إضافة نطاق ميزاني' }}
                />
              ),
            },
          ],
        },
        {
          label: 'إعدادات حقل الجدول الزمني',
          description: 'أدر المدد الزمنية وأيقونة ⏱️.',
          fields: [
            {
              name: 'quoteTimeline',
              label: 'الجدول الزمني',
              type: 'custom',
              cols: 2,
              render: ({ value, set }) => (
                <DropdownManager
                  title="قائمة الجدول الزمني المتوقع"
                  description="أضف/عدّل/حذف/رتّب المدد الزمنية، وفعّل/أطفئ أيقونة ⏱️."
                  value={value}
                  onChange={set}
                  opts={{ withIcon: true, icon: '⏱️', addLabel: '+ إضافة مدة زمنية' }}
                />
              ),
            },
          ],
        },
        {
          label: 'إعدادات حقل المصدر (كيف سمعت عنا؟)',
          description: 'الحقل معطّل افتراضياً. فعّل «إظهار الحقل» ليظهر في النموذج.',
          fields: [
            {
              name: 'quoteSource',
              label: 'المصدر',
              type: 'custom',
              cols: 2,
              render: ({ value, set }) => (
                <DropdownManager
                  title="قائمة كيف وصلت إلينا؟"
                  description="أدر خيارات المصدر (محرك بحث، وسائل تواصل...) وأظهر/أخفِ الحقل."
                  value={value}
                  onChange={set}
                />
              ),
            },
          ],
        },
        {
          label: 'الحقول الأخرى',
          description: 'الحقول النصية ورفع الملفات (إخفاء/إلزام).',
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
