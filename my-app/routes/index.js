const express = require('express');
const { verifyToken, requirePermission } = require('../middleware/auth');
const activityLogger = require('../middleware/activityLogger');
const { authLimiter, formLimiter } = require('../middleware/security');
const upload = require('../middleware/upload');

/**
 * Mounts the conventional REST surface for a factory controller.
 * Public GET routes stay open; every mutation requires the matching permission.
 */
function rest(ctrl, moduleKey, { publicRead = true, slug = false, extra = null } = {}) {
  const r = express.Router();
  const guard = (action) => [verifyToken, requirePermission(moduleKey, action), activityLogger(moduleKey)];

  if (extra) extra(r, guard);

  r.get('/', publicRead ? [] : [verifyToken, requirePermission(moduleKey, 'view')], ctrl.list);
  r.get('/export', verifyToken, requirePermission(moduleKey, 'view'), ctrl.exportData);
  if (slug) r.get('/slug/:slug', ctrl.getBySlug);
  r.get('/:id', publicRead ? [] : [verifyToken, requirePermission(moduleKey, 'view')], ctrl.getOne);

  r.post('/', guard('create'), ctrl.create);
  r.post('/bulk', guard('delete'), ctrl.bulk);
  r.put('/reorder', guard('edit'), ctrl.reorder);
  r.put('/:id', guard('edit'), ctrl.update);
  r.patch('/:id/toggle', guard('toggle'), ctrl.toggle);
  r.delete('/:id', guard('delete'), ctrl.remove);
  return r;
}

function buildRoutes() {
  const api = express.Router();

  /* ----------------------------- auth ------------------------------ */
  const auth = require('../controllers/auth.controller');
  const a = express.Router();
  a.post('/login', authLimiter, auth.login);
  a.post('/2fa', authLimiter, auth.verifyTwoFactor);
  a.post('/forgot-password', authLimiter, auth.forgotPassword);
  a.post('/reset-password', authLimiter, auth.resetPassword);
  a.post('/logout', auth.logout);
  a.get('/me', verifyToken, auth.me);
  a.put('/profile', verifyToken, auth.updateProfile);
  a.put('/password', verifyToken, auth.changePassword);
  api.use('/auth', a);

  /* -------------------------- home page ---------------------------- */
  api.use('/slides', rest(require('../controllers/slides.controller'), 'slides'));
  api.use('/stats', rest(require('../controllers/stats.controller'), 'stats'));

  const sections = require('../controllers/sections.controller');
  const sr = express.Router();
  sr.get('/', sections.list);
  sr.put('/reorder', verifyToken, requirePermission('homepage', 'edit'), activityLogger('homepage'), sections.reorder);
  sr.patch('/:key/toggle', verifyToken, requirePermission('homepage', 'toggle'), activityLogger('homepage'), sections.toggle);
  api.use('/sections', sr);

  /* --------------------------- services ---------------------------- */
  api.use('/services', rest(require('../controllers/services.controller'), 'services', {
    slug: true,
    extra: (r) => { r.get('/public/:slug', require('../controllers/services.controller').publicOne); },
  }));

  /* --------------------------- portfolio --------------------------- */
  api.use('/project-categories', rest(require('../controllers/projectcategories.controller'), 'portfolio', { slug: true }));
  api.use('/projects', rest(require('../controllers/projects.controller'), 'portfolio', {
    slug: true,
    extra: (r) => { r.get('/public/:slug', require('../controllers/projects.controller').publicOne); },
  }));

  /* --------------------------- packages ---------------------------- */
  api.use('/packages', rest(require('../controllers/packages.controller'), 'packages', { slug: true }));

  /* ----------------------------- blog ------------------------------ */
  const posts = require('../controllers/posts.controller');
  api.use('/posts', rest(posts, 'blog', {
    slug: true,
    extra: (r) => {
      r.get('/public', posts.publicList);
      r.get('/public/:slug', posts.publicOne);
    },
  }));
  api.use('/post-categories', rest(require('../controllers/postcategories.controller'), 'blog', { slug: true }));
  api.use('/tags', rest(require('../controllers/tags.controller'), 'blog', { slug: true }));

  const comments = require('../controllers/comments.controller');
  api.use('/comments', rest(comments, 'comments', {
    publicRead: false,
    extra: (r) => {
      r.post('/submit', formLimiter, comments.submit);
      r.patch('/:id/status', verifyToken, requirePermission('comments', 'edit'), activityLogger('comments'), comments.setStatus);
    },
  }));

  /* ------------------------ clients & team ------------------------- */
  api.use('/partners', rest(require('../controllers/partners.controller'), 'partners'));
  api.use('/testimonials', rest(require('../controllers/testimonials.controller'), 'testimonials'));
  api.use('/team', rest(require('../controllers/team.controller'), 'team'));
  api.use('/timeline', rest(require('../controllers/timeline.controller'), 'timeline'));
  api.use('/certificates', rest(require('../controllers/certificates.controller'), 'pages'));

  /* ---------------------------- careers ---------------------------- */
  const jobs = require('../controllers/jobs.controller');
  api.use('/job-departments', rest(jobs.departments, 'jobs'));
  api.use('/jobs', rest(jobs, 'jobs', {
    slug: true,
    extra: (r) => { r.get('/public/:slug', jobs.publicOne); },
  }));

  const applications = require('../controllers/applications.controller');
  api.use('/applications', rest(applications, 'applications', {
    publicRead: false,
    extra: (r) => { r.post('/submit', formLimiter, upload.single('resume'), applications.submit); },
  }));

  /* ----------------------------- leads ----------------------------- */
  const messages = require('../controllers/messages.controller');
  api.use('/messages', rest(messages, 'messages', {
    publicRead: false,
    extra: (r) => {
      r.post('/submit', formLimiter, messages.submit);
      r.patch('/:id/read', verifyToken, requirePermission('messages', 'edit'), messages.markRead);
      r.post('/:id/reply', verifyToken, requirePermission('messages', 'edit'), activityLogger('messages'), messages.reply);
    },
  }));

  const quotes = require('../controllers/quotes.controller');
  api.use('/quotes', rest(quotes, 'quotes', {
    publicRead: false,
    extra: (r) => {
      r.post('/submit', formLimiter, upload.array('attachments', 5), quotes.submit);
      r.post('/:id/reply', verifyToken, requirePermission('quotes', 'edit'), activityLogger('quotes'), quotes.reply);
    },
  }));

  const packageRequests = require('../controllers/packagerequests.controller');
  api.use('/package-requests', rest(packageRequests, 'packagerequests', {
    publicRead: false,
    extra: (r) => { r.post('/submit', formLimiter, packageRequests.submit); },
  }));

  /* ------------------------------ faq ------------------------------ */
  api.use('/faq-categories', rest(require('../controllers/faqcategories.controller'), 'faq', { slug: true }));
  api.use('/faqs', rest(require('../controllers/faq.controller'), 'faq'));

  /* --------------------------- navigation -------------------------- */
  const menus = require('../controllers/menus.controller');
  api.use('/menus', rest(menus, 'menus', { extra: (r) => { r.get('/tree', menus.tree); } }));

  const banners = require('../controllers/banners.controller');
  const br = express.Router();
  br.get('/', banners.list);
  br.put('/:page', verifyToken, requirePermission('banners', 'edit'), activityLogger('banners'), banners.save);
  api.use('/banners', br);

  /* ----------------------------- pages ----------------------------- */
  const pages = require('../controllers/pages.controller');
  const pr = express.Router();
  pr.get('/', pages.list);
  pr.get('/:key', pages.get);
  pr.put('/:key', verifyToken, requirePermission('pages', 'edit'), activityLogger('pages'), pages.save);
  api.use('/pages', pr);

  /* --------------------------- settings ---------------------------- */
  const settings = require('../controllers/settings.controller');
  const st = express.Router();
  st.get('/public', settings.getPublic);
  st.get('/', verifyToken, requirePermission('settings', 'view'), settings.get);
  st.put('/', verifyToken, requirePermission('settings', 'edit'), activityLogger('settings'), settings.update);
  st.post('/test-email', verifyToken, requirePermission('settings', 'edit'), settings.testEmail);
  st.put('/:group', verifyToken, requirePermission('settings', 'edit'), activityLogger('settings'), settings.updateGroup);
  api.use('/settings', st);

  /* --------------------- users, roles & profile -------------------- */
  api.use('/users', rest(require('../controllers/users.controller'), 'users', { publicRead: false }));

  const roles = require('../controllers/roles.controller');
  api.use('/roles', rest(roles, 'roles', {
    publicRead: false,
    extra: (r) => { r.get('/modules', verifyToken, roles.modules); },
  }));

  /* --------------------------- uploads ----------------------------- */
  const uploadCtrl = require('../controllers/upload.controller');
  const ur = express.Router();
  ur.get('/info', verifyToken, uploadCtrl.info);
  ur.post('/single', verifyToken, upload.single('file'), uploadCtrl.single);
  ur.post('/multiple', verifyToken, upload.array('files', 12), uploadCtrl.multiple);
  ur.delete('/', verifyToken, uploadCtrl.remove);
  api.use('/upload', ur);

  /* -------------------------- analytics ---------------------------- */
  const analytics = require('../controllers/analytics.controller');
  const an = express.Router();
  an.get('/overview', verifyToken, requirePermission('dashboard', 'view'), analytics.overview);
  an.get('/visits', verifyToken, requirePermission('analytics', 'view'), analytics.visits);
  an.get('/requests', verifyToken, requirePermission('analytics', 'view'), analytics.requests);
  an.get('/blog', verifyToken, requirePermission('analytics', 'view'), analytics.blog);
  an.get('/export/:collection', verifyToken, requirePermission('analytics', 'view'), analytics.exportCollection);
  api.use('/analytics', an);

  /* -------------------------- notifications ------------------------ */
  const notif = require('../controllers/notifications.controller');
  const nr = express.Router();
  nr.get('/', verifyToken, notif.list);
  nr.patch('/read-all', verifyToken, notif.markAllRead);
  nr.patch('/:id/read', verifyToken, notif.markRead);
  nr.delete('/:id', verifyToken, notif.remove);
  api.use('/notifications', nr);

  /* --------------------------- security ---------------------------- */
  const security = require('../controllers/security.controller');
  const sec = express.Router();
  sec.get('/my-ip', verifyToken, security.myIp);
  sec.get('/login-logs', verifyToken, requirePermission('security', 'view'), security.loginLogs);
  sec.get('/activity-logs', verifyToken, requirePermission('activity', 'view'), security.activityLogs);
  sec.get('/blocked-ips', verifyToken, requirePermission('security', 'view'), security.blockedIps);
  sec.post('/blocked-ips', verifyToken, requirePermission('security', 'create'), activityLogger('security'), security.blockIp);
  sec.delete('/blocked-ips/:id', verifyToken, requirePermission('security', 'delete'), activityLogger('security'), security.unblockIp);
  sec.delete('/logs/:type', verifyToken, requirePermission('security', 'delete'), activityLogger('security'), security.clearLogs);
  api.use('/security', sec);

  /* ---------------------------- backup ----------------------------- */
  const backup = require('../controllers/backup.controller');
  const bk = express.Router();
  bk.get('/', verifyToken, requirePermission('backup', 'view'), backup.list);
  bk.post('/', verifyToken, requirePermission('backup', 'create'), activityLogger('backup'), backup.create);
  bk.get('/:id/download', verifyToken, requirePermission('backup', 'view'), backup.download);
  bk.post('/:id/restore', verifyToken, requirePermission('backup', 'edit'), activityLogger('backup'), backup.restore);
  bk.post('/restore/upload', verifyToken, requirePermission('backup', 'edit'), upload.single('file'), backup.restore);
  bk.delete('/:id', verifyToken, requirePermission('backup', 'delete'), activityLogger('backup'), backup.remove);
  api.use('/backup', bk);

  return api;
}

module.exports = buildRoutes;
