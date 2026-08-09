import { NextResponse, type NextRequest } from "next/server";
import { isObjectId } from "@/lib/object-id";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  VISITOR_COOKIE,
  VISITOR_DAY_COOKIE,
  dayKey,
  newVisitorId,
  recordView,
  visitorCookieOptions,
} from "@/lib/analytics";
import {
  detectDevice,
  isBotUserAgent,
  normalizePath,
  normalizeSource,
} from "@/lib/analytics-dimensions";

/**
 * The traffic beacon.
 *
 * Deliberately unauthenticated and deliberately cheap: it takes a post id, a
 * path and a referrer, never trusts any of them, and answers 204 whatever
 * happens. Analytics must not be able to break a page or leak whether an id
 * exists.
 */
export const dynamic = "force-dynamic";

/** Generous enough for real reading, tight enough that a script cannot inflate counts. */
const RATE_LIMIT = { limit: 40, windowMs: 60_000 };

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent");
  // Uptime monitors and SEO crawlers execute JavaScript now, so the beacon
  // alone no longer excludes them. Dropped before the rate limiter so a busy
  // crawler cannot spend a real reader's budget.
  if (isBotUserAgent(userAgent)) return noContent();

  // Bucketed by IP. Spoofable, but this is a counter, not an authorization
  // decision — it only has to make casual inflation tedious.
  const limit = checkRateLimit(`track:${getClientIp(request)}`, RATE_LIMIT);
  if (!limit.allowed) return noContent();

  let postId: string | null = null;
  let path: string | null = null;
  let source: string | null = null;

  try {
    const body = await request.json();
    const candidate = typeof body?.postId === "string" ? body.postId : null;
    // Validated as an id shape before it reaches a query.
    if (candidate && isObjectId(candidate)) postId = candidate;
    path = normalizePath(body?.path);
    // `request.nextUrl.host` is this deployment's own host, which is how a
    // same-site click is told apart from an actual referral.
    source = normalizeSource(body?.referrer, request.nextUrl.host);
  } catch {
    // No body, or not JSON. Still a page view.
  }

  const today = dayKey();
  const existingId = request.cookies.get(VISITOR_COOKIE)?.value;
  const lastCountedDay = request.cookies.get(VISITOR_DAY_COOKIE)?.value ?? null;

  const visitorId = existingId || newVisitorId();
  const countVisitor = lastCountedDay !== today;

  try {
    await recordView({
      postId,
      path,
      source,
      device: detectDevice(userAgent),
      countVisitor,
      isNewVisitor: !existingId,
    });
  } catch (error) {
    // An analytics write must never surface to the reader. Logged so a broken
    // counter is visible in the server output rather than silently flatlining.
    console.error("[track] Failed to record view:", error);
    return noContent();
  }

  const response = noContent();
  if (!existingId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, visitorCookieOptions);
  }
  if (countVisitor) {
    response.cookies.set(VISITOR_DAY_COOKIE, today, visitorCookieOptions);
  }
  return response;
}
