const { collection } = require('../lib/datastore');
const emitEvent = require('../events/emitEvent');
const { parseListQuery, escapeRegex, uniqueSlug, toCSV } = require('../lib/helpers');

/**
 * Generates a complete REST controller (list / read / create / update /
 * delete / toggle / reorder / bulk / export) for a collection.
 * Individual controllers extend or override the pieces they need.
 */
function crud(name, options = {}) {
  const {
    event = `${name}:updated`,
    searchFields = [],
    filters = [],
    populate = [],
    defaultSort = { order: 1, createdAt: -1 },
    slugFrom = null,
    slugFallback = name,
    transformIn = null,
    transformOut = null,
    afterChange = null,
    exportColumns = null,
  } = options;

  const coll = () => collection(name);

  function buildFilter(query) {
    const filter = {};
    if (query.search && searchFields.length) {
      const re = { $regex: escapeRegex(query.search), $options: 'i' };
      filter.$or = searchFields.map((f) => ({ [f]: re }));
    }
    filters.forEach((f) => {
      const key = typeof f === 'string' ? f : f.key;
      const field = typeof f === 'string' ? f : (f.field || f.key);
      const raw = query[key];
      if (raw === undefined || raw === '' || raw === 'all') return;
      if (typeof f === 'object' && f.cast === 'boolean') filter[field] = raw === 'true' || raw === true;
      else filter[field] = raw;
    });
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(`${query.to}T23:59:59`);
    }
    return filter;
  }

  const ctrl = {
    coll,
    buildFilter,

    async list(req, res, next) {
      try {
        const { limit, skip, sort } = parseListQuery(req.query, { defaultSort, maxLimit: 500 });
        const filter = buildFilter(req.query);
        const [data, total] = await Promise.all([
          coll().find(filter, { sort, skip, limit, populate }),
          coll().count(filter),
        ]);
        res.json({
          data: transformOut ? data.map(transformOut) : data,
          total,
          page: limit ? Math.floor(skip / limit) + 1 : 1,
          pages: limit ? Math.ceil(total / limit) : 1,
          limit,
        });
      } catch (e) { next(e); }
    },

    async getOne(req, res, next) {
      try {
        const doc = await coll().findById(req.params.id, { populate });
        if (!doc) return res.status(404).json({ message: 'العنصر غير موجود' });
        return res.json(transformOut ? transformOut(doc) : doc);
      } catch (e) { return next(e); }
    },

    async getBySlug(req, res, next) {
      try {
        const doc = await coll().findOne({ slug: req.params.slug }, { populate });
        if (!doc) return res.status(404).json({ message: 'العنصر غير موجود' });
        return res.json(transformOut ? transformOut(doc) : doc);
      } catch (e) { return next(e); }
    },

    async create(req, res, next) {
      try {
        let body = { ...req.body };
        if (transformIn) body = await transformIn(body, req, null);
        if (slugFrom) body.slug = await uniqueSlug(coll(), body.slug || body[slugFrom], null, slugFallback);
        if (body.order === undefined || body.order === null || body.order === '') {
          body.order = await coll().count({});
        }
        const doc = await coll().create(body);
        emitEvent(event, { action: 'create', data: doc });
        if (afterChange) await afterChange('create', doc, req);
        return res.status(201).json(doc);
      } catch (e) { return next(e); }
    },

    async update(req, res, next) {
      try {
        const current = await coll().findById(req.params.id);
        if (!current) return res.status(404).json({ message: 'العنصر غير موجود' });
        let body = { ...req.body };
        delete body._id;
        if (transformIn) body = await transformIn(body, req, current);
        if (slugFrom && (body.slug || body[slugFrom])) {
          body.slug = await uniqueSlug(coll(), body.slug || body[slugFrom], req.params.id, slugFallback);
        }
        const doc = await coll().updateById(req.params.id, body);
        emitEvent(event, { action: 'update', data: doc });
        if (afterChange) await afterChange('update', doc, req);
        return res.json(doc);
      } catch (e) { return next(e); }
    },

    async remove(req, res, next) {
      try {
        const doc = await coll().deleteById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'العنصر غير موجود' });
        emitEvent(event, { action: 'delete', id: req.params.id });
        if (afterChange) await afterChange('delete', doc, req);
        return res.json({ message: 'تم الحذف بنجاح', id: req.params.id });
      } catch (e) { return next(e); }
    },

    /** PATCH /:id/toggle  – flips a boolean field (default isActive). */
    async toggle(req, res, next) {
      try {
        const field = req.body.field || 'isActive';
        const doc = await coll().findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'العنصر غير موجود' });
        const value = req.body.value !== undefined ? Boolean(req.body.value) : !doc[field];
        const updated = await coll().updateById(req.params.id, { [field]: value });
        emitEvent(event, { action: 'toggle', data: updated });
        if (afterChange) await afterChange('toggle', updated, req);
        return res.json(updated);
      } catch (e) { return next(e); }
    },

    /** PUT /reorder – body: { items: [{ _id, order }] } */
    async reorder(req, res, next) {
      try {
        await coll().reorder(req.body.items || []);
        emitEvent(event, { action: 'reorder' });
        return res.json({ message: 'تم حفظ الترتيب' });
      } catch (e) { return next(e); }
    },

    /** POST /bulk – body: { ids: [], action: 'delete'|'activate'|'deactivate'|'status', value } */
    async bulk(req, res, next) {
      try {
        const { ids = [], action, field = 'status', value } = req.body;
        if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'لم يتم تحديد أي عنصر' });
        const filter = { _id: { $in: ids.map(String) } };
        let affected = 0;
        if (action === 'delete') affected = await coll().deleteMany(filter);
        else if (action === 'activate') affected = await coll().updateMany(filter, { isActive: true });
        else if (action === 'deactivate') affected = await coll().updateMany(filter, { isActive: false });
        else if (action === 'read') affected = await coll().updateMany(filter, { isRead: true });
        else if (action === 'unread') affected = await coll().updateMany(filter, { isRead: false });
        else if (action === 'status') affected = await coll().updateMany(filter, { [field]: value });
        else return res.status(400).json({ message: 'إجراء غير معروف' });
        emitEvent(event, { action: 'bulk' });
        return res.json({ message: `تم تنفيذ الإجراء على ${affected} عنصر`, affected });
      } catch (e) { return next(e); }
    },

    /** GET /export?format=csv */
    async exportData(req, res, next) {
      try {
        const filter = buildFilter(req.query);
        const rows = await coll().find(filter, { sort: defaultSort, limit: 0, populate });
        const cols = exportColumns
          || Object.keys(rows[0] || { _id: '' }).filter((k) => k !== '__v').map((k) => ({ key: k, label: k }));
        const csv = toCSV(rows, cols);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${name}-${Date.now()}.csv"`);
        return res.send(csv);
      } catch (e) { return next(e); }
    },
  };

  return ctrl;
}

module.exports = crud;
