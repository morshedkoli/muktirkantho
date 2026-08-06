import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Admin writes are interactive, so the ceiling only needs to stop scripted abuse.
const WRITE_LIMIT = 60;
const WRITE_WINDOW_MS = 60 * 1000;

/**
 * Guard for admin-only route handlers.
 *
 * Returns a `NextResponse` when the request must be rejected, or `null` when it
 * may proceed — so call sites read:
 *
 *   const denied = await requireAdmin(request);
 *   if (denied) return denied;
 *
 * For state-changing methods this also enforces a same-origin (CSRF) check and a
 * per-IP write budget. Server Actions get the same treatment via
 * `requireActionAdmin` in `app/(admin)/admin/actions.ts`.
 */
export async function requireAdmin(request: Request): Promise<NextResponse | null> {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (SAFE_METHODS.has(request.method)) return null;

  try {
    await verifyCsrf();
  } catch {
    // Deliberately opaque: the detailed reason is only useful to an attacker.
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limit = checkRateLimit(`admin:write:${getClientIp(request)}`, {
    limit: WRITE_LIMIT,
    windowMs: WRITE_WINDOW_MS,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  return null;
}

/**
 * Rate limit an unauthenticated (public) endpoint by client IP.
 * Returns a 429 response when the caller is over budget, otherwise `null`.
 */
export function limitPublicRequest(
  request: Request,
  bucket: string,
  options?: { limit?: number; windowMs?: number },
): NextResponse | null {
  const result = checkRateLimit(`${bucket}:${getClientIp(request)}`, options);
  if (result.allowed) return null;

  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}
