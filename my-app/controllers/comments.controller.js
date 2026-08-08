const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanText, clientIp } = require('../lib/helpers');
const { notifyAdmin } = require('../lib/mailer');
const emitEvent = require('../events/emitEvent');

const base = crud('comments', {
  event: 'comments:updated',
  searchFields: ['name', 'email', 'content'],
  filters: ['status', 'post'],
  defaultSort: { createdAt: -1 },
});

/** Public comment submission – always starts as "pending". */
base.submit = async (req, res, next) => {
  try {
    const { postId, name, email, content, website } = req.body;
    if (!postId || !name || !email || !content) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }
    if (website) return res.json({ message: 'تم الاستلام' }); // honeypot
    const post = await collection('posts').findById(postId);
    if (!post) return res.status(404).json({ message: 'المقال غير موجود' });
    const doc = await collection('comments').create({
      post: String(post._id),
      postTitle: post.title,
      name: cleanText(name, 80),
      email: cleanText(email, 120),
      content: cleanText(content, 2000),
      status: 'pending',
      ip: clientIp(req),
    });
    emitEvent('comments:updated', { action: 'create', data: doc });
    notifyAdmin('comment', {
      title: 'تعليق جديد بانتظار الموافقة',
      data: { الاسم: doc.name, البريد: doc.email, المقال: post.title, التعليق: doc.content },
      link: '/Akramadmin/blog/comments',
    }).catch(() => {});
    return res.status(201).json({ message: 'تم إرسال تعليقك وسيظهر بعد موافقة الإدارة' });
  } catch (e) { return next(e); }
};

base.setStatus = async (req, res, next) => {
  try {
    const doc = await collection('comments').updateById(req.params.id, { status: req.body.status });
    if (!doc) return res.status(404).json({ message: 'التعليق غير موجود' });
    emitEvent('comments:updated', { action: 'update', data: doc });
    return res.json(doc);
  } catch (e) { return next(e); }
};

module.exports = base;
