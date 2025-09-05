const cache = new Map();

export const setCache = (key, value, ttl = 300000) => { // default 5 min
  const expires = Date.now() + ttl;
  cache.set(key, { value, expires });
};

export const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

export const delCache = (key) => cache.delete(key);

export default { setCache, getCache, delCache };
