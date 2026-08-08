const slugifyLib = require('slugify');
const xss = require('xss');

/** URL-safe slug that keeps Arabic characters readable. */
function makeSlug(text = '', fallback = 'item') {
  const raw = String(text).trim();
  if (!raw) return `${fallback}-${Date.now().toString(36)}`;
  const s = slugifyLib(raw, { lower: true, strict: true, locale: 'ar', remove: /[*+~.()'"!:@?#]/g });
  const cleaned = s || raw.replace(/\s+/g, '-').replace(/[^\p{L}\p{N}-]/gu, '');
  return (cleaned || `${fallback}-${Date.now().toString(36)}`).slice(0, 90);
}

/** Ensure the slug is unique inside a collection. */
async function uniqueSlug(coll, text, currentId = null, fallback = 'item') {
  const base = makeSlug(text, fallback);
  let slug = base;
  let i = 2;
  /* eslint-disable no-await-in-loop */
  while (true) {
    const existing = await coll.findOne({ slug });
    if (!existing || String(existing._id) === String(currentId)) return slug;
    slug = `${base}-${i}`;
    i += 1;
    if (i > 200) return `${base}-${Date.now().toString(36)}`;
  }
}

const richTextOptions = {
  whiteList: {
    ...xss.getDefaultWhiteList(),
    h1: ['style'], h2: ['style'], h3: ['style'], h4: ['style'], h5: ['style'], h6: ['style'],
    p: ['style', 'dir'], span: ['style'], div: ['style', 'class', 'dir'],
    img: ['src', 'alt', 'title', 'width', 'height', 'style', 'loading'],
    a: ['href', 'title', 'target', 'rel'],
    iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'style'],
    table: ['style', 'border'], thead: [], tbody: [], tr: [], td: ['colspan', 'rowspan', 'style'], th: ['colspan', 'rowspan', 'style'],
    figure: ['style'], figcaption: [], pre: ['class'], code: ['class'], blockquote: ['style'],
    ul: ['style'], ol: ['style'], li: ['style'], strong: [], em: [], u: [], s: [], br: [], hr: [],
  },
  css: false,
};

/** Sanitise WYSIWYG HTML before it is persisted. */
function cleanHtml(html = '') {
  if (!html) return '';
  return xss(String(html), richTextOptions);
}

/** Sanitise plain-text user input. */
function cleanText(value = '', max = 5000) {
  return xss(String(value), { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script', 'style'] })
    .trim().slice(0, max);
}

/** Estimate reading time in minutes from HTML content. */
function readingTime(html = '') {
  const words = String(html).replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Build a plain-text excerpt from HTML. */
function excerptFrom(html = '', len = 180) {
  const text = String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > len ? `${text.slice(0, len)}…` : text;
}

/** Parse list/table query params consistently across every controller. */
function parseListQuery(query = {}, { defaultSort = { createdAt: -1 }, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limitRaw = parseInt(query.limit, 10);
  const limit = query.limit === 'all' ? 0 : Math.min(maxLimit, limitRaw > 0 ? limitRaw : 20);
  let sort = defaultSort;
  if (query.sort) {
    const dir = query.order === 'asc' ? 1 : -1;
    sort = { [String(query.sort).replace(/[^\w.]/g, '')]: dir };
  }
  return { page, limit, skip: limit ? (page - 1) * limit : 0, sort };
}

/** Escape a value for a RegExp search. */
function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Convert an array of objects to a CSV string (UTF-8 BOM for Excel). */
function toCSV(rows = [], columns = null) {
  if (!rows.length) return '\uFEFF';
  const cols = columns || Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
  const esc = (v) => {
    if (v == null) return '';
    const s = v instanceof Date ? v.toISOString() : String(v);
    return `"${s.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  };
  const head = cols.map((c) => esc(c.label)).join(',');
  const body = rows.map((r) => cols.map((c) => esc(typeof c.value === 'function' ? c.value(r) : r[c.key])).join(',')).join('\n');
  return `\uFEFF${head}\n${body}`;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || '';
}

module.exports = {
  makeSlug, uniqueSlug, cleanHtml, cleanText, readingTime, excerptFrom,
  parseListQuery, escapeRegex, toCSV, clientIp,
};
