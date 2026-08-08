const { collection } = require('../lib/datastore');
const { clientIp } = require('../lib/helpers');

const ACTION_LABELS = { POST: 'إضافة', PUT: 'تعديل', PATCH: 'تعديل', DELETE: 'حذف' };

/** Records every mutating admin request into the activity log. */
function activityLogger(moduleName) {
  return (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 400 && req.user) {
        const target = body && (body.title || body.name || body.question || body.email || body.label);
        collection('activitylogs').create({
          user: req.user.id,
          userName: req.user.name || req.user.email,
          action: `${ACTION_LABELS[req.method] || req.method} ${moduleName}`,
          module: moduleName,
          details: target ? String(target).slice(0, 200) : `${req.method} ${req.originalUrl}`,
          ip: clientIp(req),
          userAgent: req.headers['user-agent'] || '',
        }).catch(() => {});
      }
      return originalJson(body);
    };
    return next();
  };
}

module.exports = activityLogger;
