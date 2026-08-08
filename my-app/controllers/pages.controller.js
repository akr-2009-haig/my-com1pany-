const { collection } = require('../lib/datastore');
const { cleanHtml } = require('../lib/helpers');
const emitEvent = require('../events/emitEvent');

/** Editable singleton pages, addressed by a stable key. */
const KEYS = {
  about: 'صفحة من نحن',
  'about-section': 'قسم من نحن بالرئيسية',
  whyus: 'قسم لماذا تختارنا',
  cta: 'قسم دعوة لاتخاذ إجراء',
  'vision-mission': 'الرؤية والرسالة والقيم',
  contact: 'إعدادات صفحة تواصل معنا',
  quote: 'إعدادات صفحة طلب عرض سعر',
  privacy: 'سياسة الخصوصية',
  terms: 'الشروط والأحكام',
  notfound: 'صفحة 404',
  careers: 'ثقافة العمل',
};

exports.get = async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!KEYS[key]) return res.status(404).json({ message: 'صفحة غير معروفة' });
    let doc = await collection('pages').findOne({ key });
    if (!doc) doc = await collection('pages').create({ key, title: KEYS[key], content: '', data: {} });
    return res.json(doc);
  } catch (e) { return next(e); }
};

exports.save = async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!KEYS[key]) return res.status(404).json({ message: 'صفحة غير معروفة' });
    const patch = {
      key,
      title: req.body.title ?? KEYS[key],
      content: cleanHtml(req.body.content || ''),
      contentEn: cleanHtml(req.body.contentEn || ''),
      data: req.body.data && typeof req.body.data === 'object' ? req.body.data : {},
      updatedBy: req.user?.name || '',
    };
    const doc = await collection('pages').updateOne({ key }, patch, { upsert: true });
    emitEvent('pages:updated', { key, data: doc });
    return res.json(doc);
  } catch (e) { return next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const docs = await collection('pages').find({}, { limit: 0 });
    res.json({ data: docs, keys: KEYS });
  } catch (e) { next(e); }
};

exports.KEYS = KEYS;
