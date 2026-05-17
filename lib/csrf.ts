import { headers } from "next/headers";

/**
 * Verify that the request Origin / Referer matches the site URL.
 * Call this at the top of any server action that mutates data.
 * Throws an error if the origin is suspicious (possible CSRF attack).
 */
export async function verifyCsrf() {
    const hdrs = await headers();
    const origin = hdrs.get("origin");
    const referer = hdrs.get("referer");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const allowedOrigin = new URL(siteUrl).origin;

    // At least one of origin / referer must be present and match
    if (origin) {
        if (origin !== allowedOrigin) {
            throw new Error("CSRF check failed: origin mismatch");
        }
        return;
    }

    if (referer) {
        try {
            const refOrigin = new URL(referer).origin;
            if (refOrigin !== allowedOrigin) {
                throw new Error("CSRF check failed: referer mismatch");
            }
            return;
        } catch {
            throw new Error("CSRF check failed: invalid referer");
        }
    }

    // If neither header is present, allow — same-origin fetch can legitimately omit both.
    // NOTE: For stronger CSRF protection, replace this header-origin check with a
    // double-submit cookie or synchronizer token pattern so requests without
    // Origin/Referer (old browsers, certain proxies) are still protected.
}
