const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 600),
  message: { message: 'عدد كبير من الطلبات، يرجى المحاولة لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' && !req.path.startsWith('/auth'),
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'محاولات دخول كثيرة، حاول بعد قليل' },
  standardHeaders: true,
  legacyHeaders: false,
});

const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.FORM_LIMIT_MAX || 30),
  message: { message: 'تم إرسال عدد كبير من النماذج، حاول لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Recursively strips dangerous markup from string inputs. */
function deepSanitize(value) {
  if (typeof value === 'string') {
    return xss(value, { stripIgnoreTagBody: ['script', 'style', 'iframe'] });
  }
  if (Array.isArray(value)) return value.map(deepSanitize);
  if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) value[k] = deepSanitize(value[k]);
    return value;
  }
  return value;
}

/** Body keys that legitimately hold rich HTML – sanitised separately. */
const HTML_KEYS = new Set(['content', 'contentEn', 'description', 'descriptionEn', 'answer', 'answerEn',
  'requirements', 'skills', 'benefits', 'challenge', 'solution', 'bio', 'mapEmbed', 'robots', 'html']);

function xssClean(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    const preserved = {};
    for (const k of Object.keys(req.body)) if (HTML_KEYS.has(k)) preserved[k] = req.body[k];
    deepSanitize(req.body);
    Object.assign(req.body, preserved);
  }
  if (req.query && typeof req.query === 'object') deepSanitize(req.query);
  if (req.params && typeof req.params === 'object') deepSanitize(req.params);
  return next();
}

function securityMiddlewares(app) {
  app.use(mongoSanitize({ allowDots: true, replaceWith: '_' }));
  app.use(xssClean);
  app.use(hpp({ whitelist: ['price', 'tags', 'categories', 'status', 'ids'] }));
}

module.exports = { apiLimiter, authLimiter, formLimiter, securityMiddlewares, xssClean };
