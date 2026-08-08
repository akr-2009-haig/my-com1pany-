const crud = require('./factory');
const { collection } = require('../lib/datastore');

const base = crud('projectcategories', {
  event: 'projectcategories:updated',
  searchFields: ['name'],
  slugFrom: 'name',
  slugFallback: 'category',
});

/** Adds the project count to every category row. */
base.list = async (req, res, next) => {
  try {
    const cats = await collection('projectcategories').find({}, { sort: { order: 1 }, limit: 0 });
    const projects = await collection('projects').find({}, { limit: 0 });
    const data = cats.map((c) => ({
      ...c,
      projectsCount: projects.filter((p) => String(p.category) === String(c._id)).length,
    }));
    res.json({ data, total: data.length, page: 1, pages: 1 });
  } catch (e) { next(e); }
};

/** Deleting a category can either move or delete its projects. */
base.remove = async (req, res, next) => {
  try {
    const { mode = 'unassign', moveTo = '' } = req.query;
    const id = req.params.id;
    const count = await collection('projects').count({ category: id });
    if (count > 0) {
      if (mode === 'delete') await collection('projects').deleteMany({ category: id });
      else await collection('projects').updateMany({ category: id }, { category: moveTo || null });
    }
    const doc = await collection('projectcategories').deleteById(id);
    if (!doc) return res.status(404).json({ message: 'التصنيف غير موجود' });
    return res.json({ message: 'تم حذف التصنيف', movedProjects: count });
  } catch (e) { return next(e); }
};

module.exports = base;
