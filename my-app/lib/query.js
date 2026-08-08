/**
 * Minimal MongoDB-style query engine used by the embedded JSON store.
 * Supports the operator subset the application actually needs.
 */

function getPath(doc, path) {
  if (!path.includes('.')) return doc ? doc[path] : undefined;
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), doc);
}

function toComparable(v) {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'string') {
    const d = Date.parse(v);
    if (!Number.isNaN(d) && /^\d{4}-\d{2}-\d{2}/.test(v)) return d;
  }
  return v;
}

function eq(a, b) {
  if (a instanceof Date || b instanceof Date) return toComparable(a) === toComparable(b);
  if (Array.isArray(a)) return a.some((x) => String(x) === String(b));
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

function matchOperators(value, cond) {
  for (const [op, operand] of Object.entries(cond)) {
    switch (op) {
      case '$eq': if (!eq(value, operand)) return false; break;
      case '$ne': if (eq(value, operand)) return false; break;
      case '$in': {
        const arr = Array.isArray(operand) ? operand : [operand];
        if (Array.isArray(value)) {
          if (!value.some((v) => arr.some((o) => eq(v, o)))) return false;
        } else if (!arr.some((o) => eq(value, o))) return false;
        break;
      }
      case '$nin': {
        const arr = Array.isArray(operand) ? operand : [operand];
        if (Array.isArray(value)) {
          if (value.some((v) => arr.some((o) => eq(v, o)))) return false;
        } else if (arr.some((o) => eq(value, o))) return false;
        break;
      }
      case '$gt': if (!(toComparable(value) > toComparable(operand))) return false; break;
      case '$gte': if (!(toComparable(value) >= toComparable(operand))) return false; break;
      case '$lt': if (!(toComparable(value) < toComparable(operand))) return false; break;
      case '$lte': if (!(toComparable(value) <= toComparable(operand))) return false; break;
      case '$exists': {
        const has = value !== undefined && value !== null && value !== '';
        if (Boolean(operand) !== has) return false;
        break;
      }
      case '$regex': {
        const flags = cond.$options || '';
        const re = operand instanceof RegExp ? operand : new RegExp(operand, flags);
        if (!re.test(String(value == null ? '' : value))) return false;
        break;
      }
      case '$options': break;
      case '$not': {
        if (matchOperators(value, operand)) return false;
        break;
      }
      case '$size': {
        if (!Array.isArray(value) || value.length !== operand) return false;
        break;
      }
      default:
        if (!eq(value, cond)) return false;
    }
  }
  return true;
}

function matches(doc, filter = {}) {
  for (const [key, cond] of Object.entries(filter || {})) {
    if (key === '$or') {
      if (!cond.some((sub) => matches(doc, sub))) return false;
      continue;
    }
    if (key === '$and') {
      if (!cond.every((sub) => matches(doc, sub))) return false;
      continue;
    }
    if (key === '$nor') {
      if (cond.some((sub) => matches(doc, sub))) return false;
      continue;
    }
    const value = getPath(doc, key);
    if (cond instanceof RegExp) {
      if (!cond.test(String(value == null ? '' : value))) return false;
      continue;
    }
    if (cond && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof Date)
        && Object.keys(cond).some((k) => k.startsWith('$'))) {
      if (!matchOperators(value, cond)) return false;
      continue;
    }
    if (!eq(value, cond)) return false;
  }
  return true;
}

function sortDocs(docs, sort) {
  if (!sort) return docs;
  const entries = Object.entries(sort);
  if (!entries.length) return docs;
  return [...docs].sort((a, b) => {
    for (const [key, dir] of entries) {
      const av = toComparable(getPath(a, key));
      const bv = toComparable(getPath(b, key));
      if (av === bv) continue;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      if (typeof av === 'string' && typeof bv === 'string') {
        const cmp = av.localeCompare(bv, 'ar');
        if (cmp !== 0) return dir === -1 ? -cmp : cmp;
        continue;
      }
      return dir === -1 ? (av < bv ? 1 : -1) : (av < bv ? -1 : 1);
    }
    return 0;
  });
}

module.exports = { matches, sortDocs, getPath };
