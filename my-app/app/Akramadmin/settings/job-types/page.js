'use client';

import SettingsSection from '../../../../components/admin/crud/SettingsSection';
import DynamicList from '../../../../components/admin/ui/DynamicList';

export default function JobTypesSettingsPage() {
  return (
    <SettingsSection
      group="dropdowns"
      title="أنواع الدوام"
      subtitle="أنواع الدوام المتاحة في نموذج الوظائف وفلترة الوظائف. أضف/عدّل/حذف/رتّب بحرية."
      breadcrumbLabel="أنواع الدوام"
      fields={[
        {
          name: 'jobTypes',
          label: 'أنواع الدوام',
          type: 'custom',
          cols: 2,
          render: ({ value, set }) => (
            <DynamicList
              label="أنواع الدوام"
              value={value || []}
              addLabel="+ إضافة نوع دوام"
              emptyText="لا توجد أنواع دوام بعد."
              fields={[
                { key: 'value', label: 'المعرّف (value)', type: 'text', placeholder: 'full-time' },
                { key: 'label', label: 'التسمية الظاهرة', type: 'text', placeholder: 'دوام كامل (Full-time)' },
              ]}
              onChange={set}
            />
          ),
        },
      ]}
      defaults={{
        jobTypes: [
          { value: 'full-time', label: 'دوام كامل (Full-time)' },
          { value: 'part-time', label: 'دوام جزئي (Part-time)' },
          { value: 'remote', label: 'عن بُعد بالكامل (Remote)' },
          { value: 'hybrid', label: 'هجين (Hybrid)' },
          { value: 'contract', label: 'عقد مؤقت (Contract)' },
          { value: 'internship', label: 'تدريب ميداني (Internship)' },
        ],
      }}
    />
  );
}
