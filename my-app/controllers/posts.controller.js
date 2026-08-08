const crud = require('./factory');
const { collection } = require('../lib/datastore');
const { cleanHtml, readingTime, excerptFrom, escapeRegex, parseListQuery, uniqueSlug } = require('../lib/helpers');

const base = crud('posts', {
  event: 'posts:updated',
  searchFields: ['title', 'excerpt', 'slug', 'tags'],
  filters: ['status', 'author', { key: 'isFeatured', cast: 'boolean' }],
  defaultSort: { createdAt: -1 },
  slugFrom: 'title',
  slugFallback: 'post',
  populate: ['author'],
});

async function prepare(body, req) {
  const content = cleanHtml(body.content);
  const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [];
  // auto-register new tags
  for (const name of tags) {
    const exists = await collection('tags').findOne({ name });
    if (!exists) {
      await collection('tags').create({ name, slug: await uniqueSlug(collection('tags'), name, null, 'tag') });
    }
  }
  return {
    ...body,
    content,
    contentEn: cleanHtml(body.contentEn),
    tags,
    categories: Array.isArray(body.categories) ? body.categories.filter(Boolean).map(String) : [],
    excerpt: body.excerpt || excerptFrom(content),
    readTime: readingTime(content),
    author: body.author || req?.user?.id || null,
    authorName: body.authorName || req?.user?.name || '',
    publishAt: body.status === 'scheduled' ? body.publishAt : (body.publishAt || new Date()),
  };
}

base.create = (() => {
  const original = base.create;
  return async (req, res, next) => {
    try { req.body = await prepare(req.body, req); } catch (e) { return next(e); }
    return original(req, res, next);
  };
})();

base.update = (() => {
  const original = base.update;
  return async (req, res, next) => {
    try { req.body = await prepare(req.body, req); } catch (e) { return next(e); }
    return original(req, res, next);
  };
})();

/** Admin list enriched with resolved category names. */
base.list = async (req, res, next) => {
  try {
    const { limit, skip, sort } = parseListQuery(req.query, { defaultSort: { createdAt: -1 }, maxLimit: 200 });
    const filter = base.buildFilter(req.query);
    if (req.query.category && req.query.category !== 'all') filter.categories = req.query.category;
    const [rows, total, cats] = await Promise.all([
      collection('posts').find(filter, { sort, skip, limit }),
      collection('posts').count(filter),
      collection('postcategories').find({}, { limit: 0 }),
    ]);
    const catMap = new Map(cats.map((c) => [String(c._id), c]));
    const data = rows.map((p) => ({
      ...p,
      categoryNames: (p.categories || []).map((c) => catMap.get(String(c))?.name).filter(Boolean),
    }));
    res.json({ data, total, page: limit ? Math.floor(skip / limit) + 1 : 1, pages: limit ? Math.ceil(total / limit) : 1, limit });
  } catch (e) { next(e); }
};

/** Public blog listing: published only + search + category/tag filters. */
base.publicList = async (req, res, next) => {
  try {
    const { limit, skip } = parseListQuery(req.query, { defaultSort: { createdAt: -1 }, maxLimit: 50 });
    const filter = { status: 'published' };
    if (req.query.search) {
      const re = { $regex: escapeRegex(req.query.search), $options: 'i' };
      filter.$or = [{ title: re }, { excerpt: re }, { content: re }];
    }
    if (req.query.category) {
      const cat = await collection('postcategories').findOne({ slug: req.query.category });
      if (cat) filter.categories = String(cat._id);
    }
    if (req.query.tag) filter.tags = req.query.tag;
    const [rows, total] = await Promise.all([
      collection('posts').find(filter, { sort: { createdAt: -1 }, skip, limit }),
      collection('posts').count(filter),
    ]);
    res.json({ data: rows, total, pages: limit ? Math.ceil(total / limit) : 1 });
  } catch (e) { next(e); }
};

base.publicOne = async (req, res, next) => {
  try {
    const post = await collection('posts').findOne({ slug: req.params.slug, status: 'published' });
    if (!post) return res.status(404).json({ message: 'المقال غير موجود' });
    await collection('posts').increment(post._id, 'views', 1);
    const [prev, next_, related, comments] = await Promise.all([
      collection('posts').find({ status: 'published', createdAt: { $lt: post.createdAt } }, { sort: { createdAt: -1 }, limit: 1 }),
      collection('posts').find({ status: 'published', createdAt: { $gt: post.createdAt } }, { sort: { createdAt: 1 }, limit: 1 }),
      collection('posts').find({ status: 'published', _id: { $ne: post._id } }, { sort: { createdAt: -1 }, limit: 3 }),
      collection('comments').find({ post: String(post._id), status: 'approved' }, { sort: { createdAt: 1 }, limit: 0 }),
    ]);
    return res.json({ post, prev: prev[0] || null, next: next_[0] || null, related, comments });
  } catch (e) { return next(e); }
};

module.exports = base;
