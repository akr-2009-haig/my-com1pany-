'use client';

import PageEditor from '../../../../components/admin/crud/PageEditor';

export default function CareersPageEditor() {
  return (
    <PageEditor
      pageKey="careers"
      title="ثقافة العمل (صفحة الوظائف)"
      subtitle="النص والمزايا الظاهرة في أعلى صفحة الوظائف"
      breadcrumb={[{ label: 'الوظائف' }, { label: 'ثقافة العمل' }]}
      previewHref="/careers"
      withTitle={false}
      defaults={{ heading: '', text: '', images: [], perks: [] }}
      dataFields={[
        { name: 'heading', label: 'العنوان', cols: 2, placeholder: 'انضم إلى فريقنا' },
        { name: 'text', label: 'النص التعريفي', type: 'textarea', rows: 5, cols: 2 },
        { name: 'images', label: 'صور بيئة العمل', type: 'images', folder: 'careers', cols: 2, max: 8 },
        {
          name: 'perks',
          label: 'مزايا العمل معنا',
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
