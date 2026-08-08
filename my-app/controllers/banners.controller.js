const crud = require('./factory');
const { collection } = require('../lib/datastore');

const PAGES = [
  { page: 'about', label: 'من نحن' },
  { page: 'services', label: 'الخدمات' },
  { page: 'portfolio', label: 'معرض الأعمال' },
  { page: 'pricing', label: 'الباقات' },
  { page: 'blog', label: 'المدونة' },
  { page: 'careers', label: 'الوظائف' },
  { page: 'contact', label: 'تواصل معنا' },
  { page: 'quote', label: 'اطلب عرض سعر' },
  { page: 'faq', label: 'الأسئلة الشائعة' },
  { page: 'privacy', label: 'سياسة الخصوصية' },
  { page: 'terms', label: 'الشروط والأحكام' },
];

const base = crud('banners', { event: 'banners:updated', defaultSort: { page: 1 } });

base.list = async (req, res, next) => {
  try {
    const existing = await collection('banners').find({}, { limit: 0 });
    const map = new Map(existing.map((b) => [b.page, b]));
    const data = PAGES.map((p) => map.get(p.page) || { page: p.page, label: p.label, title: p.label, image: '', isActive: true });
    res.json({ data });
  } catch (e) { next(e); }
};

/** Upsert by page key. */
base.save = async (req, res, next) => {
  try {
    const page = req.params.page;
    const meta = PAGES.find((p) => p.page === page);
    if (!meta) return res.status(400).json({ message: 'صفحة غير معروفة' });
    const doc = await collection('banners').updateOne(
      { page },
      { page, label: meta.label, title: req.body.title ?? meta.label, titleEn: req.body.titleEn || '', subtitle: req.body.subtitle || '', image: req.body.image || '', isActive: req.body.isActive !== false },
      { upsert: true },
    );
    return res.json(doc);
  } catch (e) { return next(e); }
};

base.PAGES = PAGES;
module.exports = base;
