/**
 * Turning a raw beacon into the handful of dimensions we actually count.
 *
 * Everything here is a pure function over untrusted input — the beacon is
 * unauthenticated, so a path, a referrer and a user agent are all strings a
 * stranger chose. Each one is normalised to a bounded set of values before it
 * can become a database key, because an unbounded key is how an analytics
 * table turns into a spam target.
 */

export type DeviceKind = "mobile" | "tablet" | "desktop";

/** The source recorded for a view that arrived with no referrer at all. */
export const DIRECT_SOURCE = "direct";

/** Long enough for the deepest Bangla slug, short enough to reject junk. */
const MAX_PATH_LENGTH = 200;
const MAX_SOURCE_LENGTH = 100;

/**
 * Routes that must never appear in reader analytics.
 *
 * The tracker only mounts in the public layout, so these cannot arrive
 * honestly — but the endpoint is open, and editor traffic mixed into the
 * newsroom's own numbers would be worse than no numbers.
 */
const EXCLUDED_PREFIXES = ["/admin", "/api"];

/**
 * Normalise a client-supplied pathname, or reject it.
 *
 * Query strings and fragments are dropped: `/news?page=2` and `/news?page=3`
 * are the same page for the purpose of "which pages get read", and keeping
 * them apart would fragment the list into noise.
 *
 * The path is decoded before it is measured or stored. A Bangla slug arrives
 * percent-encoded, where every character costs nine — an encoded headline runs
 * past any sane length limit, so measuring the raw form would silently reject
 * every article on the site and leave "top pages" showing only the listings.
 * Storing the decoded form also means the value reads as a URL in the console
 * and works directly as a `next/link` href.
 */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  // Cheap bound on the encoded form before spending a decode on it.
  if (!trimmed.startsWith("/") || trimmed.length > MAX_PATH_LENGTH * 12) return null;

  const withoutQuery = trimmed.split(/[?#]/, 1)[0];

  let decoded: string;
  try {
    decoded = decodeURIComponent(withoutQuery);
  } catch {
    // A malformed escape sequence is not a real navigation.
    return null;
  }

  if (decoded.length > MAX_PATH_LENGTH) return null;
  // Control characters have no business in a URL path. Checked by code point
  // rather than a regex so the source file itself stays free of them. Done
  // after decoding, where an escaped one would otherwise slip through.
  for (let index = 0; index < decoded.length; index += 1) {
    const code = decoded.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return null;
  }

  // Trailing slashes are cosmetic; `/news/` and `/news` are one page.
  const path = decoded.length > 1 ? decoded.replace(/\/+$/, "") : decoded;
  if (!path) return "/";

  if (EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return null;
  }

  return path;
}

/**
 * Hosts worth naming.
 *
 * A referrer arrives as any of `m.facebook.com`, `l.facebook.com` or
 * `lm.facebook.com` depending on the reader's app, and listing those as three
 * separate sources would understate Facebook by two thirds.
 */
const KNOWN_SOURCES: ReadonlyArray<readonly [RegExp, string]> = [
  [/(^|\.)facebook\.com$/, "Facebook"],
  [/(^|\.)fb\.(com|me)$/, "Facebook"],
  [/(^|\.)messenger\.com$/, "Messenger"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, "X"],
  [/(^|\.)(whatsapp\.com)$/, "WhatsApp"],
  [/^wa\.me$/, "WhatsApp"],
  [/^t\.me$/, "Telegram"],
  [/(^|\.)linkedin\.com$/, "LinkedIn"],
  [/(^|\.)(youtube\.com)$/, "YouTube"],
  [/^youtu\.be$/, "YouTube"],
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)news\.google\./, "Google News"],
];

function stripWww(host: string): string {
  return host.replace(/^www\./, "");
}

/**
 * Reduce a referrer to an acquisition source.
 *
 * Returns `null` for a view that should not be attributed at all — a
 * same-site click is navigation, not acquisition, and counting it would make
 * the site its own biggest referrer by an order of magnitude.
 */
export function normalizeSource(referrer: unknown, selfHost: string | null): string | null {
  if (typeof referrer !== "string" || !referrer.trim()) return DIRECT_SOURCE;

  let host: string;
  try {
    host = stripWww(new URL(referrer).hostname.toLowerCase());
  } catch {
    // Not a URL. Silently dropped rather than recorded as an odd source.
    return null;
  }

  if (!host) return null;
  if (selfHost && host === stripWww(selfHost.toLowerCase())) return null;

  const known = KNOWN_SOURCES.find(([pattern]) => pattern.test(host));
  return known ? known[1] : host.slice(0, MAX_SOURCE_LENGTH);
}

/**
 * Device class from the user agent.
 *
 * Tablets are checked first: an Android tablet's UA contains `Android` but not
 * `Mobile`, so the mobile test alone would file iPads and Android tablets in
 * whichever bucket happened to be tested first.
 */
export function detectDevice(userAgent: string | null): DeviceKind {
  const ua = userAgent ?? "";
  if (/ipad|tablet|playbook|silk|kindle|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Obvious automated traffic.
 *
 * The beacon needs JavaScript, which already excludes most crawlers. This
 * catches the headless ones — uptime monitors, Lighthouse runs, the SEO
 * crawlers an editor points at their own site — that would otherwise show up
 * as a suspiciously loyal daily reader.
 */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headlesschrome|lighthouse|pagespeed|pingdom|gtmetrix|semrush|ahrefs|mj12|dataprovider|python-requests|curl\/|wget|axios\/|node-fetch|okhttp|postman/i;

export function isBotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true; // A real browser always sends one.
  return BOT_PATTERN.test(userAgent);
}
