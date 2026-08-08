export const SERVICE_DEFAULTS = {
  title: '', titleEn: '', shortDesc: '', description: '', image: '', bannerImage: '',
  icon: 'Code', features: [], technologies: [], seoTitle: '', seoDesc: '', keywords: '',
  status: 'published', isActive: true, isFeatured: false, order: 0,
};

export const SERVICE_GROUPS = [
  {
    label: 'المعلومات الأساسية',
    fields: [
      { name: 'title', label: 'اسم الخدمة', required: true, cols: 2, placeholder: 'تطوير تطبيقات الجوال' },
      { name: 'shortDesc', label: 'وصف مختصر (يظهر في الكرت)', type: 'textarea', rows: 3, cols: 2 },
      { name: 'icon', label: 'الأيقونة', type: 'icon' },
      {
        name: 'status',
        label: 'حالة النشر',
        type: 'select',
        options: [{ value: 'published', label: 'منشور' }, { value: 'draft', label: 'مسودة' }],
      },
      { name: 'isActive', label: 'مفعّلة', type: 'toggle', default: true },
      { name: 'isFeatured', label: 'خدمة مميزة', type: 'toggle' },
      { name: 'order', label: 'الترتيب', type: 'number', min: 0 },
      { name: 'titleEn', label: 'اسم الخدمة (EN)', dir: 'ltr' },
    ],
  },
  {
    label: 'الوصف التفصيلي',
    fields: [
      { name: 'description', label: 'الوصف الكامل', type: 'richtext', cols: 2, folder: 'services', minHeight: 300 },
      {
        name: 'features',
        label: 'مميزات الخدمة',
        type: 'list',
        cols: 2,
        addLabel: 'إضافة ميزة',
        fields: [{ key: 'text', label: 'الميزة', type: 'text' }],
      },
      {
        name: 'technologies',
        label: 'التقنيات المستخدمة',
        type: 'list',
        cols: 2,
        addLabel: 'إضافة تقنية',
        fields: [
          { key: 'name', label: 'اسم التقنية', type: 'text' },
          { key: 'logo', label: 'شعار التقنية', type: 'image', folder: 'tech' },
        ],
      },
    ],
  },
  {
    label: 'الصور',
    fields: [
      { name: 'image', label: 'صورة الخدمة (الكرت)', type: 'image', folder: 'services' },
      { name: 'bannerImage', label: 'بانر صفحة الخدمة', type: 'image', folder: 'services' },
    ],
  },
  {
    label: 'تحسين محركات البحث',
    fields: [
      { name: 'seoTitle', label: 'عنوان SEO', cols: 2, hint: 'يُفضّل 50-60 حرفاً' },
      { name: 'seoDesc', label: 'وصف SEO', type: 'textarea', rows: 3, cols: 2, hint: 'يُفضّل 150-160 حرفاً' },
      { name: 'keywords', label: 'الكلمات المفتاحية (مفصولة بفاصلة)', cols: 2 },
      { name: 'slug', label: 'الرابط اللطيف (slug)', dir: 'ltr', cols: 2, hint: 'اتركه فارغاً ليُنشأ تلقائياً من الاسم' },
    ],
  },
];
