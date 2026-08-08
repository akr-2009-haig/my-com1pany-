const crud = require('./factory');
const { collection } = require('../lib/datastore');

const base = crud('postcategories', {
  event: 'postcategories:updated',
  searchFields: ['name'],
  slugFrom: 'name',
  slugFallback: 'category',
});

base.list = async (req, res, next) => {
  try {
    const cats = await collection('postcategories').find({}, { sort: { order: 1 }, limit: 0 });
    const posts = await collection('posts').find({}, { limit: 0 });
    const data = cats.map((c) => ({
      ...c,
      postsCount: posts.filter((p) => (p.categories || []).map(String).includes(String(c._id))).length,
    }));
    res.json({ data, total: data.length, page: 1, pages: 1 });
  } catch (e) { next(e); }
};

base.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const posts = await collection('posts').find({ categories: id }, { limit: 0 });
    for (const p of posts) {
      await collection('posts').updateById(p._id, { categories: (p.categories || []).filter((c) => String(c) !== String(id)) });
    }
    const doc = await collection('postcategories').deleteById(id);
    if (!doc) return res.status(404).json({ message: 'التصنيف غير موجود' });
    return res.json({ message: 'تم حذف التصنيف' });
  } catch (e) { return next(e); }
};

module.exports = base;
