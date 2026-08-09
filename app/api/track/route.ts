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

/**
 * The traffic beacon.
 *
 * Deliberately unauthenticated and deliberately cheap: it takes at most a post
 * id, never trusts anything else the client says, and answers 204 whatever
 * happens. Analytics must not be able to break a page or leak whether an id
 * exists.
 */
export const dynamic = "force-dynamic";

/** Generous enough for real reading, tight enough that a script cannot inflate counts. */
const RATE_LIMIT = { limit: 40, windowMs: 60_000 };

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest) {
  // Bucketed by IP. Spoofable, but this is a counter, not an authorization
  // decision — it only has to make casual inflation tedious.
  const limit = checkRateLimit(`track:${getClientIp(request)}`, RATE_LIMIT);
  if (!limit.allowed) return noContent();

  let postId: string | null = null;
  try {
    const body = await request.json();
    const candidate = typeof body?.postId === "string" ? body.postId : null;
    // Validated as an id shape before it reaches a query.
    if (candidate && isObjectId(candidate)) postId = candidate;
  } catch {
    // No body, or not JSON. Still a page view.
  }

  const today = dayKey();
  const existingId = request.cookies.get(VISITOR_COOKIE)?.value;
  const lastCountedDay = request.cookies.get(VISITOR_DAY_COOKIE)?.value ?? null;

  const visitorId = existingId || newVisitorId();
  const countVisitor = lastCountedDay !== today;

  try {
    await recordView({ postId, countVisitor });
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
