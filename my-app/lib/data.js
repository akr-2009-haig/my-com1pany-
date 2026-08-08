/**
 * Server-side data helpers used by React Server Components.
 * They read straight from the datastore (no HTTP round-trip), which keeps the
 * public site fully server-rendered and SEO friendly.
 */
import 'server-only';

const { collection, connect, getDriver } = require('./datastore');
const { settingsDefaults } = require('./schemas');

let bootstrapped = false;
async function ready() {
  if (!bootstrapped) {
    if (!globalThis.__APP_DATASTORE__ || !globalThis.__APP_DATASTORE__.loaded) await connect();
    bootstrapped = true;
  }
  return getDriver();
}

const plain = (v) => JSON.parse(JSON.stringify(v ?? null));

export async function getSettings() {
  await ready();
  const s = (await collection('settings').findOne({})) || {};
  const out = { ...s };
  for (const [k, v] of Object.entries(settingsDefaults)) out[k] = { ...v, ...(s[k] || {}) };
  return plain(out);
}

export async function getMenu(location = 'header') {
  await ready();
  const items = await collection('menus').find({ location, isActive: true }, { sort: { order: 1 }, limit: 0 });
  const roots = items.filter((i) => !i.parent);
  return plain(roots.map((r) => ({ ...r, children: items.filter((i) => String(i.parent) === String(r._id)) })));
}

export async function getBanner(page) {
  await ready();
  const b = await collection('banners').findOne({ page });
  return plain(b);
}

export async function getPage(key) {
  await ready();
  const p = await collection('pages').findOne({ key });
  return plain(p || { key, title: '', content: '', data: {} });
}

export async function getSections() {
  await ready();
  const rows = await collection('sections').find({}, { sort: { order: 1 }, limit: 0 });
  return plain(rows);
}

export async function getSlides() {
  await ready();
  return plain(await collection('slides').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }));
}

export async function getStats() {
  await ready();
  return plain(await collection('stats').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }));
}

export async function getServices({ featured = false, limit = 0 } = {}) {
  await ready();
  const filter = { isActive: true, status: 'published' };
  if (featured) filter.isFeatured = true;
  return plain(await collection('services').find(filter, { sort: { order: 1 }, limit }));
}

export async function getService(slug) {
  await ready();
  const service = await collection('services').findOne({ slug, isActive: true, status: 'published' });
  if (!service) return null;
  collection('services').increment(service._id, 'views', 1).catch(() => {});
  const siblings = await collection('services').find({ isActive: true, status: 'published' }, { sort: { order: 1 }, limit: 0 });
  const projects = await collection('projects').find({ isActive: true, status: 'published' }, { sort: { order: 1 }, limit: 3, populate: ['category'] });
  return plain({ service, siblings, projects });
}

export async function getProjectCategories() {
  await ready();
  return plain(await collection('projectcategories').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }));
}

export async function getProjects({ featured = false, limit = 0, category = '', page = 1, perPage = 0 } = {}) {
  await ready();
  const filter = { isActive: true, status: 'published' };
  if (featured) filter.isFeatured = true;
  if (category) {
    const cat = await collection('projectcategories').findOne({ slug: category });
    if (cat) filter.category = String(cat._id);
  }
  const total = await collection('projects').count(filter);
  const rows = await collection('projects').find(filter, {
    sort: { order: 1, createdAt: -1 },
    limit: perPage || limit,
    skip: perPage ? (page - 1) * perPage : 0,
    populate: ['category'],
  });
  return plain({ items: rows, total, pages: perPage ? Math.ceil(total / perPage) : 1 });
}

export async function getProject(slug) {
  await ready();
  const project = await collection('projects').findOne({ slug, isActive: true, status: 'published' }, { populate: ['category'] });
  if (!project) return null;
  collection('projects').increment(project._id, 'views', 1).catch(() => {});
  const related = await collection('projects').find(
    { isActive: true, status: 'published', _id: { $ne: String(project._id) } },
    { limit: 3, populate: ['category'] },
  );
  return plain({ project, related });
}

export async function getPackages({ homeOnly = false } = {}) {
  await ready();
  const filter = { isActive: true };
  if (homeOnly) filter.showOnHome = true;
  return plain(await collection('packages').find(filter, { sort: { order: 1 }, limit: 0 }));
}

export async function getTestimonials() {
  await ready();
  return plain(await collection('testimonials').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }));
}

export async function getPartners() {
  await ready();
  return plain(await collection('partners').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }));
}

export async function getTeam() {
  await ready();
  return plain(await collection('team').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }));
}

export async function getTimeline() {
  await ready();
  return plain(await collection('timeline').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }));
}

export async function getCertificates() {
  await ready();
  return plain(await collection('certificates').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }));
}

function isLive(post) {
  if (post.status === 'published') return true;
  if (post.status === 'scheduled' && post.publishAt && new Date(post.publishAt) <= new Date()) return true;
  return false;
}

export async function getPosts({ limit = 0, page = 1, perPage = 0, category = '', tag = '', search = '' } = {}) {
  await ready();
  const all = await collection('posts').find({}, { sort: { createdAt: -1 }, limit: 0 });
  let rows = all.filter(isLive);
  if (category) {
    const cat = await collection('postcategories').findOne({ slug: category });
    if (cat) rows = rows.filter((p) => (p.categories || []).map(String).includes(String(cat._id)));
    else rows = [];
  }
  if (tag) rows = rows.filter((p) => (p.tags || []).includes(tag));
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((p) => `${p.title} ${p.excerpt} ${p.content}`.toLowerCase().includes(q));
  }
  const total = rows.length;
  const sliced = perPage ? rows.slice((page - 1) * perPage, page * perPage) : (limit ? rows.slice(0, limit) : rows);
  const cats = await collection('postcategories').find({}, { limit: 0 });
  const catMap = new Map(cats.map((c) => [String(c._id), c]));
  const items = sliced.map((p) => ({
    ...p,
    categoryList: (p.categories || []).map((c) => catMap.get(String(c))).filter(Boolean),
  }));
  return plain({ items, total, pages: perPage ? Math.ceil(total / perPage) : 1 });
}

export async function getPost(slug) {
  await ready();
  const post = await collection('posts').findOne({ slug });
  if (!post || !isLive(post)) return null;
  collection('posts').increment(post._id, 'views', 1).catch(() => {});
  const all = (await collection('posts').find({}, { sort: { createdAt: -1 }, limit: 0 })).filter(isLive);
  const idx = all.findIndex((p) => String(p._id) === String(post._id));
  const cats = await collection('postcategories').find({}, { limit: 0 });
  const catMap = new Map(cats.map((c) => [String(c._id), c]));
  const comments = await collection('comments').find({ post: String(post._id), status: 'approved' }, { sort: { createdAt: 1 }, limit: 0 });
  const author = post.author ? await collection('users').findById(post.author) : null;
  const related = all.filter((p) => String(p._id) !== String(post._id)
    && (p.categories || []).some((c) => (post.categories || []).map(String).includes(String(c)))).slice(0, 3);
  return plain({
    post: { ...post, categoryList: (post.categories || []).map((c) => catMap.get(String(c))).filter(Boolean) },
    prev: all[idx + 1] || null,
    next: all[idx - 1] || null,
    related: related.length ? related : all.filter((p) => String(p._id) !== String(post._id)).slice(0, 3),
    comments,
    author: author ? { name: author.name, avatar: author.avatar, bio: author.bio } : null,
  });
}

export async function getBlogSidebar() {
  await ready();
  const [cats, tags, all] = await Promise.all([
    collection('postcategories').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }),
    collection('tags').find({}, { sort: { name: 1 }, limit: 0 }),
    collection('posts').find({}, { sort: { createdAt: -1 }, limit: 0 }),
  ]);
  const live = all.filter(isLive);
  return plain({
    categories: cats.map((c) => ({ ...c, count: live.filter((p) => (p.categories || []).map(String).includes(String(c._id))).length })),
    tags: tags.map((t) => ({ ...t, count: live.filter((p) => (p.tags || []).includes(t.name)).length })).filter((t) => t.count > 0),
    latest: live.slice(0, 5),
  });
}

export async function getJobs({ department = '', type = '' } = {}) {
  await ready();
  const filter = { isActive: true };
  if (department) filter.department = department;
  if (type) filter.type = type;
  const [jobs, departments] = await Promise.all([
    collection('jobs').find(filter, { sort: { order: 1, createdAt: -1 }, limit: 0 }),
    collection('jobdepartments').find({}, { sort: { order: 1 }, limit: 0 }),
  ]);
  return plain({ jobs, departments });
}

export async function getJob(slug) {
  await ready();
  const job = await collection('jobs').findOne({ slug, isActive: true });
  if (!job) return null;
  const others = await collection('jobs').find({ isActive: true, _id: { $ne: String(job._id) } }, { limit: 3 });
  return plain({ job, others });
}

export async function getFaqs({ pricingOnly = false } = {}) {
  await ready();
  const filter = { isActive: true };
  if (pricingOnly) filter.showOnPricing = true;
  const [faqs, categories] = await Promise.all([
    collection('faqs').find(filter, { sort: { order: 1 }, limit: 0 }),
    collection('faqcategories').find({ isActive: true }, { sort: { order: 1 }, limit: 0 }),
  ]);
  return plain({ faqs, categories });
}

export async function getAboutData() {
  await ready();
  const [page, aboutSection, vision, team, timeline, certificates] = await Promise.all([
    getPage('about'), getPage('about-section'), getPage('vision-mission'),
    getTeam(), getTimeline(), getCertificates(),
  ]);
  return { page, aboutSection, vision, team, timeline, certificates };
}

export async function getHomeData() {
  await ready();
  const settings = await getSettings();
  const home = settings.home || {};
  const [sections, slides, stats, aboutSection, services, whyus, projectsRes,
    categories, testimonials, packages, partners, postsRes, cta, contactPage] = await Promise.all([
    getSections(),
    getSlides(),
    getStats(),
    getPage('about-section'),
    getServices({ featured: true, limit: Number(home.servicesCount) || 6 }),
    getPage('whyus'),
    getProjects({ featured: true, limit: Number(home.projectsCount) || 6 }),
    getProjectCategories(),
    getTestimonials(),
    getPackages({ homeOnly: true }),
    getPartners(),
    getPosts({ limit: Number(home.postsCount) || 3 }),
    getPage('cta'),
    getPage('contact'),
  ]);
  let featuredServices = services;
  if (!featuredServices.length) featuredServices = await getServices({ limit: Number(home.servicesCount) || 6 });
  let featuredProjects = projectsRes.items;
  if (!featuredProjects.length) featuredProjects = (await getProjects({ limit: Number(home.projectsCount) || 6 })).items;

  return {
    settings, sections, slides, stats, aboutSection,
    services: featuredServices, whyus,
    projects: featuredProjects, categories,
    testimonials, packages, partners,
    posts: postsRes.items, cta, contactPage,
  };
}

export { ready };
