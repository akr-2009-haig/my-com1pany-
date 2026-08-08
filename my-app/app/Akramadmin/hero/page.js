'use client';

import CrudPage from '../../../components/admin/crud/CrudPage';
import { ADMIN_BASE } from '../../../utils/constants';

export default function HeroSlidesPage() {
  return (
    <CrudPage
      endpoint="/slides"
      module="slides"
      title="السلايدر الرئيسي"
      subtitle="الشرائح الظاهرة في أعلى الصفحة الرئيسية — يمكنك ترتيبها وتفعيلها"
      breadcrumb={[{ label: 'الصفحة الرئيسية' }, { label: 'السلايدر' }]}
      addLabel="إضافة شريحة"
      reorderable
      searchable={false}
      exportable={false}
      modalSize="lg"
      dragTitle={(r) => r.title || 'شريحة بدون عنوان'}
      defaults={{
        title: '', subtitle: '', image: '', btn1Text: 'اطلب عرض سعر', btn1Link: '/quote',
        btn2Text: 'أعمالنا', btn2Link: '/portfolio', showBtn2: true, isActive: true, order: 0,
      }}
      columns={[
        {
          key: 'image',
          label: 'الصورة',
          width: '110px',
          render: (r) => (r.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={r.image} alt="" className="w-20 h-12 rounded-lg object-cover border border-gray-100" />
            : <span className="w-20 h-12 rounded-lg bg-gray-100 grid place-items-center text-[10px] text-gray-400">بدون صورة</span>),
        },
        { key: 'title', label: 'العنوان', sortable: true, render: (r) => <span className="font-semibold text-dark">{r.title || '—'}</span> },
        { key: 'subtitle', label: 'العنوان الفرعي', render: (r) => <span className="text-gray-500 line-clamp-1 max-w-xs block">{r.subtitle || '—'}</span> },
        { key: 'order', label: 'الترتيب', sortable: true, width: '80px' },
      ]}
      groups={[
        {
          label: 'المحتوى',
          fields: [
            { name: 'title', label: 'العنوان الرئيسي', required: true, cols: 2, placeholder: 'نبني حلولاً برمجية تصنع الفارق' },
            { name: 'subtitle', label: 'العنوان الفرعي', type: 'textarea', rows: 3, cols: 2 },
            { name: 'image', label: 'صورة/خلفية الشريحة', type: 'image', folder: 'slides', cols: 2 },
            { name: 'isActive', label: 'مفعّلة', type: 'toggle', default: true },
            { name: 'order', label: 'الترتيب', type: 'number', min: 0 },
          ],
        },
        {
          label: 'الأزرار',
          fields: [
            { name: 'btn1Text', label: 'نص الزر الأول', placeholder: 'اطلب عرض سعر' },
            { name: 'btn1Link', label: 'رابط الزر الأول', dir: 'ltr', placeholder: '/quote' },
            { name: 'showBtn2', label: 'إظهار الزر الثاني', type: 'toggle', default: true },
            { name: 'btn2Text', label: 'نص الزر الثاني', placeholder: 'أعمالنا', when: (f) => f.showBtn2 !== false },
            { name: 'btn2Link', label: 'رابط الزر الثاني', dir: 'ltr', placeholder: '/portfolio', when: (f) => f.showBtn2 !== false },
          ],
        },
        {
          label: 'الإنجليزية (اختياري)',
          fields: [
            { name: 'titleEn', label: 'العنوان (EN)', dir: 'ltr', cols: 2 },
            { name: 'subtitleEn', label: 'العنوان الفرعي (EN)', type: 'textarea', rows: 3, dir: 'ltr', cols: 2 },
            { name: 'btn1TextEn', label: 'نص الزر الأول (EN)', dir: 'ltr' },
            { name: 'btn2TextEn', label: 'نص الزر الثاني (EN)', dir: 'ltr' },
          ],
        },
      ]}
      extraHeaderActions={(
        <a href="/" target="_blank" rel="noreferrer" className="btn btn-sm bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary">
          معاينة الرئيسية
        </a>
      )}
    />
  );
}
