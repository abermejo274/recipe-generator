const WINDOW = 60_000;
const MAX = 30;
const hits = new Map();
export function rateLimit(req, res, next) {
    const now = Date.now();
    const ip = req.ip;
    const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW);
    arr.push(now);
    hits.set(ip, arr);
    if (arr.length > MAX) {
        return res.status(429).json({ error: "Rate limit exceeded. Retry later." });
    }
    next();
}