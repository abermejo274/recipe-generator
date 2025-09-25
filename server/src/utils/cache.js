const CACHE_TTL_MS = 5 * 60 * 1000;
const store = new Map();
export function getCached(key) {
    const hit = store.get(key);
    if (!hit) return null;
    if (Date.now() - hit.when > CACHE_TTL_MS) {
        store.delete(key);
        return null;
    }
    return hit.data;
}
export function setCached(key, data) {
    store.set(key, { data, when: Date.now() });
}
export function cacheStats() {
    return store.size;
}