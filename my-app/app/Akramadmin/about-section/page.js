'use client';

import PageEditor from '../../../components/admin/crud/PageEditor';

export default function AboutSectionPage() {
  return (
    <PageEditor
      pageKey="about-section"
      title="قسم «من نحن» بالصفحة الرئيسية"
      subtitle="النص والصورة والنقاط المميزة الظاهرة في القسم التعريفي بالرئيسية"
      breadcrumb={[{ label: 'الصفحة الرئيسية' }, { label: 'قسم من نحن' }]}
      previewHref="/#about"
      withTitle={false}
      defaults={{
        eyebrow: 'من نحن', heading: '', text: '', image: '',
        points: [], buttonText: 'اعرف المزيد', buttonLink: '/about', isVisible: true,
      }}
      dataFields={[
        { name: 'isVisible', label: 'إظهار القسم في الرئيسية', type: 'toggle', default: true, cols: 2 },
        { name: 'eyebrow', label: 'النص العلوي الصغير', placeholder: 'من نحن' },
        { name: 'heading', label: 'العنوان الرئيسي', placeholder: 'شريكك الموثوق في التحول الرقمي' },
        { name: 'text', label: 'النص التعريفي', type: 'textarea', rows: 6, cols: 2 },
        { name: 'image', label: 'صورة القسم', type: 'image', folder: 'home', cols: 2 },
        {
          name: 'points',
          label: 'النقاط المميزة',
          type: 'list',
          cols: 2,
          addLabel: 'إضافة نقطة',
          fields: [{ key: 'text', label: 'النقطة', type: 'text' }],
        },
        { name: 'buttonText', label: 'نص الزر', placeholder: 'اعرف المزيد' },
        { name: 'buttonLink', label: 'رابط الزر', dir: 'ltr', placeholder: '/about' },
      ]}
    />
  );
}
