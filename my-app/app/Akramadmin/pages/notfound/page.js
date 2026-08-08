'use client';

import PageEditor from '../../../../components/admin/crud/PageEditor';

export default function NotFoundPageEditor() {
  return (
    <PageEditor
      pageKey="notfound"
      title="صفحة 404 (غير موجود)"
      subtitle="النص والصورة والروابط التي تظهر عند فتح رابط غير موجود"
      breadcrumb={[{ label: 'الصفحات' }, { label: 'صفحة 404' }]}
      previewHref="/this-page-does-not-exist"
      withTitle={false}
      defaults={{
        heading: 'الصفحة غير موجودة',
        text: 'يبدو أن الرابط الذي تبحث عنه غير صحيح أو تم نقله.',
        image: '',
        buttonText: 'العودة للرئيسية',
        buttonLink: '/',
        showSearch: true,
        links: [
          { text: 'الخدمات', url: '/services' },
          { text: 'أعمالنا', url: '/portfolio' },
          { text: 'تواصل معنا', url: '/contact' },
        ],
      }}
      dataFields={[
        { name: 'heading', label: 'العنوان', cols: 2 },
        { name: 'text', label: 'النص', type: 'textarea', rows: 3, cols: 2 },
        { name: 'image', label: 'صورة توضيحية', type: 'image', folder: 'pages', cols: 2 },
        { name: 'buttonText', label: 'نص الزر' },
        { name: 'buttonLink', label: 'رابط الزر', dir: 'ltr' },
        { name: 'showSearch', label: 'إظهار مربع البحث', type: 'toggle', default: true },
        {
          name: 'links',
          label: 'روابط مقترحة',
          type: 'list',
          cols: 2,
          addLabel: 'إضافة رابط',
          fields: [
            { key: 'text', label: 'النص', type: 'text' },
            { key: 'url', label: 'الرابط', type: 'text' },
          ],
        },
      ]}
    />
  );
}
