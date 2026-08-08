/**
 * Data access layer with two interchangeable drivers:
 *
 *   1. "mongo" – Mongoose / MongoDB (used whenever MONGODB_URI connects).
 *   2. "file"  – embedded JSON document store (zero-config fallback so the
 *                application boots and is fully usable without a database
 *                server, e.g. local dev, demos, CI).
 *
 * Every controller talks to this layer only, so switching drivers never
 * requires touching business logic.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { schemas } = require('./schemas');
const { matches, sortDocs } = require('./query');

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

/**
 * State is kept on globalThis so that the Express server (Node require) and
 * the Next.js server components (webpack require) share exactly one instance
 * of the store inside the same process.
 */
const G = (globalThis.__APP_DATASTORE__ = globalThis.__APP_DATASTORE__ || {
  driver: 'file', mongoose: null, models: {}, memory: {}, loaded: false, dirty: false, flushTimer: null, mtime: 0,
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const newId = () => crypto.randomBytes(12).toString('hex');

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);
}

function castValue(def, value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  switch (def.type) {
    case 'number': {
      if (value === '') return 0;
      const n = Number(value);
      return Number.isNaN(n) ? 0 : n;
    }
    case 'boolean':
      if (typeof value === 'string') return value === 'true' || value === '1';
      return Boolean(value);
    case 'date': {
      if (value === '' ) return null;
      const d = value instanceof Date ? value : new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    case 'array':
      return Array.isArray(value) ? value : (value === '' ? [] : [value]);
    case 'object':
      return isPlainObject(value) ? value : {};
    case 'ref':
      return value === '' ? null : (value && value._id ? String(value._id) : String(value));
    default:
      return typeof value === 'string' ? value : (value == null ? '' : String(value));
  }
}

function applySchema(name, input, { partial = false } = {}) {
  const schema = schemas[name];
  if (!schema) return { ...input };
  const out = {};
  for (const [field, def] of Object.entries(schema.fields)) {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      const cast = castValue(def, input[field]);
      if (cast !== undefined) out[field] = cast;
    } else if (!partial) {
      out[field] = typeof def.default === 'function' ? def.default() : def.default;
    }
  }
  // keep unknown-but-provided keys (forward compatible)
  for (const [k, v] of Object.entries(input)) {
    if (!(k in schema.fields) && !k.startsWith('_') && k !== 'createdAt' && k !== 'updatedAt') out[k] = v;
  }
  return out;
}

function stripHidden(name, doc, withHidden) {
  if (!doc || withHidden) return doc;
  const hidden = schemas[name]?.hidden;
  if (!hidden?.length) return doc;
  const clone = { ...doc };
  hidden.forEach((f) => delete clone[f]);
  return clone;
}

function normalize(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(normalize);
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    if (value._bsontype === 'ObjectId' || (value.constructor && value.constructor.name === 'ObjectId')) {
      return String(value);
    }
    if (Buffer.isBuffer(value)) return value;
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalize(v);
    return out;
  }
  return value;
}

/* ------------------------------------------------------------------ */
/* File driver storage                                                 */
/* ------------------------------------------------------------------ */

const memory = G.memory;

function reviveDates(obj) {
  if (Array.isArray(obj)) return obj.map(reviveDates);
  if (isPlainObject(obj)) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
        const d = new Date(v);
        out[k] = Number.isNaN(d.getTime()) ? v : d;
      } else out[k] = reviveDates(v);
    }
    return out;
  }
  return obj;
}

function loadFile() {
  if (G.loaded) return;
  G.loaded = true;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      for (const [k, v] of Object.entries(raw)) memory[k] = reviveDates(v);
      G.mtime = fs.statSync(DATA_FILE).mtimeMs;
    }
  } catch (e) {
    console.error('[datastore] failed to read data file:', e.message);
  }
  for (const name of Object.keys(schemas)) if (!memory[name]) memory[name] = [];
}

function scheduleFlush() {
  G.dirty = true;
  if (G.flushTimer) return;
  G.flushTimer = setTimeout(() => { G.flushTimer = null; flushSync(); }, 250);
}

function flushSync() {
  if (!G.dirty) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(memory));
    fs.renameSync(tmp, DATA_FILE);
    G.dirty = false;
    G.mtime = fs.statSync(DATA_FILE).mtimeMs;
  } catch (e) {
    console.error('[datastore] failed to persist data file:', e.message);
  }
}

['exit', 'SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig, () => {
    flushSync();
    if (sig !== 'exit') process.exit(0);
  });
});

/* ------------------------------------------------------------------ */
/* Mongoose model building                                             */
/* ------------------------------------------------------------------ */

function buildMongooseModels(mg) {
  const { Schema } = mg;
  const built = {};
  for (const [name, def] of Object.entries(schemas)) {
    const shape = {};
    for (const [field, f] of Object.entries(def.fields)) {
      switch (f.type) {
        case 'number': shape[field] = { type: Number, default: f.default }; break;
        case 'boolean': shape[field] = { type: Boolean, default: f.default }; break;
        case 'date': shape[field] = { type: Date, default: f.default || null }; break;
        case 'array': shape[field] = { type: Array, default: () => [] }; break;
        case 'object': shape[field] = { type: Schema.Types.Mixed, default: () => ({}) }; break;
        case 'ref': shape[field] = { type: Schema.Types.ObjectId, ref: f.ref, default: null }; break;
        default: shape[field] = { type: String, default: f.default, ...(f.lowercase ? { lowercase: true } : {}) };
      }
      if (f.index) shape[field].index = true;
    }
    const s = new Schema(shape, { timestamps: true, strict: false, minimize: false });
    built[name] = mg.G.models[name] || mg.model(name, s, name);
  }
  return built;
}

/* ------------------------------------------------------------------ */
/* Collection API                                                      */
/* ------------------------------------------------------------------ */

function refFieldsOf(name) {
  const out = {};
  for (const [field, def] of Object.entries(schemas[name]?.fields || {})) {
    if (def.type === 'ref') out[field] = def.ref;
  }
  return out;
}

class Collection {
  constructor(name) {
    this.name = name;
  }

  get store() {
    loadFile();
    if (!memory[this.name]) memory[this.name] = [];
    return memory[this.name];
  }

  async _populate(docs, populate) {
    if (!populate?.length || !docs.length) return docs;
    const refs = refFieldsOf(this.name);
    for (const field of populate) {
      const target = refs[field];
      if (!target) continue;
      const ids = [...new Set(docs.map((d) => d && d[field]).filter(Boolean).map(String))];
      if (!ids.length) continue;
      const related = await collection(target).find({ _id: { $in: ids } }, { limit: 0 });
      const map = new Map(related.map((r) => [String(r._id), r]));
      docs.forEach((d) => {
        if (d && d[field]) d[field] = map.get(String(d[field])) || null;
      });
    }
    return docs;
  }

  async find(filter = {}, opts = {}) {
    const { sort = { createdAt: -1 }, skip = 0, limit = 0, populate = [], withHidden = false } = opts;
    let docs;
    if (G.driver === 'mongo') {
      let q = G.models[this.name].find(sanitizeMongoFilter(filter)).lean();
      if (sort) q = q.sort(sort);
      if (skip) q = q.skip(skip);
      if (limit) q = q.limit(limit);
      docs = normalize(await q.exec());
    } else {
      docs = this.store.filter((d) => matches(d, filter));
      docs = sortDocs(docs, sort);
      if (skip) docs = docs.slice(skip);
      if (limit) docs = docs.slice(0, limit);
      docs = docs.map((d) => JSON.parse(JSON.stringify(d), dateReviver));
    }
    docs = docs.map((d) => stripHidden(this.name, d, withHidden));
    return this._populate(docs, populate);
  }

  async findOne(filter = {}, opts = {}) {
    const res = await this.find(filter, { ...opts, limit: 1 });
    return res[0] || null;
  }

  async findById(id, opts = {}) {
    if (!id) return null;
    return this.findOne({ _id: String(id) }, opts);
  }

  async count(filter = {}) {
    if (G.driver === 'mongo') return G.models[this.name].countDocuments(sanitizeMongoFilter(filter));
    return this.store.filter((d) => matches(d, filter)).length;
  }

  async create(input) {
    const doc = applySchema(this.name, input || {});
    const forcedDate = input && input.createdAt ? new Date(input.createdAt) : null;
    if (G.driver === 'mongo') {
      const created = await G.models[this.name].create(doc);
      if (forcedDate && !Number.isNaN(forcedDate.getTime())) {
        await G.models[this.name].updateOne({ _id: created._id }, { $set: { createdAt: forcedDate } }, { timestamps: false });
        created.createdAt = forcedDate;
      }
      return stripHidden(this.name, normalize(created.toObject()), false);
    }
    const now = new Date();
    const full = { _id: newId(), ...doc, createdAt: forcedDate && !Number.isNaN(forcedDate.getTime()) ? forcedDate : now, updatedAt: now };
    this.store.unshift(full);
    scheduleFlush();
    return stripHidden(this.name, { ...full }, false);
  }

  async insertMany(list = []) {
    const out = [];
    for (const item of list) out.push(await this.create(item));
    return out;
  }

  async updateById(id, patch) {
    return this.updateOne({ _id: String(id) }, patch);
  }

  async updateOne(filter, patch, { upsert = false } = {}) {
    const data = applySchema(this.name, patch || {}, { partial: true });
    if (G.driver === 'mongo') {
      const doc = await G.models[this.name]
        .findOneAndUpdate(sanitizeMongoFilter(filter), { $set: data }, { new: true, upsert, setDefaultsOnInsert: true })
        .lean();
      return doc ? stripHidden(this.name, normalize(doc), false) : null;
    }
    const idx = this.store.findIndex((d) => matches(d, filter));
    if (idx === -1) {
      if (!upsert) return null;
      return this.create({ ...stripOperators(filter), ...patch });
    }
    const merged = { ...this.store[idx], ...data, updatedAt: new Date() };
    this.store[idx] = merged;
    scheduleFlush();
    return stripHidden(this.name, { ...merged }, false);
  }

  async updateMany(filter, patch) {
    const data = applySchema(this.name, patch || {}, { partial: true });
    if (G.driver === 'mongo') {
      const r = await G.models[this.name].updateMany(sanitizeMongoFilter(filter), { $set: data });
      return r.modifiedCount || 0;
    }
    let n = 0;
    this.store.forEach((d, i) => {
      if (matches(d, filter)) { this.store[i] = { ...d, ...data, updatedAt: new Date() }; n += 1; }
    });
    if (n) scheduleFlush();
    return n;
  }

  async increment(id, field, by = 1) {
    if (G.driver === 'mongo') {
      await G.models[this.name].updateOne(sanitizeMongoFilter({ _id: String(id) }), { $inc: { [field]: by } });
      return true;
    }
    const idx = this.store.findIndex((d) => String(d._id) === String(id));
    if (idx === -1) return false;
    this.store[idx][field] = Number(this.store[idx][field] || 0) + by;
    scheduleFlush();
    return true;
  }

  async deleteById(id) {
    return this.deleteOne({ _id: String(id) });
  }

  async deleteOne(filter) {
    if (G.driver === 'mongo') {
      const doc = await G.models[this.name].findOneAndDelete(sanitizeMongoFilter(filter)).lean();
      return doc ? normalize(doc) : null;
    }
    const idx = this.store.findIndex((d) => matches(d, filter));
    if (idx === -1) return null;
    const [removed] = this.store.splice(idx, 1);
    scheduleFlush();
    return removed;
  }

  async deleteMany(filter = {}) {
    if (G.driver === 'mongo') {
      const r = await G.models[this.name].deleteMany(sanitizeMongoFilter(filter));
      return r.deletedCount || 0;
    }
    const before = this.store.length;
    memory[this.name] = this.store.filter((d) => !matches(d, filter));
    scheduleFlush();
    return before - memory[this.name].length;
  }

  async distinct(field, filter = {}) {
    const docs = await this.find(filter, { limit: 0 });
    const set = new Set();
    docs.forEach((d) => {
      const v = d[field];
      if (Array.isArray(v)) v.forEach((x) => x && set.add(x));
      else if (v) set.add(v);
    });
    return [...set];
  }

  /** Bulk order update: [{ _id, order }] */
  async reorder(items = []) {
    for (const it of items) {
      if (!it || !it._id) continue;
      await this.updateById(it._id, { order: Number(it.order) || 0 });
    }
    return true;
  }
}

function dateReviver(key, value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return value;
}

function stripOperators(filter) {
  const out = {};
  for (const [k, v] of Object.entries(filter || {})) {
    if (k.startsWith('$')) continue;
    if (isPlainObject(v) && Object.keys(v).some((x) => x.startsWith('$'))) continue;
    out[k] = v;
  }
  return out;
}

/** Guard against invalid ObjectId strings blowing up mongoose casting. */
function sanitizeMongoFilter(filter) {
  if (!filter || G.driver !== 'mongo') return filter;
  const clone = JSON.parse(JSON.stringify(filter, (k, v) => (v instanceof Date ? v.toISOString() : v)));
  const isValid = (v) => /^[0-9a-fA-F]{24}$/.test(String(v));
  const walk = (obj) => {
    for (const [k, v] of Object.entries(obj)) {
      if (k === '_id') {
        if (typeof v === 'string' && !isValid(v)) obj[k] = '000000000000000000000000';
        else if (isPlainObject(v) && Array.isArray(v.$in)) obj[k].$in = v.$in.filter(isValid);
      } else if (isPlainObject(v)) walk(v);
      else if (Array.isArray(v)) v.forEach((x) => isPlainObject(x) && walk(x));
    }
  };
  walk(clone);
  return clone;
}

const cache = new Map();
function collection(name) {
  if (!schemas[name]) throw new Error(`Unknown collection: ${name}`);
  if (!cache.has(name)) cache.set(name, new Collection(name));
  return cache.get(name);
}

/* ------------------------------------------------------------------ */
/* Bootstrap                                                           */
/* ------------------------------------------------------------------ */

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (uri && !process.env.FORCE_FILE_DB) {
    try {
      G.mongoose = require('mongoose');
      G.mongoose.set('strictQuery', false);
      await G.mongoose.connect(uri, {
        serverSelectionTimeoutMS: Number(process.env.DB_TIMEOUT_MS || 6000),
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        autoIndex: process.env.NODE_ENV !== 'production',
      });
      G.models = buildMongooseModels(G.mongoose);
      G.driver = 'mongo';
      console.log('[datastore] connected to MongoDB');
      return G.driver;
    } catch (e) {
      console.warn(`[datastore] MongoDB unavailable (${e.message}) – falling back to the embedded JSON store.`);
    }
  }
  G.driver = 'file';
  loadFile();
  console.log(`[datastore] using embedded JSON store at ${DATA_FILE}`);
  return G.driver;
}

function getDriver() { return G.driver; }
function isReady() { return G.driver === 'file' || (G.mongoose && G.mongoose.connection.readyState === 1); }

/** Dump every collection – used by the backup module. */
async function dumpAll() {
  const out = {};
  for (const name of Object.keys(schemas)) {
    out[name] = await collection(name).find({}, { limit: 0, sort: { createdAt: 1 }, withHidden: true });
  }
  return out;
}

/** Replace database content with a previously created dump. */
async function restoreAll(dump, { skipUsers = false } = {}) {
  for (const [name, docs] of Object.entries(dump || {})) {
    if (!schemas[name]) continue;
    if (skipUsers && (name === 'users' || name === 'roles')) continue;
    await collection(name).deleteMany({});
    if (G.driver === 'mongo') {
      if (docs.length) await G.models[name].insertMany(docs.map((d) => ({ ...d, _id: undefined })), { ordered: false }).catch(() => {});
    } else {
      memory[name] = docs.map((d) => ({ ...d, _id: d._id || newId() }));
      scheduleFlush();
    }
  }
  return true;
}

module.exports = {
  collection, connect, getDriver, isReady, dumpAll, restoreAll, flushSync, newId, DATA_FILE,
};
