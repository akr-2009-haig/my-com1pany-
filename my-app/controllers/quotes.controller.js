const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanText, clientIp } = require('../lib/helpers');
const { saveBuffer } = require('../lib/storage');
const { notifyAdmin, sendMail, layout } = require('../lib/mailer');
const emitEvent = require('../events/emitEvent');

const base = crud('quotes', {
  event: 'quotes:updated',
  searchFields: ['name', 'email', 'company', 'projectType', 'source'],
  filters: ['status', { key: 'isRead', cast: 'boolean' }],
  defaultSort: { createdAt: -1 },
  exportColumns: [
    { key: 'name', label: 'الاسم' }, { key: 'company', label: 'الشركة' }, { key: 'email', label: 'البريد' },
    { key: 'phone', label: 'الهاتف' }, { key: 'projectType', label: 'نوع المشروع' },
    { key: 'budget', label: 'الميزانية' }, { key: 'timeline', label: 'الجدول الزمني' },
    { key: 'source', label: 'كيف سمعت عنا' },
    { key: 'status', label: 'الحالة' }, { key: 'createdAt', label: 'التاريخ' },
  ],
});

base.submit = async (req, res, next) => {
  try {
    const b = req.body;
    if (b.website) return res.json({ message: 'تم الاستلام' });
    if (!b.name || !b.email) return res.status(400).json({ message: 'الاسم والبريد مطلوبان' });
    const attachments = [];
    for (const f of req.files || []) {
      const saved = await saveBuffer(f.buffer, f.originalname, f.mimetype, 'quotes');
      attachments.push({ url: saved.url, name: saved.name });
    }
    const doc = await collection('quotes').create({
      name: cleanText(b.name, 100),
      company: cleanText(b.company, 120),
      email: cleanText(b.email, 120),
      phone: cleanText(b.phone, 40),
      projectType: cleanText(b.projectType, 120),
      budget: cleanText(b.budget, 60),
      timeline: cleanText(b.timeline, 60),
      source: cleanText(b.source, 120),
      description: cleanText(b.description, 6000),
      attachments,
      ip: clientIp(req),
      status: 'new',
    });
    emitEvent('quotes:updated', { action: 'create', data: doc });
    notifyAdmin('quote', {
      title: 'طلب عرض سعر جديد',
      data: { الاسم: doc.name, الشركة: doc.company, البريد: doc.email, الهاتف: doc.phone, 'نوع المشروع': doc.projectType, الميزانية: doc.budget },
      link: '/Akramadmin/quotes',
    }).catch(() => {});
    const page = await collection('pages').findOne({ key: 'quote' });
    return res.status(201).json({ message: page?.data?.successMessage || 'تم استلام طلبك، سنرسل لك عرض السعر قريباً' });
  } catch (e) { return next(e); }
};

base.reply = async (req, res, next) => {
  try {
    const doc = await collection('quotes').findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'الطلب غير موجود' });
    const settings = await collection('settings').findOne({});
    const result = await sendMail({
      to: doc.email,
      subject: req.body.subject || `عرض السعر الخاص بك - ${settings?.siteName || ''}`,
      html: layout({ title: req.body.subject || 'عرض السعر', siteName: settings?.siteName, body: String(req.body.body || '').replace(/\n/g, '<br>') }),
    });
    if (!result.sent) return res.status(400).json({ message: `تعذّر الإرسال: ${result.reason}` });
    await collection('quotes').updateById(req.params.id, { status: 'sent', isRead: true });
    return res.json({ message: 'تم إرسال العرض بنجاح' });
  } catch (e) { return next(e); }
};

module.exports = base;
