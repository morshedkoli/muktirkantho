import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DeviceKind } from "@/lib/analytics-dimensions";

/**
 * Traffic counting.
 *
 * Counts are recorded from a beacon the browser fires after the page renders,
 * not during the render itself. Two reasons: article pages are cached with
 * `revalidate = 60`, so a render-time increment would miss every cache hit and
 * count nothing on the ones it did see; and requiring JavaScript filters out
 * the crawlers that would otherwise dominate the numbers.
 *
 * Everything is stored pre-aggregated by UTC day. There is no per-visit row
 * anywhere in this system, which is what keeps it from needing a retention
 * policy — and what makes individual readers unreplayable, deliberately.
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

interface RecordViewInput {
  /** Present when the view was an article being read. */
  postId?: string | null;
  /** Normalised public path, or null to skip per-page counting. */
  path?: string | null;
  /** Acquisition source, or null when the view was same-site navigation. */
  source?: string | null;
  device: DeviceKind;
  /** False when this browser has already been counted today. */
  countVisitor: boolean;
  /** True when the browser arrived with no visitor cookie at all. */
  isNewVisitor: boolean;
}

/** Device counters for a freshly created day row. */
function deviceCreate(device: DeviceKind) {
  return {
    mobileViews: device === "mobile" ? 1 : 0,
    tabletViews: device === "tablet" ? 1 : 0,
    desktopViews: device === "desktop" ? 1 : 0,
  };
}

/** Only the one device counter this view belongs to moves. */
function deviceIncrement(device: DeviceKind): Prisma.DailyStatUpdateInput {
  if (device === "mobile") return { mobileViews: { increment: 1 } };
  if (device === "tablet") return { tabletViews: { increment: 1 } };
  return { desktopViews: { increment: 1 } };
}

/**
 * Record one tracked view across every aggregate it belongs to.
 *
 * The writes are independent upserts and run together rather than in sequence
 * — five sequential round trips to a remote Atlas instance is most of a second
 * spent on a counter nobody is waiting for. `allSettled` because a failure in,
 * say, the referrer roll-up must not cost us the page view: partial analytics
 * beat none, and the failure is logged rather than swallowed.
 */
export async function recordView({
  postId,
  path,
  source,
  device,
  countVisitor,
  isNewVisitor,
}: RecordViewInput): Promise<void> {
  const day = dayStart(dayKey());
  const isPostRead = Boolean(postId);
  const countNewVisitor = countVisitor && isNewVisitor;

  const writes: Array<readonly [string, Promise<unknown>]> = [
    [
      "day",
      prisma.dailyStat.upsert({
        where: { day },
        create: {
          day,
          pageViews: 1,
          postReads: isPostRead ? 1 : 0,
          visitors: countVisitor ? 1 : 0,
          newVisitors: countNewVisitor ? 1 : 0,
          ...deviceCreate(device),
        },
        update: {
          pageViews: { increment: 1 },
          ...(isPostRead ? { postReads: { increment: 1 } } : {}),
          ...(countVisitor ? { visitors: { increment: 1 } } : {}),
          ...(countNewVisitor ? { newVisitors: { increment: 1 } } : {}),
          ...deviceIncrement(device),
        },
      }),
    ],
  ];

  if (postId) {
    writes.push([
      // The lifetime per-article counter the leaderboard and the public read
      // count both read from. Guarded: a postId that no longer exists (a
      // deleted article still open in a tab) must not fail the whole request.
      "post",
      prisma.post
        .update({ where: { id: postId }, data: { viewCount: { increment: 1 } } })
        .catch(() => undefined),
    ]);
    writes.push([
      // Per-day reads, which is what "trending this week" is computed from.
      // Also guarded against the deleted-article case: the relation makes
      // Prisma reject a connect to a post that is gone, which is the point.
      "postDay",
      prisma.dailyPostStat
        .upsert({
          where: { day_postId: { day, postId } },
          create: { day, reads: 1, post: { connect: { id: postId } } },
          update: { reads: { increment: 1 } },
        })
        .catch(() => undefined),
    ]);
  }

  if (path) {
    writes.push([
      "path",
      prisma.dailyPathStat.upsert({
        where: { day_path: { day, path } },
        create: { day, path, views: 1 },
        update: { views: { increment: 1 } },
      }),
    ]);
  }

  if (source) {
    writes.push([
      "source",
      prisma.dailyReferrerStat.upsert({
        where: { day_source: { day, source } },
        create: { day, source, views: 1 },
        update: { views: { increment: 1 } },
      }),
    ]);
  }

  const results = await Promise.allSettled(writes.map(([, promise]) => promise));
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`[analytics] ${writes[index][0]} counter failed:`, result.reason);
    }
  });
}
