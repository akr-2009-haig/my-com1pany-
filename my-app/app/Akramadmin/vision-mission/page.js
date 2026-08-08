'use client';

import PageEditor from '../../../components/admin/crud/PageEditor';

export default function VisionMissionPage() {
  return (
    <PageEditor
      pageKey="vision-mission"
      title="الرؤية والرسالة والقيم"
      subtitle="البطاقات الثلاث التي تظهر في صفحة «من نحن»"
      breadcrumb={[{ label: 'عن الشركة' }, { label: 'الرؤية والرسالة' }]}
      previewHref="/about"
      withTitle={false}
      defaults={{
        items: [
          { icon: 'Eye', title: 'رؤيتنا', text: '', isVisible: true },
          { icon: 'Target', title: 'رسالتنا', text: '', isVisible: true },
          { icon: 'Diamond', title: 'قيمنا', text: '', isVisible: true },
        ],
      }}
      dataFields={[
        {
          name: 'items',
          label: 'البطاقات',
          type: 'list',
          cols: 2,
          addLabel: 'إضافة بطاقة',
          fields: [
            { key: 'icon', label: 'الأيقونة', type: 'icon' },
            { key: 'title', label: 'العنوان', type: 'text' },
            { key: 'text', label: 'النص', type: 'textarea' },
            { key: 'isVisible', label: 'ظاهرة', type: 'toggle' },
          ],
        },
      ]}
    />
  );
}
