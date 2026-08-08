const { collection } = require('../lib/datastore');
const { toCSV } = require('../lib/helpers');

const DAY = 24 * 60 * 60 * 1000;

function rangeFrom(query) {
  const now = new Date();
  if (query.from || query.to) {
    return {
      from: query.from ? new Date(query.from) : new Date(now - 30 * DAY),
      to: query.to ? new Date(`${query.to}T23:59:59`) : now,
    };
  }
  const days = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 }[query.period || '30d'] || 30;
  return { from: new Date(now - days * DAY), to: now };
}

function bucketByDay(docs, from, to) {
  const out = [];
  const start = new Date(from); start.setHours(0, 0, 0, 0);
  const end = new Date(to); end.setHours(0, 0, 0, 0);
  const counts = new Map();
  docs.forEach((d) => {
    const k = new Date(d.createdAt); k.setHours(0, 0, 0, 0);
    const key = k.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  for (let t = start.getTime(); t <= end.getTime(); t += DAY) {
    const key = new Date(t).toISOString().slice(0, 10);
    out.push({ date: key, value: counts.get(key) || 0 });
  }
  return out.slice(-370);
}

function groupCount(docs, field) {
  const map = new Map();
  docs.forEach((d) => {
    const key = d[field] || 'غير محدد';
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function pct(current, previous) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Dashboard summary: KPI cards, traffic chart, latest leads, activity. */
exports.overview = async (req, res, next) => {
  try {
    const now = Date.now();
    const monthAgo = new Date(now - 30 * DAY);
    const twoMonthsAgo = new Date(now - 60 * DAY);

    const [visits, prevVisits, quotes, messages, projects, packageReqs, applications,
      latestQuotes, latestMessages, activity, services] = await Promise.all([
      collection('visits').find({ createdAt: { $gte: monthAgo } }, { limit: 0 }),
      collection('visits').count({ createdAt: { $gte: twoMonthsAgo, $lt: monthAgo } }),
      collection('quotes').find({}, { limit: 0 }),
      collection('messages').find({}, { limit: 0 }),
      collection('projects').count({ isActive: true }),
      collection('packagerequests').count({ isRead: false }),
      collection('applications').count({ isRead: false }),
      collection('quotes').find({}, { sort: { createdAt: -1 }, limit: 5 }),
      collection('messages').find({}, { sort: { createdAt: -1 }, limit: 5 }),
      collection('activitylogs').find({}, { sort: { createdAt: -1 }, limit: 10 }),
      collection('services').find({}, { limit: 0 }),
    ]);

    const newQuotes = quotes.filter((q) => !q.isRead).length;
    const newMessages = messages.filter((m) => !m.isRead).length;
    const prevMonthQuotes = quotes.filter((q) => new Date(q.createdAt) >= twoMonthsAgo && new Date(q.createdAt) < monthAgo).length;
    const thisMonthQuotes = quotes.filter((q) => new Date(q.createdAt) >= monthAgo).length;
    const prevMonthMessages = messages.filter((m) => new Date(m.createdAt) >= twoMonthsAgo && new Date(m.createdAt) < monthAgo).length;
    const thisMonthMessages = messages.filter((m) => new Date(m.createdAt) >= monthAgo).length;

    const serviceMap = new Map(services.map((s) => [s.title, 0]));
    quotes.forEach((q) => { if (serviceMap.has(q.projectType)) serviceMap.set(q.projectType, serviceMap.get(q.projectType) + 1); });

    res.json({
      cards: {
        visits: { value: visits.length, change: pct(visits.length, prevVisits) },
        quotes: { value: newQuotes, total: quotes.length, change: pct(thisMonthQuotes, prevMonthQuotes) },
        messages: { value: newMessages, total: messages.length, change: pct(thisMonthMessages, prevMonthMessages) },
        projects: { value: projects, change: 0 },
        packageRequests: packageReqs,
        applications,
      },
      traffic: bucketByDay(visits, monthAgo, new Date()),
      quotesByService: [...serviceMap.entries()].filter(([, v]) => v > 0).map(([label, value]) => ({ label, value })),
      quotesByStatus: groupCount(quotes, 'status'),
      latestQuotes,
      latestMessages,
      activity,
    });
  } catch (e) { next(e); }
};

/** Traffic report. */
exports.visits = async (req, res, next) => {
  try {
    const { from, to } = rangeFrom(req.query);
    const docs = await collection('visits').find({ createdAt: { $gte: from, $lte: to } }, { limit: 0 });
    const sessions = new Set(docs.map((d) => d.sessionId));
    const bounces = new Set(docs.filter((d) => d.isBounce).map((d) => d.sessionId));
    const perSession = new Map();
    docs.forEach((d) => {
      const arr = perSession.get(d.sessionId) || [];
      arr.push(new Date(d.createdAt).getTime());
      perSession.set(d.sessionId, arr);
    });
    let totalDuration = 0;
    perSession.forEach((times) => {
      if (times.length < 2) return;
      totalDuration += Math.max(...times) - Math.min(...times);
    });
    const avgSession = perSession.size ? Math.round(totalDuration / perSession.size / 1000) : 0;

    res.json({
      total: docs.length,
      unique: sessions.size,
      bounceRate: sessions.size ? Math.round((bounces.size / sessions.size) * 100) : 0,
      avgSession,
      chart: bucketByDay(docs, from, to),
      topPages: groupCount(docs, 'path').slice(0, 12),
      sources: groupCount(docs, 'source'),
      devices: groupCount(docs, 'device'),
      browsers: groupCount(docs, 'browser').slice(0, 8),
      countries: groupCount(docs, 'country').slice(0, 10),
    });
  } catch (e) { next(e); }
};

/** Leads report. */
exports.requests = async (req, res, next) => {
  try {
    const { from, to } = rangeFrom(req.query);
    const range = { createdAt: { $gte: from, $lte: to } };
    const [quotes, messages, pkg, apps] = await Promise.all([
      collection('quotes').find(range, { limit: 0 }),
      collection('messages').find(range, { limit: 0 }),
      collection('packagerequests').find(range, { limit: 0 }),
      collection('applications').find(range, { limit: 0 }),
    ]);
    const monthly = {};
    const add = (docs, key) => docs.forEach((d) => {
      const m = new Date(d.createdAt).toISOString().slice(0, 7);
      monthly[m] = monthly[m] || { month: m, quotes: 0, messages: 0, packages: 0, applications: 0 };
      monthly[m][key] += 1;
    });
    add(quotes, 'quotes'); add(messages, 'messages'); add(pkg, 'packages'); add(apps, 'applications');

    res.json({
      totals: { quotes: quotes.length, messages: messages.length, packages: pkg.length, applications: apps.length },
      byType: [
        { label: 'عروض أسعار', value: quotes.length },
        { label: 'رسائل تواصل', value: messages.length },
        { label: 'طلبات باقات', value: pkg.length },
        { label: 'طلبات توظيف', value: apps.length },
      ],
      byStatus: groupCount(quotes, 'status'),
      byBudget: groupCount(quotes, 'budget'),
      topServices: groupCount(quotes, 'projectType').slice(0, 8),
      monthly: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)),
    });
  } catch (e) { next(e); }
};

/** Blog report. */
exports.blog = async (req, res, next) => {
  try {
    const [posts, comments, cats] = await Promise.all([
      collection('posts').find({}, { limit: 0 }),
      collection('comments').find({}, { limit: 0 }),
      collection('postcategories').find({}, { limit: 0 }),
    ]);
    const catMap = new Map(cats.map((c) => [String(c._id), c.name]));
    const byCategory = cats.map((c) => ({
      label: c.name,
      value: posts.filter((p) => (p.categories || []).map(String).includes(String(c._id))).length,
      views: posts.filter((p) => (p.categories || []).map(String).includes(String(c._id))).reduce((a, p) => a + (p.views || 0), 0),
    })).sort((a, b) => b.views - a.views);

    const monthlyComments = {};
    comments.forEach((c) => {
      const m = new Date(c.createdAt).toISOString().slice(0, 7);
      monthlyComments[m] = (monthlyComments[m] || 0) + 1;
    });

    res.json({
      totals: {
        posts: posts.length,
        published: posts.filter((p) => p.status === 'published').length,
        views: posts.reduce((a, p) => a + (p.views || 0), 0),
        comments: comments.length,
        pending: comments.filter((c) => c.status === 'pending').length,
      },
      topPosts: [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10)
        .map((p) => ({ _id: p._id, title: p.title, slug: p.slug, views: p.views || 0, createdAt: p.createdAt, categories: (p.categories || []).map((c) => catMap.get(String(c))).filter(Boolean) })),
      byCategory,
      monthlyComments: Object.entries(monthlyComments).map(([month, value]) => ({ month, value })).sort((a, b) => a.month.localeCompare(b.month)),
    });
  } catch (e) { next(e); }
};

/** Generic CSV export used by the “export data” screen. */
exports.exportCollection = async (req, res, next) => {
  try {
    const allowed = {
      messages: [
        { key: 'name', label: 'الاسم' }, { key: 'email', label: 'البريد' }, { key: 'phone', label: 'الهاتف' },
        { key: 'service', label: 'الخدمة' }, { key: 'message', label: 'الرسالة' }, { key: 'status', label: 'الحالة' }, { key: 'createdAt', label: 'التاريخ' }],
      quotes: [
        { key: 'name', label: 'الاسم' }, { key: 'company', label: 'الشركة' }, { key: 'email', label: 'البريد' },
        { key: 'phone', label: 'الهاتف' }, { key: 'projectType', label: 'نوع المشروع' }, { key: 'budget', label: 'الميزانية' },
        { key: 'timeline', label: 'المدة' }, { key: 'status', label: 'الحالة' }, { key: 'createdAt', label: 'التاريخ' }],
      applications: [
        { key: 'name', label: 'الاسم' }, { key: 'email', label: 'البريد' }, { key: 'phone', label: 'الهاتف' },
        { key: 'jobTitle', label: 'الوظيفة' }, { key: 'status', label: 'الحالة' }, { key: 'resume', label: 'السيرة' }, { key: 'createdAt', label: 'التاريخ' }],
      packagerequests: [
        { key: 'name', label: 'الاسم' }, { key: 'email', label: 'البريد' }, { key: 'packageName', label: 'الباقة' },
        { key: 'billing', label: 'الدورة' }, { key: 'status', label: 'الحالة' }, { key: 'createdAt', label: 'التاريخ' }],
      posts: [
        { key: 'title', label: 'العنوان' }, { key: 'status', label: 'الحالة' }, { key: 'views', label: 'المشاهدات' },
        { key: 'authorName', label: 'الكاتب' }, { key: 'createdAt', label: 'التاريخ' }],
      comments: [
        { key: 'name', label: 'الاسم' }, { key: 'email', label: 'البريد' }, { key: 'postTitle', label: 'المقال' },
        { key: 'content', label: 'التعليق' }, { key: 'status', label: 'الحالة' }, { key: 'createdAt', label: 'التاريخ' }],
      activitylogs: [
        { key: 'userName', label: 'المستخدم' }, { key: 'action', label: 'الإجراء' }, { key: 'details', label: 'التفاصيل' },
        { key: 'ip', label: 'IP' }, { key: 'createdAt', label: 'التاريخ' }],
      loginlogs: [
        { key: 'email', label: 'المستخدم' }, { key: 'status', label: 'الحالة' }, { key: 'ip', label: 'IP' },
        { key: 'browser', label: 'المتصفح' }, { key: 'os', label: 'النظام' }, { key: 'createdAt', label: 'التاريخ' }],
      visits: [
        { key: 'path', label: 'الصفحة' }, { key: 'source', label: 'المصدر' }, { key: 'device', label: 'الجهاز' },
        { key: 'browser', label: 'المتصفح' }, { key: 'createdAt', label: 'التاريخ' }],
    };
    const name = req.params.collection;
    if (!allowed[name]) return res.status(400).json({ message: 'لا يمكن تصدير هذا النوع' });
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(`${req.query.to}T23:59:59`);
    }
    const rows = await collection(name).find(filter, { sort: { createdAt: -1 }, limit: 0 });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(toCSV(rows, allowed[name]));
  } catch (e) { return next(e); }
};

/** Records a page view from the browser (used for SPA navigations). */
exports.track = async (req, res) => {
  res.json({ ok: true });
};
