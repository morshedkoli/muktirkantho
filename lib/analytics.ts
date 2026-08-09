import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Traffic counting.
 *
 * Counts are recorded from a beacon the browser fires after the page renders,
 * not during the render itself. Two reasons: article pages are cached with
 * `revalidate = 60`, so a render-time increment would miss every cache hit and
 * count nothing on the ones it did see; and requiring JavaScript filters out
 * the crawlers that would otherwise dominate the numbers.
 */

/** Identifies a browser across days so a returning reader is not a new visitor. */
export const VISITOR_COOKIE = "mk_vid";
/** The last day this browser was counted, so `visitors` stays a daily distinct count. */
export const VISITOR_DAY_COOKIE = "mk_vday";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** `YYYY-MM-DD` in UTC — the key both the cookie and the DailyStat row agree on. */
export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Midnight UTC for a day key, used as the DailyStat primary key. */
export function dayStart(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function newVisitorId(): string {
  return randomUUID();
}

export const visitorCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: COOKIE_MAX_AGE_SECONDS,
};

/**
 * Record one tracked view.
 *
 * The three counters move together in a single upsert so a day's row is
 * created on its first hit and incremented thereafter. `visitors` only moves
 * when this browser has not already been counted today, which the caller
 * determines from the cookie it holds.
 */
export async function recordView({
  postId,
  countVisitor,
}: {
  postId?: string | null;
  countVisitor: boolean;
}): Promise<void> {
  const key = dayKey();
  const day = dayStart(key);
  const isPostRead = Boolean(postId);

  await prisma.dailyStat.upsert({
    where: { day },
    create: {
      day,
      pageViews: 1,
      postReads: isPostRead ? 1 : 0,
      visitors: countVisitor ? 1 : 0,
    },
    update: {
      pageViews: { increment: 1 },
      ...(isPostRead ? { postReads: { increment: 1 } } : {}),
      ...(countVisitor ? { visitors: { increment: 1 } } : {}),
    },
  });

  if (postId) {
    // The lifetime per-article counter the leaderboard and the public read
    // count both read from. Guarded: a postId that no longer exists (a deleted
    // article still open in a tab) must not fail the whole request.
    await prisma.post
      .update({ where: { id: postId }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);
  }
}
