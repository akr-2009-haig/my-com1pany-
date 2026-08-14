import { JOB_TYPES } from '../../../utils/constants';

export const JOB_DEFAULTS = {
  title: '', department: '', type: 'full-time', location: '', salaryRange: '',
  description: '', requirements: '', skills: '', benefits: '', deadline: '', isActive: true, order: 0,
};

export const jobGroups = (departments = [], jobTypes = null) => {
  const types = (jobTypes && jobTypes.length ? jobTypes : JOB_TYPES);
  return [
    {
      label: 'البيانات الأساسية',
      fields: [
        { name: 'title', label: 'المسمى الوظيفي', required: true, cols: 2 },
        {
          name: 'department',
          label: 'القسم',
          type: 'select',
          placeholder: 'اختر القسم',
          options: departments.map((d) => ({ value: d.name, label: d.name })),
        },
        { name: 'type', label: 'نوع الدوام', type: 'select', options: types },
        { name: 'location', label: 'الموقع', placeholder: 'الرياض / عن بُعد' },
        { name: 'salaryRange', label: 'نطاق الراتب', placeholder: '8,000 - 12,000 ر.س' },
        { name: 'deadline', label: 'آخر موعد للتقديم', type: 'date' },
        { name: 'order', label: 'الترتيب', type: 'number', min: 0 },
        { name: 'isActive', label: 'الوظيفة مفتوحة', type: 'toggle', default: true },
      ],
    },
    {
      label: 'الوصف والمتطلبات',
      fields: [
        { name: 'description', label: 'وصف الوظيفة', type: 'richtext', cols: 2, folder: 'jobs', minHeight: 220 },
        { name: 'requirements', label: 'المتطلبات (سطر لكل متطلب)', type: 'textarea', rows: 7 },
        { name: 'skills', label: 'المهارات (سطر لكل مهارة)', type: 'textarea', rows: 7 },
        { name: 'benefits', label: 'المزايا (سطر لكل ميزة)', type: 'textarea', rows: 6, cols: 2 },
      ],
    },
  ];
};
