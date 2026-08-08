const crud = require('./factory');
const { collection } = require('../lib/datastore');

const base = crud('tags', {
  event: 'tags:updated',
  searchFields: ['name'],
  slugFrom: 'name',
  slugFallback: 'tag',
  defaultSort: { name: 1 },
});

base.list = async (req, res, next) => {
  try {
    const tags = await collection('tags').find({}, { sort: { name: 1 }, limit: 0 });
    const posts = await collection('posts').find({}, { limit: 0 });
    const data = tags.map((t) => ({
      ...t,
      postsCount: posts.filter((p) => (p.tags || []).includes(t.name)).length,
    }));
    res.json({ data, total: data.length, page: 1, pages: 1 });
  } catch (e) { next(e); }
};

module.exports = base;
