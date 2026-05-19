import { headers } from "next/headers";

/**
 * Verify that the request Origin / Referer matches the request's own host.
 *
 * This is a same-origin check: a legitimate browser form submission always
 * carries an Origin (or at least Referer) that matches the Host header of
 * the request itself. A cross-site attacker's request will have an Origin
 * from their own site (different from the user's host), so the check still
 * catches CSRF.
 *
 * Why not compare to NEXT_PUBLIC_SITE_URL?
 *   In production behind Vercel, an admin can hit the site via several
 *   hostnames (apex, www, branch preview URLs, vercel.app). Hard-coding
 *   one canonical origin means every other host fails CSRF and the site
 *   crashes on form submit. The request's own Host header is authoritative.
 */
export async function verifyCsrf() {
    const hdrs = await headers();
    const origin = hdrs.get("origin");
    const referer = hdrs.get("referer");
    const host = hdrs.get("host");
    const forwardedHost = hdrs.get("x-forwarded-host");
    const forwardedProto = hdrs.get("x-forwarded-proto") ?? "https";

    // The request's true host (Vercel/edge proxies use x-forwarded-host)
    const expectedHost = forwardedHost || host;
    if (!expectedHost) {
        // If we can't determine our own host, fail safe and reject
        if (origin || referer) {
            throw new Error("CSRF check failed: cannot determine host");
        }
        return; // no headers at all — same-origin fetch
    }

    const expectedOrigin = `${forwardedProto}://${expectedHost}`;
    // Also accept the env-configured site URL as a fallback
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    const allowedOrigins = new Set<string>([expectedOrigin]);
    if (configured) {
        try { allowedOrigins.add(new URL(configured).origin); } catch { /* ignore */ }
    }

    if (origin) {
        if (!allowedOrigins.has(origin)) {
            throw new Error(`CSRF check failed: origin mismatch (got ${origin}, expected ${expectedOrigin})`);
        }
        return;
    }

    if (referer) {
        try {
            const refOrigin = new URL(referer).origin;
            if (!allowedOrigins.has(refOrigin)) {
                throw new Error(`CSRF check failed: referer mismatch (got ${refOrigin}, expected ${expectedOrigin})`);
            }
            return;
        } catch {
            throw new Error("CSRF check failed: invalid referer");
        }
    }

    // Neither header — allow (same-origin fetch can legitimately omit both).
}
