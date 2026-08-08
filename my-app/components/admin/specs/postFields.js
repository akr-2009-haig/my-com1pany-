export const POST_DEFAULTS = {
  title: '', excerpt: '', content: '', image: '', categories: [], tags: [],
  status: 'published', publishAt: '', seoTitle: '', seoDesc: '', keywords: '',
  readTime: 3, isFeatured: false, authorName: '',
};

export const postGroups = (categories = []) => [
  {
    label: 'المحتوى',
    fields: [
      { name: 'title', label: 'عنوان المقال', required: true, cols: 2 },
      { name: 'excerpt', label: 'مقتطف قصير', type: 'textarea', rows: 3, cols: 2, hint: 'يظهر في قائمة المقالات ونتائج البحث' },
      { name: 'content', label: 'نص المقال', type: 'richtext', cols: 2, folder: 'blog', minHeight: 420 },
    ],
  },
  {
    label: 'التصنيف والنشر',
    fields: [
      { name: 'image', label: 'الصورة البارزة', type: 'image', folder: 'blog' },
      {
        name: 'categories',
        label: 'التصنيفات',
        type: 'multiselect',
        options: categories.map((c) => ({ value: c._id, label: c.name })),
      },
      { name: 'tags', label: 'الوسوم', type: 'tags', cols: 2, placeholder: 'اكتب وسماً ثم Enter' },
      {
        name: 'status',
        label: 'حالة النشر',
        type: 'select',
        options: [
          { value: 'published', label: 'منشور' },
          { value: 'draft', label: 'مسودة' },
          { value: 'scheduled', label: 'مجدول' },
        ],
      },
      { name: 'publishAt', label: 'موعد النشر', type: 'datetime-local', when: (f) => f.status === 'scheduled' },
      { name: 'authorName', label: 'اسم الكاتب', placeholder: 'اتركه فارغاً لاستخدام اسمك' },
      { name: 'readTime', label: 'مدة القراءة (دقائق)', type: 'number', min: 1 },
      { name: 'isFeatured', label: 'مقال مميز', type: 'toggle' },
    ],
  },
  {
    label: 'تحسين محركات البحث',
    fields: [
      { name: 'seoTitle', label: 'عنوان SEO', cols: 2 },
      { name: 'seoDesc', label: 'وصف SEO', type: 'textarea', rows: 3, cols: 2 },
      { name: 'keywords', label: 'الكلمات المفتاحية', cols: 2 },
      { name: 'slug', label: 'الرابط اللطيف (slug)', dir: 'ltr', cols: 2, hint: 'اتركه فارغاً ليُنشأ تلقائياً' },
    ],
  },
];
