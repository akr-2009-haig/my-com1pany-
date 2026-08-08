const { collection } = require('./datastore');
const { settingsDefaults } = require('./schemas');

function baseUrl(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  return `${proto}://${req.get('host')}`;
}

exports.robots = async (req, res) => {
  try {
    const s = await collection('settings').findOne({});
    const seo = { ...settingsDefaults.seo, ...(s?.seo || {}) };
    const body = `${seo.robots || 'User-agent: *\nAllow: /'}\n\nSitemap: ${baseUrl(req)}/sitemap.xml\n`;
    res.type('text/plain').send(body);
  } catch (e) {
    res.type('text/plain').send('User-agent: *\nAllow: /\n');
  }
};

exports.sitemap = async (req, res) => {
  try {
    const base = baseUrl(req);
    const [services, projects, posts, jobs, categories] = await Promise.all([
      collection('services').find({ isActive: true, status: 'published' }, { limit: 0 }),
      collection('projects').find({ isActive: true, status: 'published' }, { limit: 0 }),
      collection('posts').find({ status: 'published' }, { limit: 0 }),
      collection('jobs').find({ isActive: true }, { limit: 0 }),
      collection('postcategories').find({ isActive: true }, { limit: 0 }),
    ]);

    const statics = ['', '/about', '/services', '/portfolio', '/pricing', '/blog', '/careers', '/contact', '/quote', '/faq', '/privacy', '/terms'];
    const urls = [
      ...statics.map((p) => ({ loc: `${base}${p}`, priority: p === '' ? '1.0' : '0.8', changefreq: 'weekly' })),
      ...services.map((s) => ({ loc: `${base}/services/${s.slug}`, lastmod: s.updatedAt, priority: '0.8' })),
      ...projects.map((p) => ({ loc: `${base}/portfolio/${p.slug}`, lastmod: p.updatedAt, priority: '0.7' })),
      ...posts.map((p) => ({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt, priority: '0.7', changefreq: 'monthly' })),
      ...categories.map((c) => ({ loc: `${base}/blog?category=${c.slug}`, priority: '0.5' })),
      ...jobs.map((j) => ({ loc: `${base}/careers/${j.slug}`, lastmod: j.updatedAt, priority: '0.6' })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ''}
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;
    res.type('application/xml').send(xml);
  } catch (e) {
    res.status(500).type('text/plain').send('sitemap error');
  }
};
