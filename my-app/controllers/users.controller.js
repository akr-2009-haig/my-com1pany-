const bcrypt = require('bcryptjs');
const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanText, parseListQuery, escapeRegex } = require('../lib/helpers');
const { passwordIssues } = require('./auth.controller');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);
const base = crud('users', { event: 'users:updated', searchFields: ['name', 'email', 'username'], filters: ['role', { key: 'isActive', cast: 'boolean' }] });

base.list = async (req, res, next) => {
  try {
    const { limit, skip, sort } = parseListQuery(req.query, { defaultSort: { createdAt: -1 } });
    const filter = {};
    if (req.query.search) {
      const re = { $regex: escapeRegex(req.query.search), $options: 'i' };
      filter.$or = [{ name: re }, { email: re }, { username: re }];
    }
    if (req.query.role && req.query.role !== 'all') filter.role = req.query.role;
    const [rows, total, roles] = await Promise.all([
      collection('users').find(filter, { sort, skip, limit }),
      collection('users').count(filter),
      collection('roles').find({}, { limit: 0 }),
    ]);
    const roleMap = new Map(roles.map((r) => [r.slug, r.name]));
    res.json({
      data: rows.map((u) => ({ ...u, roleName: roleMap.get(u.role) || u.role })),
      total, page: limit ? Math.floor(skip / limit) + 1 : 1, pages: limit ? Math.ceil(total / limit) : 1,
    });
  } catch (e) { next(e); }
};

base.create = async (req, res, next) => {
  try {
    const { name, email, username, password, role, avatar, isActive, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'الاسم والبريد وكلمة المرور مطلوبة' });
    const issues = passwordIssues(password);
    if (issues.length) return res.status(400).json({ message: `كلمة المرور ضعيفة، يجب أن تحتوي: ${issues.join('، ')}` });
    const lower = String(email).toLowerCase().trim();
    if (await collection('users').findOne({ email: lower })) return res.status(409).json({ message: 'البريد مستخدم بالفعل' });
    const roleDoc = await collection('roles').findOne({ slug: role });
    const doc = await collection('users').create({
      name: cleanText(name, 100), email: lower, username: cleanText(username, 60),
      password: await bcrypt.hash(password, ROUNDS),
      role: roleDoc ? roleDoc.slug : 'viewer',
      avatar: avatar || '', phone: cleanText(phone, 40),
      isActive: isActive !== false,
    });
    return res.status(201).json(doc);
  } catch (e) { return next(e); }
};

base.update = async (req, res, next) => {
  try {
    const { name, email, username, password, role, avatar, isActive, phone, bio } = req.body;
    const user = await collection('users').findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    const patch = {};
    if (name) patch.name = cleanText(name, 100);
    if (email) {
      const lower = String(email).toLowerCase().trim();
      const dup = await collection('users').findOne({ email: lower });
      if (dup && String(dup._id) !== String(user._id)) return res.status(409).json({ message: 'البريد مستخدم بالفعل' });
      patch.email = lower;
    }
    if (username !== undefined) patch.username = cleanText(username, 60);
    if (avatar !== undefined) patch.avatar = avatar;
    if (phone !== undefined) patch.phone = cleanText(phone, 40);
    if (bio !== undefined) patch.bio = cleanText(bio, 500);
    if (isActive !== undefined) patch.isActive = Boolean(isActive);
    if (role) patch.role = role;
    if (password) {
      const issues = passwordIssues(password);
      if (issues.length) return res.status(400).json({ message: `كلمة المرور ضعيفة، يجب أن تحتوي: ${issues.join('، ')}` });
      patch.password = await bcrypt.hash(password, ROUNDS);
    }
    // never allow the last active admin to be demoted or disabled
    if (user.role === 'admin' && (patch.role && patch.role !== 'admin' || patch.isActive === false)) {
      const admins = await collection('users').count({ role: 'admin', isActive: true });
      if (admins <= 1) return res.status(400).json({ message: 'لا يمكن تعطيل آخر مدير عام في النظام' });
    }
    const doc = await collection('users').updateById(req.params.id, patch);
    return res.json(doc);
  } catch (e) { return next(e); }
};

base.remove = async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user.id)) return res.status(400).json({ message: 'لا يمكنك حذف حسابك الحالي' });
    const user = await collection('users').findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    if (user.role === 'admin') {
      const admins = await collection('users').count({ role: 'admin' });
      if (admins <= 1) return res.status(400).json({ message: 'لا يمكن حذف آخر مدير عام' });
    }
    await collection('users').deleteById(req.params.id);
    return res.json({ message: 'تم حذف المستخدم' });
  } catch (e) { return next(e); }
};

module.exports = base;
