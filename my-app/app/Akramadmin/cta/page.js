'use client';

import PageEditor from '../../../components/admin/crud/PageEditor';

export default function CtaPage() {
  return (
    <PageEditor
      pageKey="cta"
      title="قسم الدعوة لاتخاذ إجراء (CTA)"
      subtitle="الشريط التحفيزي أسفل الصفحة الرئيسية"
      breadcrumb={[{ label: 'الصفحة الرئيسية' }, { label: 'قسم CTA' }]}
      previewHref="/#cta"
      withTitle={false}
      defaults={{
        heading: '', text: '', image: '', btn1Text: 'اطلب عرض سعر', btn1Link: '/quote',
        btn2Text: 'تواصل معنا', btn2Link: '/contact', showBtn2: true, isVisible: true,
      }}
      dataFields={[
        { name: 'isVisible', label: 'إظهار القسم في الرئيسية', type: 'toggle', default: true, cols: 2 },
        { name: 'heading', label: 'العنوان', required: true, cols: 2, placeholder: 'جاهز لبدء مشروعك القادم؟' },
        { name: 'text', label: 'النص', type: 'textarea', rows: 3, cols: 2 },
        { name: 'image', label: 'صورة الخلفية', type: 'image', folder: 'home', cols: 2 },
        { name: 'btn1Text', label: 'نص الزر الأول', placeholder: 'اطلب عرض سعر' },
        { name: 'btn1Link', label: 'رابط الزر الأول', dir: 'ltr', placeholder: '/quote' },
        { name: 'showBtn2', label: 'إظهار الزر الثاني', type: 'toggle', default: true },
        { name: 'btn2Text', label: 'نص الزر الثاني', placeholder: 'تواصل معنا', when: (f) => f.showBtn2 !== false },
        { name: 'btn2Link', label: 'رابط الزر الثاني', dir: 'ltr', placeholder: '/contact', when: (f) => f.showBtn2 !== false },
      ]}
    />
  );
}
