const { collection } = require('../lib/datastore');
const { parseListQuery, escapeRegex, clientIp } = require('../lib/helpers');
const blockCheck = require('../middleware/blockCheck');

exports.loginLogs = async (req, res, next) => {
  try {
    const { limit, skip, sort } = parseListQuery(req.query, { defaultSort: { createdAt: -1 } });
    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
    if (req.query.search) {
      const re = { $regex: escapeRegex(req.query.search), $options: 'i' };
      filter.$or = [{ email: re }, { ip: re }];
    }
    const [data, total] = await Promise.all([
      collection('loginlogs').find(filter, { sort, skip, limit }),
      collection('loginlogs').count(filter),
    ]);
    res.json({ data, total, pages: limit ? Math.ceil(total / limit) : 1 });
  } catch (e) { next(e); }
};

exports.activityLogs = async (req, res, next) => {
  try {
    const { limit, skip, sort } = parseListQuery(req.query, { defaultSort: { createdAt: -1 } });
    const filter = {};
    if (req.query.module && req.query.module !== 'all') filter.module = req.query.module;
    if (req.query.user && req.query.user !== 'all') filter.user = req.query.user;
    if (req.query.search) {
      const re = { $regex: escapeRegex(req.query.search), $options: 'i' };
      filter.$or = [{ userName: re }, { action: re }, { details: re }];
    }
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(`${req.query.to}T23:59:59`);
    }
    const [data, total, users] = await Promise.all([
      collection('activitylogs').find(filter, { sort, skip, limit }),
      collection('activitylogs').count(filter),
      collection('users').find({}, { limit: 0 }),
    ]);
    res.json({ data, total, pages: limit ? Math.ceil(total / limit) : 1, users: users.map((u) => ({ _id: u._id, name: u.name })) });
  } catch (e) { next(e); }
};

exports.blockedIps = async (req, res, next) => {
  try {
    const data = await collection('blockedips').find({}, { sort: { createdAt: -1 }, limit: 0 });
    res.json({ data });
  } catch (e) { next(e); }
};

exports.blockIp = async (req, res, next) => {
  try {
    const { ip, reason, minutes, permanent } = req.body;
    if (!ip) return res.status(400).json({ message: 'عنوان IP مطلوب' });
    const doc = await collection('blockedips').updateOne({ ip }, {
      ip: String(ip).trim(),
      reason: reason || 'حظر يدوي من الإدارة',
      permanent: Boolean(permanent),
      expiresAt: permanent ? null : new Date(Date.now() + (Number(minutes) || 60) * 60000),
      createdBy: req.user?.name || '',
    }, { upsert: true });
    blockCheck.invalidate(ip);
    return res.status(201).json(doc);
  } catch (e) { return next(e); }
};

exports.unblockIp = async (req, res, next) => {
  try {
    const doc = await collection('blockedips').findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'غير موجود' });
    await collection('blockedips').deleteById(req.params.id);
    blockCheck.invalidate(doc.ip);
    return res.json({ message: 'تم رفع الحظر' });
  } catch (e) { return next(e); }
};

exports.clearLogs = async (req, res, next) => {
  try {
    const type = req.params.type;
    const map = { login: 'loginlogs', activity: 'activitylogs', visits: 'visits' };
    if (!map[type]) return res.status(400).json({ message: 'نوع غير معروف' });
    const olderThan = req.query.days ? new Date(Date.now() - Number(req.query.days) * 86400000) : null;
    const n = await collection(map[type]).deleteMany(olderThan ? { createdAt: { $lt: olderThan } } : {});
    return res.json({ message: `تم حذف ${n} سجل` });
  } catch (e) { return next(e); }
};

exports.myIp = (req, res) => res.json({ ip: clientIp(req) });
