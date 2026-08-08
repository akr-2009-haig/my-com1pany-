const crud = require('./factory');
const { collection } = require('../lib/datastore');

const base = crud('menus', {
  event: 'menus:updated',
  searchFields: ['title', 'url'],
  filters: ['location', { key: 'isActive', cast: 'boolean' }],
  defaultSort: { order: 1 },
});

/** Returns menu items nested one level deep (for dropdowns). */
base.tree = async (req, res, next) => {
  try {
    const location = req.query.location || 'header';
    const items = await collection('menus').find({ location, isActive: true }, { sort: { order: 1 }, limit: 0 });
    const roots = items.filter((i) => !i.parent);
    const data = roots.map((r) => ({ ...r, children: items.filter((i) => String(i.parent) === String(r._id)) }));
    res.json({ data });
  } catch (e) { next(e); }
};

module.exports = base;
