/**
 * Simple in-memory rate limiter for login attempts.
 * Tracks attempts by key (email or IP) and blocks after MAX_ATTEMPTS
 * within the WINDOW_MS time window.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type Entry = {
    count: number;
    resetAt: number;
};

const store = new Map<string, Entry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (now > entry.resetAt) {
            store.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Check whether a key has exceeded the rate limit.
 * Returns { allowed: true } if the request should proceed,
 * or { allowed: false, retryAfterSeconds } if blocked.
 */
export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true };
    }

    entry.count += 1;

    if (entry.count > MAX_ATTEMPTS) {
        const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
        return { allowed: false, retryAfterSeconds };
    }

    return { allowed: true };
}

/**
 * Reset the rate limit for a key (e.g. after successful login).
 */
export function resetRateLimit(key: string) {
    store.delete(key);
}
