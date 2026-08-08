const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanText, clientIp } = require('../lib/helpers');
const { notifyAdmin, sendMail, layout } = require('../lib/mailer');
const emitEvent = require('../events/emitEvent');

const base = crud('messages', {
  event: 'messages:updated',
  searchFields: ['name', 'email', 'phone', 'message', 'subject'],
  filters: ['status', { key: 'isRead', cast: 'boolean' }],
  defaultSort: { createdAt: -1 },
  exportColumns: [
    { key: 'name', label: 'الاسم' }, { key: 'email', label: 'البريد' }, { key: 'phone', label: 'الهاتف' },
    { key: 'service', label: 'الخدمة' }, { key: 'subject', label: 'الموضوع' },
    { key: 'message', label: 'الرسالة' }, { key: 'status', label: 'الحالة' }, { key: 'createdAt', label: 'التاريخ' },
  ],
});

base.submit = async (req, res, next) => {
  try {
    const { name, email, phone, service, subject, message, website } = req.body;
    if (website) return res.json({ message: 'تم الاستلام' });
    if (!name || !email || !message) return res.status(400).json({ message: 'الاسم والبريد والرسالة حقول مطلوبة' });
    const doc = await collection('messages').create({
      name: cleanText(name, 100),
      email: cleanText(email, 120),
      phone: cleanText(phone, 40),
      service: cleanText(service, 120),
      subject: cleanText(subject, 200),
      message: cleanText(message, 5000),
      ip: clientIp(req),
      status: 'new',
    });
    emitEvent('messages:updated', { action: 'create', data: doc });
    notifyAdmin('message', {
      title: 'رسالة تواصل جديدة',
      data: { الاسم: doc.name, البريد: doc.email, الهاتف: doc.phone, الخدمة: doc.service, الرسالة: doc.message },
      link: '/Akramadmin/messages',
    }).catch(() => {});
    const page = await collection('pages').findOne({ key: 'contact' });
    return res.status(201).json({ message: page?.data?.successMessage || 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً' });
  } catch (e) { return next(e); }
};

base.markRead = async (req, res, next) => {
  try {
    const doc = await collection('messages').updateById(req.params.id, { isRead: true, status: req.body.status || 'read' });
    if (!doc) return res.status(404).json({ message: 'الرسالة غير موجودة' });
    emitEvent('messages:updated', { action: 'update', data: doc });
    return res.json(doc);
  } catch (e) { return next(e); }
};

/** Reply to a lead directly from the dashboard. */
base.reply = async (req, res, next) => {
  try {
    const { subject, body } = req.body;
    const doc = await collection('messages').findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'الرسالة غير موجودة' });
    const settings = await collection('settings').findOne({});
    const result = await sendMail({
      to: doc.email,
      subject: subject || `رد على رسالتك - ${settings?.siteName || ''}`,
      html: layout({ title: subject || 'رد على رسالتك', siteName: settings?.siteName, body: String(body || '').replace(/\n/g, '<br>') }),
    });
    if (!result.sent) return res.status(400).json({ message: `تعذّر إرسال البريد: ${result.reason}` });
    await collection('messages').updateById(req.params.id, { status: 'replied', isRead: true });
    return res.json({ message: 'تم إرسال الرد بنجاح' });
  } catch (e) { return next(e); }
};

module.exports = base;
