export const PROJECT_DEFAULTS = {
  title: '', titleEn: '', category: '', client: '', description: '', challenge: '', solution: '',
  images: [], cover: '', videoUrl: '', technologies: [], liveUrl: '', projectDate: '',
  seoTitle: '', seoDesc: '', keywords: '', status: 'published', isActive: true, isFeatured: false, order: 0,
};

export const projectGroups = (categories = []) => [
  {
    label: 'المعلومات الأساسية',
    fields: [
      { name: 'title', label: 'اسم المشروع', required: true, cols: 2 },
      {
        name: 'category',
        label: 'التصنيف',
        type: 'select',
        placeholder: 'اختر التصنيف',
        options: categories.map((c) => ({ value: c._id, label: c.name })),
      },
      { name: 'client', label: 'اسم العميل' },
      { name: 'projectDate', label: 'تاريخ التنفيذ', type: 'date' },
      { name: 'liveUrl', label: 'رابط المشروع المباشر', dir: 'ltr', placeholder: 'https://' },
      {
        name: 'status',
        label: 'حالة النشر',
        type: 'select',
        options: [{ value: 'published', label: 'منشور' }, { value: 'draft', label: 'مسودة' }],
      },
      { name: 'order', label: 'الترتيب', type: 'number', min: 0 },
      { name: 'isActive', label: 'مفعّل', type: 'toggle', default: true },
      { name: 'isFeatured', label: 'مشروع مميز', type: 'toggle' },
      { name: 'technologies', label: 'التقنيات المستخدمة', type: 'tags', cols: 2, placeholder: 'React ثم Enter' },
    ],
  },
  {
    label: 'التفاصيل',
    fields: [
      { name: 'description', label: 'وصف المشروع', type: 'richtext', cols: 2, folder: 'projects', minHeight: 240 },
      { name: 'challenge', label: 'التحدي', type: 'textarea', rows: 5 },
      { name: 'solution', label: 'الحل المقدَّم', type: 'textarea', rows: 5 },
    ],
  },
  {
    label: 'الوسائط',
    fields: [
      { name: 'cover', label: 'صورة الغلاف', type: 'image', folder: 'projects' },
      { name: 'videoUrl', label: 'رابط فيديو (YouTube/Vimeo)', dir: 'ltr', placeholder: 'https://youtube.com/...' },
      { name: 'images', label: 'معرض صور المشروع', type: 'images', folder: 'projects', cols: 2, max: 12 },
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
