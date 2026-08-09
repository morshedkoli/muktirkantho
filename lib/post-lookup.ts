import type { Prisma } from "@prisma/client";
import { isObjectId } from "@/lib/object-id";

/**
 * Resolving the `[slug]` segment of an article URL.
 *
 * Three things can arrive there and all three have to work:
 *   - the current slug, which renders;
 *   - a slug the post used to have, which must redirect rather than 404;
 *   - a raw ObjectId, which is what older links and the id fallback produce.
 *
 * Only the first is canonical. The route answers the other two with a 308 so
 * search engines consolidate onto one address instead of indexing three.
 *
 * Callers run their own query — the page and its metadata need different
 * fields — and share the two rules that matter: what to match, and which match
 * wins.
 */

export function postPathFilters(segment: string): Prisma.PostWhereInput[] {
  const filters: Prisma.PostWhereInput[] = [
    { slug: segment },
    { slugHistory: { has: segment } },
  ];
  if (isObjectId(segment)) filters.push({ id: segment });
  return filters;
}

/**
 * Choose the row the URL actually meant.
 *
 * An OR across three fields gives no control over ordering, so query with
 * `findMany` and settle it here: an exact slug match always wins. Taking
 * whichever row the database returned first could pick a historical match over
 * the live one and redirect a perfectly good URL onto itself.
 */
export function pickCanonical<T extends { slug: string }>(
  rows: T[],
  segment: string,
): { post: T; isCanonical: boolean } | null {
  if (rows.length === 0) return null;
  const post = rows.find((row) => row.slug === segment) ?? rows[0];
  return { post, isCanonical: post.slug === segment };
}
