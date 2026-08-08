'use client';

import PageEditor from '../../../../components/admin/crud/PageEditor';

export default function PrivacyPageEditor() {
  return (
    <PageEditor
      pageKey="privacy"
      title="سياسة الخصوصية"
      subtitle="نص سياسة الخصوصية المعروض للزوار — استخدم العناوين لإنشاء فهرس تلقائي"
      breadcrumb={[{ label: 'الصفحات' }, { label: 'سياسة الخصوصية' }]}
      previewHref="/privacy"
      withContent
      contentLabel="نص السياسة"
    />
  );
}
