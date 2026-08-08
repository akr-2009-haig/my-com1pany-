'use client';

import PageEditor from '../../../../components/admin/crud/PageEditor';

export default function TermsPageEditor() {
  return (
    <PageEditor
      pageKey="terms"
      title="الشروط والأحكام"
      subtitle="نص الشروط والأحكام — العناوين (H2/H3) تُبنى منها قائمة المحتويات تلقائياً"
      breadcrumb={[{ label: 'الصفحات' }, { label: 'الشروط والأحكام' }]}
      previewHref="/terms"
      withContent
      contentLabel="نص الشروط"
    />
  );
}
