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
import { AdSlot } from "@/components/public/ad-slot";
import { CopyLinkButton } from "@/components/public/copy-link-button";
import { ImageWatermark } from "@/components/public/image-watermark";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const filters: Prisma.PostWhereInput[] = [{ slug }];
  if (isObjectId(slug)) {
    filters.push({ id: slug });
  }

  const post = await prisma.post.findFirst({
    where: {
      status: PostStatus.published,
      OR: filters,
    },
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
      url: canonical,
      type: "article",
      images: [post.imageUrl],
      section: post.category.name,
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.imageUrl],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const filters: Prisma.PostWhereInput[] = [{ slug }];
  if (isObjectId(slug)) {
    filters.push({ id: slug });
  }

  const post = await prisma.post.findFirst({
    where: {
      status: PostStatus.published,
      OR: filters,
    },
    include: {
      category: true,
      district: true,
      upazila: true,
    },
  });

  if (!post) {
    notFound();
  }

  const related = await prisma.post.findMany({
    where: {
      id: { not: post.id },
      status: PostStatus.published,
      OR: [{ categoryId: post.categoryId }, { tags: { hasSome: post.tags } }],
    },
    take: 4,
    orderBy: { publishedAt: "desc" },
  });

  const html = await renderContent(post.content);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const postUrl = `${siteUrl}${getPostPath(post)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    image: [post.imageUrl],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: [{ "@type": "Person", name: post.author }],
    publisher: {
      "@type": "Organization",
      name: "Muktir Kantho",
    },
    description: post.metaDescription || post.excerpt,
    mainEntityOfPage: postUrl,
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="rounded-2xl border border-[var(--np-border)] bg-[var(--np-card)] p-6 shadow-[var(--np-shadow)] md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--np-text-secondary)]">
          <Link href={`/category/${post.category.slug}`}>{post.category.name}</Link>
          <Link href={`/district/${post.district.slug}`}>{post.district.name}</Link>
          {post.upazila ? (
            <Link href={`/district/${post.district.slug}/${post.upazila.slug}`}>{post.upazila.name}</Link>
          ) : null}
        </div>
        <h1 className="text-3xl font-black text-[var(--np-text-primary)] md:text-5xl">{post.title}</h1>
        <p className="mt-3 text-sm text-[var(--np-text-secondary)]">By {post.author}</p>
        <div className="relative mt-6">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1200}
            height={675}
            className="h-auto w-full rounded-xl object-cover"
            priority
          />
          {/* Logo watermark - bottom right with name */}
          <div className="absolute right-4 bottom-4 z-10">
            <ImageWatermark size="lg" showText={true} />
          </div>
        </div>
        <div
          className="prose-news mt-8 min-h-[100px] max-w-none border border-transparent text-[var(--np-text-primary)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs font-mono overflow-auto">
            <p>Debug Info:</p>
            <p>HTML Length: {html.length}</p>
            <p>First 100 chars: {html.substring(0, 100)}</p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}`}
              className="rounded-full border border-[var(--np-border)] bg-[var(--np-background)] px-3 py-1 text-sm text-[var(--np-text-secondary)]"
            >
              #{tag}
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[var(--np-text-secondary)]">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-[var(--np-border)] bg-[var(--np-background)] px-3 py-2 hover:border-[var(--np-primary)] hover:text-[var(--np-primary)]"
          >
            Share on Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-[var(--np-border)] bg-[var(--np-background)] px-3 py-2 hover:border-[var(--np-primary)] hover:text-[var(--np-primary)]"
          >
            Share on X
          </a>
          <CopyLinkButton url={postUrl} />
        </div>
        <p className="mt-3 break-all text-xs text-[var(--np-text-secondary)]">{postUrl}</p>
      </article>

      <AdSlot placement={AD_PLACEMENTS.ARTICLE_INLINE} className="mt-8" showPlaceholder={false} />

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-[var(--np-text-primary)]">Related Articles</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {related.map((item) => (
            <Link
              key={item.id}
              href={getPostPath(item)}
              className="rounded-xl border border-[var(--np-border)] bg-[var(--np-card)] p-4 shadow-[var(--np-shadow)]"
            >
              <p className="font-bold text-[var(--np-text-primary)]">{item.title}</p>
              <p className="mt-1 text-sm text-[var(--np-text-secondary)]">{item.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
