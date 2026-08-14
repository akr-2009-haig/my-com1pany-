'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';
import DropdownManager from '../../../../components/admin/ui/DropdownManager';

export default function JobsFormSettingsPage() {
  return (
    <SettingsSection
      group="dropdowns"
      title="إعدادات نموذج التقديم على الوظائف"
      subtitle="تحكّم في قائمتَي «مصدر معرفتك بالوظيفة» و«سنوات الخبرة» داخل نموذج التقديم."
      breadcrumbLabel="إعدادات نموذج التقديم"
      fields={[
        {
          name: 'careersSource',
          label: 'مصدر المعرفة',
          type: 'custom',
          cols: 2,
          render: ({ value, set }) => (
            <DropdownManager
              title="حقل المصدر (كيف علمت بهذه الوظيفة؟)"
              description="أضف/عدّل/حذف/رتّب المصادر، وتحكم بالظهور والإلزام."
              value={value}
              onChange={set}
            />
          ),
        },
        {
          name: 'careersExperience',
          label: 'سنوات الخبرة',
          type: 'custom',
          cols: 2,
          render: ({ value, set }) => (
            <DropdownManager
              title="حقل سنوات الخبرة"
              description="أضف/عدّل/حذف/رتّب نطاقات الخبرة، وتحكم بالظهور والإلزام."
              value={value}
              onChange={set}
            />
          ),
        },
      ]}
      defaults={{
        careersSource: {
          options: ['موقع الشركة', 'LinkedIn', 'منصة بيت.كوم', 'منصة Glassdoor', 'توصية من موظف', 'منصة X (تويتر)', 'محرك بحث', 'أخرى'],
          placeholder: 'كيف علمت بهذه الوظيفة؟...',
          visible: true,
          required: false,
        },
        careersExperience: {
          options: ['بدون خبرة (مبتدئ)', 'أقل من سنة', '1 – 2 سنة', '3 – 5 سنوات', '5 – 10 سنوات', 'أكثر من 10 سنوات'],
          placeholder: 'كم سنة خبرتك؟...',
          visible: true,
          required: false,
        },
      }}
    />
  );
}
