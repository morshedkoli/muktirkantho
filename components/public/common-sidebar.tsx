import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";
import { AdSlot } from "@/components/public/ad-slot";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getPostPath } from "@/lib/post-url";
import { formatBanglaDate } from "@/lib/bangla-date";

async function getPopularPosts() {
  try {
    return await prisma.post.findMany({
      where: { status: PostStatus.published },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        publishedAt: true,
        category: { select: { slug: true } },
        district: { select: { slug: true } },
      },
    });
  } catch {
    return [];
  }
}

async function getCategoriesWithCount() {
  try {
    return await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { posts: { where: { status: PostStatus.published } } } },
      },
    });
  } catch {
    return [];
  }
}

export async function CommonSidebar() {
  const [popularPosts, categories] = await Promise.all([
    getPopularPosts(),
    getCategoriesWithCount(),
  ]);

  return (
    <aside className="hidden lg:block w-[300px] shrink-0 space-y-6">
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
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--np-primary)] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {index + 1}
                </span>
                {/* Thumbnail */}
                {post.imageUrl ? (
                  <div className="relative w-[64px] h-[48px] shrink-0 overflow-hidden bg-[var(--np-newsprint)]">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-[64px] h-[48px] shrink-0 bg-[var(--np-newsprint)]" />
                )}
                {/* Title + date */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold leading-snug text-[var(--np-text-primary)] group-hover:text-[var(--np-primary)] transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  {post.publishedAt && (
                    <p className="np-timestamp mt-0.5">{formatBanglaDate(post.publishedAt)}</p>
                  )}
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
