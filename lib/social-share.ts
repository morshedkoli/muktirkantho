import { PostStatus, ShareStatus, SocialPlatform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import {
  FacebookApiError,
  formatFacebookPost,
  getFacebookPermalink,
  postToFacebookPage,
} from "@/lib/facebook";
import { getPostPath } from "@/lib/post-url";

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

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

/**
 * Share a published post to the connected Facebook page.
 *
 * Idempotency is enforced by the unique (postId, platform) row rather than by
 * checking-then-writing: the row is claimed first, and a claim that loses the
 * race is reported as skipped. Two concurrent saves therefore produce one
 * Facebook post, not two.
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

  // Claim the attempt before calling out. If another request is mid-flight the
  // unique constraint rejects this create and we back off rather than posting
  // twice.
  let shareId: string;
  if (existing) {
    shareId = existing.id;
    await prisma.socialShare.update({
      where: { id: existing.id },
      data: {
        status: ShareStatus.pending,
        trigger,
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
        error: null,
      },
    });
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
    } catch {
      // Unique violation — a concurrent save claimed it first.
      return skip("in-flight");
    }
  }

  const url = `${siteUrl()}${getPostPath(post)}`;
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
