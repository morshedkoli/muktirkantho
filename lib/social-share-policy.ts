/**
 * When publishing a post should trigger an automatic share.
 *
 * Kept pure and import-free so the rule is stated once, testable, and readable
 * without tracing through Prisma calls. The share pipeline owns the *doing*;
 * this owns the *deciding*.
 */

export interface AutoShareDecision {
  /** The post's status after this save — only published posts are shareable. */
  isPublished: boolean;
  /** The site-wide "auto-post to Facebook" switch. */
  globalAutoPost: boolean;
  /**
   * The per-post checkbox, or `undefined` when the editor never rendered it
   * (no page connected), which means "no opinion — defer to the global switch".
   */
  perPostToggle: boolean | undefined;
}

/**
 * The per-post checkbox is an override in BOTH directions: it can share while
 * the global switch is off, and unticking it suppresses a share the global
 * switch would otherwise have made. Anything else would make the checkbox a
 * lie in one of the two cases.
 */
export function shouldAutoShare({
  isPublished,
  globalAutoPost,
  perPostToggle,
}: AutoShareDecision): boolean {
  if (!isPublished) return false;
  if (perPostToggle !== undefined) return perPostToggle;
  return globalAutoPost;
}
