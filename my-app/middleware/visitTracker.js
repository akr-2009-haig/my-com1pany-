const crypto = require('crypto');
const { UAParser } = require('ua-parser-js');
const { collection, isReady } = require('../lib/datastore');
const { clientIp } = require('../lib/helpers');

const SKIP = [/^\/_next/, /^\/api/, /^\/Akramadmin/, /^\/uploads/, /\.(ico|png|jpg|jpeg|svg|webp|css|js|map|txt|xml|woff2?)$/i];
const SEARCH = /google\.|bing\.|yahoo\.|duckduckgo|yandex|baidu/i;
const SOCIAL = /facebook\.|twitter\.|x\.com|instagram\.|linkedin\.|t\.co|youtube\.|tiktok\.|pinterest\./i;

function sourceOf(referrer, host) {
  if (!referrer) return 'direct';
  try {
    const u = new URL(referrer);
    if (host && u.host === host) return 'internal';
    if (SEARCH.test(u.host)) return 'search';
    if (SOCIAL.test(u.host)) return 'social';
    return 'referral';
  } catch (e) { return 'direct'; }
}

/** Lightweight first-party page-view tracking (no third-party cookies). */
async function visitTracker(req, res, next) {
  try {
    if (req.method !== 'GET' || !isReady()) return next();
    if (SKIP.some((re) => re.test(req.path))) return next();
    if (/bot|crawler|spider|crawling|preview|lighthouse/i.test(req.headers['user-agent'] || '')) return next();

    let sid = req.cookies?.sid;
    if (!sid) {
      sid = crypto.randomBytes(12).toString('hex');
      res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 60 * 1000, secure: process.env.NODE_ENV === 'production' });
    }
    const ua = new UAParser(req.headers['user-agent'] || '');
    const device = ua.getDevice().type || 'desktop';
    const referrer = req.headers.referer || '';
    const existing = await collection('visits').count({ sessionId: sid });

    await collection('visits').create({
      path: req.path.slice(0, 200),
      referrer: referrer.slice(0, 300),
      source: sourceOf(referrer, req.headers.host),
      device: device === 'mobile' ? 'mobile' : device === 'tablet' ? 'tablet' : 'desktop',
      browser: ua.getBrowser().name || 'Unknown',
      os: ua.getOS().name || 'Unknown',
      ip: clientIp(req),
      sessionId: sid,
      isBounce: existing === 0,
    });
    if (existing === 1) {
      await collection('visits').updateOne({ sessionId: sid, isBounce: true }, { isBounce: false });
    }
  } catch (e) { /* never break page delivery */ }
  return next();
}

module.exports = visitTracker;
