import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { renderContent } from "@/lib/content";
import { isObjectId } from "@/lib/object-id";
import { getPostPath } from "@/lib/post-url";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { AdSlot } from "@/components/public/ad-slot";
import { CopyLinkButton } from "@/components/public/copy-link-button";
import { ImageWatermark } from "@/components/public/image-watermark";
import { CommonSidebar } from "@/components/public/common-sidebar";
import { PrintButton } from "@/components/public/print-button";
import { Facebook, Twitter, MessageCircle } from "lucide-react";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// Split rendered HTML at the paragraph boundary closest to the middle.
// Used once to position both video embeds and inline ads consistently.
function splitHtmlAtMiddleParagraph(html: string): { before: string; after: string } {
  if (!html) return { before: "", after: "" };
  const parts = html.split("</p>");
  if (parts.length <= 1) return { before: html, after: "" };
  const splitAt = Math.max(1, Math.floor(parts.length / 2));
  return {
    before: parts.slice(0, splitAt).join("</p>") + "</p>",
    after: parts.slice(splitAt).join("</p>"),
  };
}

function getBanglaRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "এখনই";
  if (diffMin < 60) return `${diffMin} মিনিট আগে`;
  if (diffHr < 24) return `${diffHr} ঘণ্টা আগে`;
  if (diffDay < 7) return `${diffDay} দিন আগে`;
  return new Intl.DateTimeFormat("bn-BD", { month: "long", day: "numeric" }).format(date);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const filters: Prisma.PostWhereInput[] = [{ slug }];
  if (isObjectId(slug)) filters.push({ id: slug });

  const post = await prisma.post.findFirst({
    where: { status: PostStatus.published, OR: filters },
    include: { category: true },
  });
  if (!post || post.status !== PostStatus.published) return {};

  const canonical = getPostPath(post);
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: canonical, type: "article",
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
      section: post.category?.name,
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const filters: Prisma.PostWhereInput[] = [{ slug }];
  if (isObjectId(slug)) filters.push({ id: slug });

  const post = await prisma.post.findFirst({
    where: { status: PostStatus.published, OR: filters },
    include: { category: true, district: true, upazila: true },
  });
  if (!post) notFound();

  const related = await prisma.post.findMany({
    where: { id: { not: post.id }, status: PostStatus.published, OR: [{ categoryId: post.categoryId }, { tags: { hasSome: post.tags } }] },
    take: 3, orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  const html = await renderContent(post.content);
  const embedUrl = getYouTubeEmbedUrl(post.youtubeUrl ?? "");
  // Single split used for both video embed and inline ad positioning
  const { before: htmlBeforeEmbed, after: htmlAfterEmbed } = splitHtmlAtMiddleParagraph(html);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const postUrl = `${siteUrl}${getPostPath(post)}`;

  const jsonLd = {
    "@context": "https://schema.org", "@type": "NewsArticle",
    headline: post.title,
    ...(post.imageUrl ? { image: [post.imageUrl] } : {}),
    datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(),
    author: [{ "@type": "Person", name: post.author }],
    publisher: { "@type": "Organization", name: "Muktir Kantho" },
    description: post.metaDescription || post.excerpt, mainEntityOfPage: postUrl,
  };

  const relativeTime = post.publishedAt ? getBanglaRelativeTime(post.publishedAt) : "";

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 np-category text-[var(--np-text-secondary)]">
        <Link href="/" className="hover:text-[var(--np-primary)]">হোম</Link>
        <span className="text-[var(--np-border)]">/</span>
        <Link href={`/category/${post.category?.slug}`} className="hover:text-[var(--np-primary)]">
          {post.category?.name}
        </Link>
        {post.district && (
          <>
            <span className="text-[var(--np-border)]">/</span>
            <Link href={`/district/${post.district.slug}`} className="hover:text-[var(--np-primary)]">
              {post.district.name}
            </Link>
          </>
        )}
        {post.upazila && post.district && (
          <>
            <span className="text-[var(--np-border)]">/</span>
            <Link href={`/district/${post.district.slug}/${post.upazila.slug}`} className="hover:text-[var(--np-primary)]">
              {post.upazila.name}
            </Link>
          </>
        )}
        <span className="text-[var(--np-border)]">/</span>
        <span className="text-[var(--np-muted)] line-clamp-1 max-w-[200px]">{post.title}</span>
      </nav>

      <div className="flex gap-8">
        {/* ── ARTICLE CONTENT ── */}
        <div className="flex-1 min-w-0">
          <article className="border border-[var(--np-border)] bg-[var(--np-card)]">
            {/* Article Header */}
            <div className="px-5 sm:px-8 pt-6 sm:pt-8">
              {/* Category badge — red pill */}
              <Link
                href={`/category/${post.category?.slug}`}
                className="inline-block mb-3 rounded-full bg-red-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors"
              >
                {post.category?.name}
              </Link>

              {/* Title */}
              <h1 className="np-headline-lg text-2xl sm:text-[28px] md:text-[32px] leading-tight text-[var(--np-text-primary)]">
                {post.title}
              </h1>

              {/* Excerpt / lead paragraph */}
              {post.excerpt && (
                <p className="mt-3 text-base sm:text-[17px] leading-relaxed text-[var(--np-text-secondary)]">
                  {post.excerpt}
                </p>
              )}

              {/* Byline + Timestamp + Share */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pb-5 border-b border-[var(--np-border)]">
                {/* Avatar + Author */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[var(--np-newsprint-2)] flex items-center justify-center text-xs font-bold text-[var(--np-muted)]">
                    {post.author?.charAt(0)?.toUpperCase() || "M"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--np-text-primary)]">{post.author || "Muktir Kantho"}</div>
                    <div className="np-timestamp">{relativeTime}</div>
                  </div>
                </div>

                {/* District label */}
                {post.district && (
                  <Link
                    href={`/district/${post.district.slug}`}
                    className="text-xs text-[var(--np-muted)] hover:text-[var(--np-primary)] transition-colors"
                  >
                    📍 {post.district.name}
                    {post.upazila && `, ${post.upazila.name}`}
                  </Link>
                )}

                {/* Share buttons — right side */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`} target="_blank" rel="noreferrer" aria-label="ফেসবুকে শেয়ার করুন"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1877f2] text-white hover:opacity-90 transition-opacity">
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" aria-label="টুইটারে শেয়ার করুন"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:opacity-90 transition-opacity">
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + postUrl)}`} target="_blank" rel="noreferrer" aria-label="হোয়াটসঅ্যাপে শেয়ার করুন"
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <CopyLinkButton url={postUrl} />
                  <PrintButton />
                </div>
              </div>
            </div>

            {/* Hero Image — full width */}
            {post.imageUrl && (
              <div className="relative mt-0">
                <div className="relative w-full">
                  <Image
                    src={post.imageUrl} alt={post.title}
                    width={1200} height={675}
                    className="h-auto w-full object-cover"
                    priority
                  />
                  <div className="absolute right-3 bottom-3 z-10">
                    <ImageWatermark size="md" showText={true} />
                  </div>
                </div>
              </div>
            )}

            {/* Article Body */}
            <div className="prose-news px-5 sm:px-8 mt-6 min-h-[100px] max-w-none">
              {embedUrl ? (
                <>
                  <div dangerouslySetInnerHTML={{ __html: htmlBeforeEmbed }} />
                  <div className="my-8 overflow-hidden rounded-lg border border-[var(--np-border)] bg-black">
                    <div className="relative w-full pt-[56.25%]">
                      <iframe src={embedUrl} title={`Video for ${post.title}`}
                        className="absolute left-0 top-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                    </div>
                  </div>
                  {/* Mid-article Ad — ARTICLE_INLINE at ~50% content */}
                  <div className="my-6 py-4 border-t border-b border-[var(--np-border)]">
                    <AdSlot placement={AD_PLACEMENTS.ARTICLE_INLINE} className="w-full" showPlaceholder={false} />
                  </div>
                  {htmlAfterEmbed && <div dangerouslySetInnerHTML={{ __html: htmlAfterEmbed }} />}
                </>
              ) : (
                <>
                  <div dangerouslySetInnerHTML={{ __html: htmlBeforeEmbed }} />
                  {/* Mid-article Ad — ARTICLE_INLINE at ~50% content */}
                  <div className="my-6 py-4 border-t border-b border-[var(--np-border)]">
                    <AdSlot placement={AD_PLACEMENTS.ARTICLE_INLINE} className="w-full" showPlaceholder={false} />
                  </div>
                  {htmlAfterEmbed && <div dangerouslySetInnerHTML={{ __html: htmlAfterEmbed }} />}
                </>
              )}
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="px-5 sm:px-8 mt-6 pb-6 border-b border-[var(--np-border)]">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--np-muted)] mb-2">ট্যাগ:</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/tag/${tag}`}
                      className="font-label text-xs text-[var(--np-muted)] border border-[var(--np-border)] bg-[var(--np-newsprint)] px-3 py-1.5 hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-all">
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section — coming soon */}
            <div className="px-5 sm:px-8 py-6 border-b border-[var(--np-border)]">
              <div className="rounded-sm bg-[var(--np-newsprint-2)] p-5 text-center">
                <p className="text-sm text-[var(--np-muted)]">মন্তব্য বিভাগটি শীঘ্রই চালু হবে।</p>
              </div>
            </div>

            {/* Related Articles */}
            {related.length > 0 && (
              <div className="px-5 sm:px-8 py-6">
                <div className="np-section-header border-t-0 pt-0 mb-4">
                  <h2 className="np-headline text-lg">আরও পড়ুন</h2>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <Link key={item.id} href={getPostPath(item)}
                      className="group border border-[var(--np-border)] bg-[var(--np-card)] hover:border-[var(--np-primary)] transition-colors">
                      {item.imageUrl && (
                        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--np-newsprint)]">
                          <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-3">
                        {item.category && (
                          <span className="inline-block mb-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            {item.category.name}
                          </span>
                        )}
                        <h3 className="np-headline-sm text-sm leading-snug group-hover:text-[var(--np-primary)] transition-colors line-clamp-2">{item.title}</h3>
                        {item.publishedAt && (
                          <p className="np-timestamp mt-1">{getBanglaRelativeTime(item.publishedAt)}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <CommonSidebar />
      </div>
    </main>
  );
}
