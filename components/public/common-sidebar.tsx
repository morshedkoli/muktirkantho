import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { AdSlot } from "@/components/public/ad-slot";
import { PostImage } from "@/components/public/post-image";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getPostPath } from "@/lib/post-url";
import { formatBanglaDate } from "@/lib/bangla-date";
import { bnCount } from "@/lib/bn-number";
import { Eye } from "lucide-react";

/**
 * This sidebar renders on every listing page, all of which are dynamic because
 * of `?page=`. Caching keeps it to one query per 60s window instead of two per
 * request; the `posts` tag lets publishing invalidate it straight away.
 */
const getPopularPosts = unstable_cache(
  async () => {
    try {
      const posts = await prisma.post.findMany({
        where: { status: PostStatus.published },
        // Ranked by what readers actually opened. The panel has always been
        // headed "আলোচিত সংবাদ" while quietly listing the newest articles —
        // now that reads are counted, the list can mean what it says. The date
        // tiebreak keeps it sensible while a story has no reads yet.
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          publishedAt: true,
          viewCount: true,
          category: { select: { slug: true } },
          district: { select: { slug: true } },
        },
      });

      // The cache stores values as JSON, so `Date` comes back as an ISO string.
      // Normalize to a string here and let the formatter parse it, rather than
      // handing consumers a value whose type lies about what it holds.
      return posts.map((post) => ({
        ...post,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      }));
    } catch {
      return [];
    }
  },
  ["sidebar-popular-posts"],
  { revalidate: 60, tags: ["posts"] },
);

const getCategoriesWithCount = unstable_cache(
  async () => {
    try {
      return await prisma.category.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { posts: { where: { status: PostStatus.published } } } },
        },
      });
    } catch {
      return [];
    }
  },
  ["sidebar-categories"],
  { revalidate: 300, tags: ["posts", "categories"] },
);

export async function CommonSidebar() {
  const [popularPosts, categories] = await Promise.all([
    getPopularPosts(),
    getCategoriesWithCount(),
  ]);

  return (
    // Sits in a 300px grid column on every listing page, so it no longer needs
    // to fix its own width.
    <aside className="hidden min-w-0 space-y-6 lg:block">
      {/* আলোচিত সংবাদ — Popular Posts */}
      <section className="border border-[var(--np-border)] bg-[var(--np-card)]">
        <div className="border-l-4 border-[var(--np-primary)] px-4 py-3 bg-[var(--np-newsprint)]">
          <h3 className="font-label text-sm font-bold text-[var(--np-text-primary)] uppercase tracking-wide">
            আলোচিত সংবাদ
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {popularPosts.map((post, index) => {
            const postPath = getPostPath(post as Parameters<typeof getPostPath>[0]);
            return (
              <Link key={post.id} href={postPath} className="flex gap-3 group items-start">
                {/* Number */}
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--np-primary)] text-[var(--np-on-primary)] text-xs font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                {/* Thumbnail */}
                <div className="relative w-[64px] h-[48px] shrink-0 overflow-hidden bg-[var(--np-newsprint)]">
                  <PostImage src={post.imageUrl} alt={post.title} sizes="64px" />
                </div>
                {/* Title + date */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold leading-snug text-[var(--np-text-primary)] group-hover:text-[var(--np-primary)] transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="np-timestamp mt-0.5 flex flex-wrap items-center gap-x-2">
                    {post.publishedAt && <span>{formatBanglaDate(post.publishedAt)}</span>}
                    {post.viewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" aria-hidden />
                        {bnCount(post.viewCount)}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Sticky Sidebar Ad (300×600) */}
      <div className="sticky top-14">
        <AdSlot placement={AD_PLACEMENTS.SIDEBAR_STICKY} showPlaceholder={false} />
      </div>

      {/* বিভাগসমূহ — Categories */}
      <section className="border border-[var(--np-border)] bg-[var(--np-card)]">
        <div className="border-l-4 border-[var(--np-primary)] px-4 py-3 bg-[var(--np-newsprint)]">
          <h3 className="font-label text-sm font-bold text-[var(--np-text-primary)] uppercase tracking-wide">
            বিভাগসমূহ
          </h3>
        </div>
        <ul className="p-4 space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="flex items-center justify-between py-1.5 px-2 rounded-sm hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)] text-[var(--np-text-soft)] transition-colors group"
              >
                <span className="text-sm group-hover:text-[var(--np-primary)] transition-colors">
                  {category.name}
                </span>
                <span className="text-[10px] font-bold bg-[var(--np-newsprint-2)] text-[var(--np-muted)] px-1.5 py-0.5 rounded-full min-w-[24px] text-center">
                  {category._count.posts}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
