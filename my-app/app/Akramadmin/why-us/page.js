'use client';

import PageEditor from '../../../components/admin/crud/PageEditor';

export default function WhyUsPage() {
  return (
    <PageEditor
      pageKey="whyus"
      title="قسم «لماذا تختارنا»"
      subtitle="المزايا التنافسية التي تظهر في الصفحة الرئيسية"
      breadcrumb={[{ label: 'الصفحة الرئيسية' }, { label: 'لماذا تختارنا' }]}
      previewHref="/#whyus"
      withTitle={false}
      defaults={{ eyebrow: 'لماذا نحن', heading: '', text: '', image: '', features: [], isVisible: true }}
      dataFields={[
        { name: 'isVisible', label: 'إظهار القسم في الرئيسية', type: 'toggle', default: true, cols: 2 },
        { name: 'eyebrow', label: 'النص العلوي الصغير', placeholder: 'لماذا نحن' },
        { name: 'heading', label: 'العنوان الرئيسي', placeholder: 'لماذا تختار شركتنا؟' },
        { name: 'text', label: 'وصف مختصر', type: 'textarea', rows: 4, cols: 2 },
        { name: 'image', label: 'صورة جانبية (اختياري)', type: 'image', folder: 'home', cols: 2 },
        {
          name: 'features',
          label: 'المزايا',
          type: 'list',
          cols: 2,
          addLabel: 'إضافة ميزة',
          fields: [
            { key: 'icon', label: 'الأيقونة', type: 'icon' },
            { key: 'title', label: 'العنوان', type: 'text' },
            { key: 'desc', label: 'الوصف', type: 'textarea' },
          ],
        },
      ]}
    />
  );
}
