'use client';

import PageEditor from '../../../components/admin/crud/PageEditor';

export default function AboutPageEditor() {
  return (
    <PageEditor
      pageKey="about"
      title="محتوى صفحة «من نحن»"
      subtitle="النص الرئيسي الذي يظهر داخل صفحة من نحن (أسفل القسم التعريفي)"
      breadcrumb={[{ label: 'عن الشركة' }, { label: 'صفحة من نحن' }]}
      previewHref="/about"
      withContent
      contentLabel="قصة الشركة / المحتوى التفصيلي"
    />
  );
}
