'use client';

import CrudPage from '../../../components/admin/crud/CrudPage';
import Icon from '../../../components/shared/Icon';

export default function StatsPage() {
  return (
    <CrudPage
      endpoint="/stats"
      module="stats"
      title="شريط الإحصائيات"
      subtitle="الأرقام المتحركة أسفل السلايدر في الصفحة الرئيسية"
      breadcrumb={[{ label: 'الصفحة الرئيسية' }, { label: 'الإحصائيات' }]}
      addLabel="إضافة إحصائية"
      reorderable
      searchable={false}
      modalSize="md"
      dragTitle={(r) => r.label}
      defaults={{ value: 0, label: '', icon: 'TrendingUp', showPlus: true, suffix: '', isActive: true }}
      columns={[
        {
          key: 'icon',
          label: 'الأيقونة',
          width: '70px',
          render: (r) => <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon name={r.icon} className="w-5 h-5" /></span>,
        },
        { key: 'value', label: 'الرقم', sortable: true, render: (r) => <span className="font-bold text-dark">{r.value}{r.showPlus ? '+' : ''}{r.suffix}</span> },
        { key: 'label', label: 'التسمية', sortable: true, render: (r) => <span className="font-semibold">{r.label}</span> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      fields={[
        { name: 'value', label: 'الرقم', type: 'number', required: true, min: 0 },
        { name: 'label', label: 'التسمية', required: true, placeholder: 'مشروع منجز' },
        { name: 'icon', label: 'الأيقونة', type: 'icon', cols: 2 },
        { name: 'suffix', label: 'لاحقة (مثل: %)', placeholder: '%' },
        { name: 'showPlus', label: 'إظهار علامة +', type: 'toggle', default: true },
        { name: 'labelEn', label: 'التسمية (EN)', dir: 'ltr' },
        { name: 'isActive', label: 'مفعّلة', type: 'toggle', default: true },
      ]}
    />
  );
}
