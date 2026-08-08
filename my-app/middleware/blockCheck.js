const { collection, isReady } = require('../lib/datastore');
const { clientIp } = require('../lib/helpers');

const cache = new Map(); // ip -> { blocked, until }
const TTL = 30 * 1000;

async function blockCheck(req, res, next) {
  if (!isReady()) return next();
  if (req.path === '/api/health') return next();
  const ip = clientIp(req);
  if (!ip) return next();

  const cached = cache.get(ip);
  if (cached && cached.checkedAt > Date.now() - TTL) {
    if (!cached.blocked) return next();
  }

  try {
    const blocked = await collection('blockedips').findOne({ ip });
    if (blocked) {
      const expired = !blocked.permanent && blocked.expiresAt && new Date(blocked.expiresAt) < new Date();
      if (expired) {
        await collection('blockedips').deleteById(blocked._id).catch(() => {});
        cache.set(ip, { blocked: false, checkedAt: Date.now() });
        return next();
      }
      cache.set(ip, { blocked: true, checkedAt: Date.now() });
      if (req.path.startsWith('/api')) {
        return res.status(403).json({ message: 'تم حظر عنوان الـ IP الخاص بك. يرجى التواصل مع الإدارة.' });
      }
      return res.status(403).send('<html dir="rtl"><body style="font-family:sans-serif;text-align:center;padding:80px"><h1>403</h1><p>تم حظر الوصول من عنوانك.</p></body></html>');
    }
    cache.set(ip, { blocked: false, checkedAt: Date.now() });
  } catch (e) { /* fail open */ }
  return next();
}

blockCheck.invalidate = (ip) => cache.delete(ip);
module.exports = blockCheck;
