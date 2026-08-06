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
 *
 * The comparison is on host, not scheme: `x-forwarded-proto` is absent in local
 * dev and behind some proxies, and guessing wrong there would reject every
 * legitimate admin request. Accepting either scheme for *our own host* costs
 * nothing — an attacker's page is on a different host either way.
 */
export async function verifyCsrf() {
    const hdrs = await headers();
    const origin = hdrs.get("origin");
    const referer = hdrs.get("referer");

    // The request's true host (Vercel/edge proxies use x-forwarded-host)
    const expectedHost = hdrs.get("x-forwarded-host") || hdrs.get("host");
    if (!expectedHost) {
        // If we can't determine our own host, fail safe and reject
        if (origin || referer) {
            throw new Error("CSRF check failed: cannot determine host");
        }
        return; // no headers at all — same-origin fetch
    }

    const allowedHosts = new Set<string>([expectedHost.toLowerCase()]);
    // Also accept the env-configured site URL as a fallback
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (configured) {
        try {
            allowedHosts.add(new URL(configured).host.toLowerCase());
        } catch {
            /* ignore a malformed NEXT_PUBLIC_SITE_URL */
        }
    }

    const matches = (value: string) => {
        try {
            return allowedHosts.has(new URL(value).host.toLowerCase());
        } catch {
            return false;
        }
    };

    if (origin) {
        if (!matches(origin)) {
            throw new Error(`CSRF check failed: origin mismatch (got ${origin}, expected ${expectedHost})`);
        }
        return;
    }

    if (referer) {
        if (!matches(referer)) {
            throw new Error(`CSRF check failed: referer mismatch (got ${referer}, expected ${expectedHost})`);
        }
        return;
    }

    // Neither header — allow (same-origin fetch can legitimately omit both).
}
