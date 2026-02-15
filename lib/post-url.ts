type PostIdentifier = {
  id?: string | null;
  slug?: string | null;
};

function isPlaceholderSlug(slug: string) {
  return slug.toLowerCase() === "post";
}

export function getPostPath(post: PostIdentifier) {
  const slug = post.slug?.trim();
  if (slug && !isPlaceholderSlug(slug)) {
    return `/news/${slug}`;
  }

  const id = post.id?.trim();
  if (id) {
    return `/news/${id}`;
  }

  return "/news";
}
