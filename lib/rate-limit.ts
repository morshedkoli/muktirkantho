/**
 * Simple in-memory rate limiter.
 * Tracks attempts by key (email or IP) and blocks after `limit` attempts
 * within the `windowMs` time window.
 *
 * LIMITATION: State lives in process memory — it resets on server restart and
 * does not share counts across multiple server instances (horizontal scaling).
 * For production with multiple replicas, replace the Map with a Redis store
 * (e.g. `ioredis` + sliding window counter) so limits are enforced globally.
 */

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 10_000;

type Entry = {
    count: number;
    resetAt: number;
};

export type RateLimitOptions = {
    limit?: number;
    windowMs?: number;
};

export type RateLimitResult = {
    allowed: boolean;
    retryAfterSeconds?: number;
};

const store = new Map<string, Entry>();
let lastSweepAt = 0;

/**
 * Drop expired entries. Called opportunistically from `checkRateLimit` rather
 * than from a `setInterval`, which would keep a timer alive for the lifetime of
 * the process and leak a new one on every dev-server hot reload.
 */
function sweep(now: number) {
    if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
    lastSweepAt = now;
    for (const [key, entry] of store) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}

/**
 * Check whether a key has exceeded the rate limit.
 * Returns { allowed: true } if the request should proceed,
 * or { allowed: false, retryAfterSeconds } if blocked.
 */
export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
    const limit = options.limit ?? DEFAULT_LIMIT;
    const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
    const now = Date.now();
    sweep(now);

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        // Hard cap the map so a flood of unique keys can't exhaust memory.
        if (store.size >= MAX_ENTRIES) store.clear();
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
    }

    entry.count += 1;

    if (entry.count > limit) {
        return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
    }

    return { allowed: true };
}

/**
 * Reset the rate limit for a key (e.g. after successful login).
 */
export function resetRateLimit(key: string) {
    store.delete(key);
}

/**
 * Best-effort client IP from proxy headers. Used only as a rate-limit bucket —
 * these headers are spoofable, so never use the result for authorization.
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}
