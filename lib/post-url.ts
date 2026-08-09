import { isGeneratedPlaceholderSlug } from "@/lib/slug";

type PostIdentifier = {
  id?: string | null;
  slug?: string | null;
};

/**
 * The article's path, with the slug in its own script.
 *
 * Returned undecorated for use as a `next/link` href or a route target — the
 * browser percent-encodes it on request, and encoding it here would risk the
 * `%` itself being escaped again. Anywhere the path becomes a real URL string
 * (a Location header, the sitemap, a link handed to Facebook) use
 * `getEncodedPostPath` instead.
 */
export function getPostPath(post: PostIdentifier) {
  const slug = post.slug?.trim();
  // A placeholder slug is not a permalink — it describes nothing and they all
  // look alike. Fall back to the id until the slug is backfilled from a title.
  if (slug && !isGeneratedPlaceholderSlug(slug)) {
    return `/news/${slug}`;
  }

  const id = post.id?.trim();
  if (id) {
    return `/news/${id}`;
  }

  return "/news";
}

/** Percent-encoded path, safe to put in a header, a sitemap, or an absolute URL. */
export function getEncodedPostPath(post: PostIdentifier) {
  const path = getPostPath(post);
  if (!path.startsWith("/news/")) return path;
  return `/news/${encodeURIComponent(path.slice("/news/".length))}`;
}
