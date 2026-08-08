const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { MODULES, fullPermissions } = require('../lib/permissions');
const { makeSlug } = require('../lib/helpers');

const base = crud('roles', { event: 'roles:updated', searchFields: ['name', 'slug'], defaultSort: { createdAt: 1 } });

base.list = async (req, res, next) => {
  try {
    const [roles, users] = await Promise.all([
      collection('roles').find({}, { sort: { createdAt: 1 }, limit: 0 }),
      collection('users').find({}, { limit: 0 }),
    ]);
    const data = roles.map((r) => ({ ...r, usersCount: users.filter((u) => u.role === r.slug).length }));
    res.json({ data, modules: MODULES, total: data.length });
  } catch (e) { next(e); }
};

base.create = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;
    if (!name) return res.status(400).json({ message: 'اسم الدور مطلوب' });
    const slug = makeSlug(req.body.slug || name, 'role');
    if (await collection('roles').findOne({ slug })) return res.status(409).json({ message: 'يوجد دور بنفس المعرف' });
    const doc = await collection('roles').create({
      name, slug, description: description || '',
      permissions: { ...fullPermissions(false), ...(permissions || {}) },
      isSystem: false,
    });
    return res.status(201).json(doc);
  } catch (e) { return next(e); }
};

base.update = async (req, res, next) => {
  try {
    const role = await collection('roles').findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'الدور غير موجود' });
    const patch = {};
    if (req.body.name) patch.name = req.body.name;
    if (req.body.description !== undefined) patch.description = req.body.description;
    if (req.body.permissions) {
      patch.permissions = role.slug === 'admin' ? fullPermissions(true) : req.body.permissions;
    }
    const doc = await collection('roles').updateById(req.params.id, patch);
    return res.json(doc);
  } catch (e) { return next(e); }
};

base.remove = async (req, res, next) => {
  try {
    const role = await collection('roles').findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'الدور غير موجود' });
    if (role.isSystem) return res.status(400).json({ message: 'لا يمكن حذف الأدوار الأساسية' });
    const inUse = await collection('users').count({ role: role.slug });
    if (inUse) return res.status(400).json({ message: `هذا الدور مستخدم من قبل ${inUse} مستخدم` });
    await collection('roles').deleteById(req.params.id);
    return res.json({ message: 'تم حذف الدور' });
  } catch (e) { return next(e); }
};

base.modules = (req, res) => res.json({ modules: MODULES });
module.exports = base;
