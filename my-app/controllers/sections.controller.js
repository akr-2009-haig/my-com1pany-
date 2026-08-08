const { collection } = require('../lib/datastore');
const emitEvent = require('../events/emitEvent');

const DEFAULT_SECTIONS = [
  { key: 'hero', label: 'السلايدر الرئيسي' },
  { key: 'stats', label: 'شريط الإحصائيات' },
  { key: 'about', label: 'من نحن (مختصر)' },
  { key: 'services', label: 'خدماتنا' },
  { key: 'whyus', label: 'لماذا تختارنا' },
  { key: 'portfolio', label: 'أحدث المشاريع' },
  { key: 'testimonials', label: 'آراء العملاء' },
  { key: 'pricing', label: 'الباقات والأسعار' },
  { key: 'partners', label: 'شركاؤنا' },
  { key: 'blog', label: 'أحدث المقالات' },
  { key: 'cta', label: 'دعوة لاتخاذ إجراء' },
  { key: 'contact', label: 'تواصل معنا (مختصر)' },
];

async function ensure() {
  const existing = await collection('sections').find({}, { limit: 0 });
  if (existing.length >= DEFAULT_SECTIONS.length) return existing;
  const map = new Map(existing.map((s) => [s.key, s]));
  for (let i = 0; i < DEFAULT_SECTIONS.length; i += 1) {
    const d = DEFAULT_SECTIONS[i];
    if (!map.has(d.key)) await collection('sections').create({ ...d, order: i, isVisible: true });
  }
  return collection('sections').find({}, { sort: { order: 1 }, limit: 0 });
}

exports.list = async (req, res, next) => {
  try {
    await ensure();
    const data = await collection('sections').find({}, { sort: { order: 1 }, limit: 0 });
    res.json({ data });
  } catch (e) { next(e); }
};

exports.reorder = async (req, res, next) => {
  try {
    const items = req.body.items || [];
    for (let i = 0; i < items.length; i += 1) {
      await collection('sections').updateOne({ key: items[i].key }, { order: i, isVisible: items[i].isVisible !== false });
    }
    emitEvent('sections:updated', { action: 'reorder' });
    res.json({ message: 'تم حفظ ترتيب الأقسام' });
  } catch (e) { next(e); }
};

exports.toggle = async (req, res, next) => {
  try {
    const doc = await collection('sections').findOne({ key: req.params.key });
    if (!doc) return res.status(404).json({ message: 'القسم غير موجود' });
    const updated = await collection('sections').updateOne({ key: req.params.key }, { isVisible: !doc.isVisible });
    emitEvent('sections:updated', { action: 'toggle', data: updated });
    return res.json(updated);
  } catch (e) { return next(e); }
};

exports.ensure = ensure;
exports.DEFAULT_SECTIONS = DEFAULT_SECTIONS;
