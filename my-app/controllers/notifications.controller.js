const { collection } = require('../lib/datastore');

exports.list = async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 15);
    const [data, unread] = await Promise.all([
      collection('notifications').find({}, { sort: { createdAt: -1 }, limit }),
      collection('notifications').count({ isRead: false }),
    ]);
    res.json({ data, unread });
  } catch (e) { next(e); }
};

exports.markRead = async (req, res, next) => {
  try {
    await collection('notifications').updateById(req.params.id, { isRead: true });
    res.json({ message: 'ok' });
  } catch (e) { next(e); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await collection('notifications').updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'ok' });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    await collection('notifications').deleteById(req.params.id);
    res.json({ message: 'ok' });
  } catch (e) { next(e); }
};
