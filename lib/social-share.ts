import { PostStatus, ShareStatus, SocialPlatform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import {
  FacebookApiError,
  formatFacebookPost,
  getFacebookPermalink,
  postToFacebookPage,
} from "@/lib/facebook";
import { getEncodedPostPath } from "@/lib/post-url";

export { shouldAutoShare, type AutoShareDecision } from "@/lib/social-share-policy";

/**
 * The single place a post is published to a social network.
 *
 * Auto-post on save, the manual "share now" button and the retry button all
 * funnel through `sharePostToFacebook` so they cannot drift apart — one set of
 * guards, one idempotency rule, one shape of recorded outcome.
 */

export type ShareTrigger = "auto" | "manual" | "retry";

export type ShareOutcome =
  | { ok: true; status: "shared"; url: string; message: string }
  | { ok: true; status: "skipped"; reason: SkipReason; message: string }
  | { ok: false; status: "failed"; message: string; needsReconnect: boolean };

export type SkipReason =
  | "not-connected"
  | "not-published"
  | "already-shared"
  | "post-missing"
  | "in-flight";

const SKIP_MESSAGES: Record<SkipReason, string> = {
  "not-connected": "No Facebook page is connected.",
  "not-published": "Only published posts can be shared.",
  "already-shared": "This post has already been shared to Facebook.",
  "post-missing": "Post not found.",
  "in-flight": "A share for this post is already in progress.",
};

const skip = (reason: SkipReason): ShareOutcome => ({
  ok: true,
  status: "skipped",
  reason,
  message: SKIP_MESSAGES[reason],
});

/**
 * How long a `pending` row is trusted to mean "a share is genuinely running".
 *
 * The row is claimed before the Graph call and resolved after it, so a request
 * killed in between (function timeout, redeploy) leaves `pending` behind with
 * nothing to ever clear it. Without a cutoff that post can never be shared
 * again — not by auto-post, not by the retry button. Past this age the claim is
 * assumed dead and the row is reclaimable.
 */
export const IN_FLIGHT_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Whether a `pending` claim is old enough for the pipeline to take it over.
 *
 * Exported so the queue screen decides with the same rule the claim uses —
 * otherwise the UI could offer a retry that the pipeline turns down as
 * in-flight, or hide one it would have accepted.
 */
export function isClaimStale(lastAttemptAt: Date | null): boolean {
  if (!lastAttemptAt) return true;
  return Date.now() - lastAttemptAt.getTime() > IN_FLIGHT_TIMEOUT_MS;
}

/** True for Prisma's unique-constraint violation — the concurrent-claim signal. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && (error as { code?: unknown }).code === "P2002"
  );
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

/**
 * Share a published post to the connected Facebook page.
 *
 * Idempotency is enforced by the (postId, platform) row rather than by
 * checking-then-writing: the row is claimed first, and a claim that loses the
 * race is reported as skipped. Two concurrent saves therefore produce one
 * Facebook post, not two.
 *
 * The claim is a compare-and-swap in both directions — a unique constraint on
 * insert, a conditional update on an existing row — because the constraint only
 * guards the first attempt. A plain update would let a manual click join an
 * auto-share that is still in flight and publish the article twice.
 */
export async function sharePostToFacebook(
  postId: string,
  trigger: ShareTrigger = "auto",
): Promise<ShareOutcome> {
  const [post, settings] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        status: true,
        category: { select: { name: true } },
        district: { select: { name: true } },
      },
    }),
    getSiteSettings(),
  ]);

  if (!post) return skip("post-missing");
  if (post.status !== PostStatus.published) return skip("not-published");

  if (
    !settings?.facebookConnected ||
    !settings.facebookPageAccessToken ||
    !settings.facebookPageId
  ) {
    return skip("not-connected");
  }

  const existing = await prisma.socialShare.findUnique({
    where: { postId_platform: { postId, platform: SocialPlatform.facebook } },
    select: { id: true, status: true },
  });

  // A successful share is final. Retrying a `failed` row is the point of the
  // retry button, so only `shared` blocks.
  if (existing?.status === ShareStatus.shared) return skip("already-shared");

  // Claim the attempt before calling out, so a share that is already running
  // turns this one into a no-op instead of a second Facebook post.
  let shareId: string;
  if (existing) {
    const staleBefore = new Date(Date.now() - IN_FLIGHT_TIMEOUT_MS);

    // The predicate is written out in full rather than derived from the row we
    // just read: between the read and this write another request may have
    // claimed it, and only the database can settle that race. `updateMany`
    // re-evaluates the filter under the document lock, so exactly one caller
    // sees count === 1.
    const claimed = await prisma.socialShare.updateMany({
      where: {
        id: existing.id,
        OR: [
          { status: ShareStatus.failed },
          // A pending row is only reclaimable once its claim has gone stale.
          { status: ShareStatus.pending, lastAttemptAt: null },
          { status: ShareStatus.pending, lastAttemptAt: { lt: staleBefore } },
        ],
      },
      data: {
        status: ShareStatus.pending,
        trigger,
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
        error: null,
      },
    });

    if (claimed.count === 0) {
      // Someone else holds the claim, or it turned `shared` while we looked.
      return skip("in-flight");
    }
    shareId = existing.id;
  } else {
    try {
      const created = await prisma.socialShare.create({
        data: {
          postId,
          platform: SocialPlatform.facebook,
          status: ShareStatus.pending,
          trigger,
          attempts: 1,
          lastAttemptAt: new Date(),
        },
        select: { id: true },
      });
      shareId = created.id;
    } catch (error) {
      // Only a unique violation means "a concurrent save claimed it first".
      // Anything else is the database failing, and reporting that as a
      // harmless skip would hide an outage behind a reassuring message.
      if (isUniqueViolation(error)) return skip("in-flight");

      const message =
        error instanceof Error ? error.message : "Could not record the share attempt";
      console.error(`[social-share] Could not claim a share for post ${postId}:`, message);
      return { ok: false, status: "failed", message, needsReconnect: false };
    }
  }

  // Encoded: this string is handed to the Graph API as a link, and Facebook
  // will not accept a URL with raw Bangla characters in the path.
  const url = `${siteUrl()}${getEncodedPostPath(post)}`;
  const message = formatFacebookPost(
    post.title,
    post.excerpt,
    post.category?.name ?? "News",
    url,
    post.district?.name,
  );

  try {
    const response = await postToFacebookPage(
      settings.facebookPageId,
      settings.facebookPageAccessToken,
      message,
      url,
      post.imageUrl || undefined,
    );

    const permalink = getFacebookPermalink(response);
    await prisma.socialShare.update({
      where: { id: shareId },
      data: {
        status: ShareStatus.shared,
        externalId: response.post_id ?? response.id,
        externalUrl: permalink,
        sharedAt: new Date(),
        error: null,
      },
    });

    return { ok: true, status: "shared", url: permalink, message: "Shared to Facebook." };
  } catch (error) {
    const isApiError = error instanceof FacebookApiError;
    const reason = error instanceof Error ? error.message : "Failed to share to Facebook";
    const needsReconnect = isApiError && error.isAuthError;

    await prisma.socialShare.update({
      where: { id: shareId },
      data: { status: ShareStatus.failed, error: reason },
    });

    // Logged as well as recorded: the row is for the editor, the log is for
    // whoever is reading the server output when a whole batch starts failing.
    console.error(`[social-share] Facebook share failed for post ${postId}:`, reason);

    return {
      ok: false,
      status: "failed",
      message: needsReconnect
        ? `Facebook rejected the request: ${reason} Reconnect the page to continue auto-posting.`
        : reason,
      needsReconnect,
    };
  }
}

/**
 * Fire-and-forget wrapper used on the save path.
 *
 * A social outage must never fail an editor's save, so this resolves to the
 * outcome and never throws; callers that care (the manual button) use
 * `sharePostToFacebook` directly and surface the result.
 */
export async function autoShareOnPublish(postId: string): Promise<ShareOutcome> {
  try {
    return await sharePostToFacebook(postId, "auto");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auto-share failed";
    console.error(`[social-share] Auto-share crashed for post ${postId}:`, message);
    return { ok: false, status: "failed", message, needsReconnect: false };
  }
}
