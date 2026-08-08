'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Folder } from 'lucide-react';
import CrudPage from '../../../components/admin/crud/CrudPage';
import api from '../../../utils/api';
import { ADMIN_BASE } from '../../../utils/constants';

export default function FaqPage() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    api.get('/faq-categories', { params: { limit: 0 } }).then((r) => setCats(r.data?.data || [])).catch(() => {});
  }, []);

  const catName = (c) => {
    if (!c) return '—';
    if (typeof c === 'object') return c.name || '—';
    return cats.find((x) => String(x._id) === String(c))?.name || '—';
  };

  return (
    <CrudPage
      endpoint="/faqs"
      module="faq"
      title="الأسئلة الشائعة"
      subtitle="الأسئلة المعروضة في صفحة الأسئلة الشائعة وصفحة الأسعار"
      breadcrumb={[{ label: 'الصفحات' }, { label: 'الأسئلة الشائعة' }]}
      addLabel="إضافة سؤال"
      reorderable
      modalSize="lg"
      dragTitle={(r) => r.question}
      defaults={{ question: '', answer: '', category: '', showOnPricing: false, isActive: true }}
      filters={[{ key: 'category', label: 'كل التصنيفات', options: cats.map((c) => ({ value: c._id, label: c.name })) }]}
      extraHeaderActions={(
        <Link href={`${ADMIN_BASE}/faq/categories`} className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
          <Folder className="w-4 h-4" /> التصنيفات
        </Link>
      )}
      columns={[
        { key: 'question', label: 'السؤال', sortable: true, render: (r) => <span className="font-semibold text-dark line-clamp-2 max-w-md block">{r.question}</span> },
        { key: 'answer', label: 'الإجابة', render: (r) => <span className="text-gray-500 text-xs line-clamp-2 max-w-md block">{r.answer}</span> },
        { key: 'category', label: 'التصنيف', width: '140px', render: (r) => <span className="badge-blue">{catName(r.category)}</span> },
        { key: 'showOnPricing', label: 'بصفحة الأسعار', width: '110px', render: (r) => (r.showOnPricing ? <span className="badge-green">نعم</span> : <span className="text-gray-300">—</span>) },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      toForm={(r) => ({ ...r, category: r.category && typeof r.category === 'object' ? r.category._id : (r.category || '') })}
      fields={[
        { name: 'question', label: 'السؤال', required: true, cols: 2 },
        { name: 'answer', label: 'الإجابة', type: 'textarea', rows: 6, required: true, cols: 2 },
        { name: 'category', label: 'التصنيف', type: 'select', placeholder: 'بدون تصنيف', options: cats.map((c) => ({ value: c._id, label: c.name })) },
        { name: 'showOnPricing', label: 'إظهاره في صفحة الأسعار', type: 'toggle' },
        { name: 'questionEn', label: 'السؤال (EN)', dir: 'ltr', cols: 2 },
        { name: 'answerEn', label: 'الإجابة (EN)', type: 'textarea', rows: 4, dir: 'ltr', cols: 2 },
        { name: 'isActive', label: 'مفعّل', type: 'toggle', default: true },
      ]}
    />
  );
}
