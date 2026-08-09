import Link from "next/link";
import { formatBanglaDate } from "@/lib/bangla-date";
import { Clock, Eye, MapPin } from "lucide-react";
import { getPostPath } from "@/lib/post-url";
import { bnCount } from "@/lib/bn-number";
import { ImageWatermark, ImageWatermarkSimple } from "./image-watermark";
import { PostImage } from "./post-image";

type NewsCardProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl: string | null;
    publishedAt: Date | null;
    author?: string | null;
    /** Lifetime reads. Optional so callers projecting a lighter row still fit. */
    viewCount?: number | null;
    category?: { name: string; slug: string } | null;
    district?: { name: string; slug: string } | null;
  };
  variant?: "default" | "compact" | "horizontal";
};

/**
 * Reads, shown only once a story has any.
 *
 * "০ বার পড়া হয়েছে" on a freshly published article reads as a verdict on it
 * rather than on the clock, so a story with no reads yet simply says nothing.
 */
function ReadCount({ count }: { count?: number | null }) {
  if (!count || count <= 0) return null;
  return (
    <span className="flex items-center gap-1" title={`${bnCount(count)} বার পড়া হয়েছে`}>
      <Eye className="h-3 w-3" aria-hidden />
      {bnCount(count)}
    </span>
  );
}

export async function NewsCard({ post, variant = "default" }: NewsCardProps) {
  const postPath = getPostPath(post);

  if (variant === "compact") {
    return (
      <article className="group flex gap-3.5">
        <Link
          href={postPath}
          className="relative h-[68px] w-[92px] shrink-0 overflow-hidden bg-[var(--np-newsprint-2)]"
          aria-hidden="true"
          tabIndex={-1}
        >
          <PostImage
            src={post.imageUrl}
            alt=""
            sizes="92px"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute right-1 bottom-1 z-10">
            <ImageWatermarkSimple size={16} />
          </div>
        </Link>
        <div className="flex min-w-0 flex-col justify-center">
          {post.category && (
            <Link href={`/category/${post.category.slug}`} className="np-category self-start hover:underline">
              {post.category.name}
            </Link>
          )}
          <h3 className="np-headline-sm mt-1 line-clamp-2 leading-snug text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)]">
            <Link href={postPath} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--np-primary)]">
              {post.title}
            </Link>
          </h3>
          {(post.publishedAt || post.viewCount) && (
            <p className="np-timestamp mt-1 flex flex-wrap items-center gap-x-2.5 text-[11px]">
              {post.publishedAt && <span>{formatBanglaDate(post.publishedAt)}</span>}
              <ReadCount count={post.viewCount} />
            </p>
          )}
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Link href={postPath} className="relative aspect-video sm:aspect-[4/3] sm:w-1/3 overflow-hidden bg-[var(--np-background)]" aria-hidden="true" tabIndex={-1}>
          <PostImage
            src={post.imageUrl}
            alt={post.title}
            sizes="(max-width: 640px) 100vw, 33vw"
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {post.category && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-[var(--np-primary)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--np-on-primary)] shadow-sm">
                {post.category.name}
              </span>
            </div>
          )}
          <div className="absolute right-2 bottom-2 z-10">
            <ImageWatermark size="sm" showText={true} />
          </div>
        </Link>
        <div className="flex flex-col justify-center sm:w-2/3">
          <div className="np-timestamp mb-2 flex flex-wrap items-center gap-3">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatBanglaDate(post.publishedAt)}
              </span>
            )}
            {post.district && (
              <Link href={`/district/${post.district.slug}`} className="flex items-center gap-1 hover:text-[var(--np-primary)]">
                <MapPin className="h-3 w-3" />
                {post.district.name}
              </Link>
            )}
            <ReadCount count={post.viewCount} />
          </div>
          <h3 className="np-headline-sm leading-tight text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)]">
            <Link href={postPath}>{post.title}</Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-[var(--np-text-secondary)]">
            {post.excerpt}
          </p>
        </div>
      </article>
    );
  }

  // Default vertical card — clean newspaper style.
  // The accent rule that slides in on hover gives the card a designed state
  // rather than the stock "shadow gets slightly bigger" default.
  return (
    <article className="group relative flex flex-col overflow-hidden border border-[var(--np-border)] bg-[var(--np-card)] transition-[border-color,box-shadow] duration-200 hover:border-[var(--np-text-secondary)]/40 hover:shadow-[var(--np-shadow-lg)] focus-within:border-[var(--np-primary)]">
      {/* Image — 16/9 ratio */}
      <Link
        href={postPath}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-video overflow-hidden bg-[var(--np-newsprint-2)]"
      >
        <PostImage
          src={post.imageUrl}
          alt=""
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {/* Logo watermark */}
        <div className="absolute right-2 bottom-2 z-10">
          <ImageWatermark size="sm" showText={false} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        {/* Category kicker — set in the label face, not another red pill. The
            hero already carries a pill, so repeating it flattened the hierarchy. */}
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="np-category relative z-10 mb-1.5 self-start transition-colors hover:text-[var(--np-primary-hover)]"
          >
            {post.category.name}
          </Link>
        )}

        <h3 className="np-headline-sm line-clamp-3 leading-snug text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)]">
          {/* Stretched link: the whole card is the hit target, but only the
              headline sits in the tab order. */}
          <Link
            href={postPath}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--np-primary)]"
          >
            {post.title}
          </Link>
        </h3>

        {/* Author + time — small gray */}
        <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-2.5 text-[11px] text-[var(--np-text-secondary)]">
          {post.author && <span className="font-medium">{post.author}</span>}
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatBanglaDate(post.publishedAt)}
            </span>
          )}
          {post.district && (
            <Link
              href={`/district/${post.district.slug}`}
              className="relative z-10 flex items-center gap-1 transition-colors hover:text-[var(--np-primary)]"
            >
              <MapPin className="h-3 w-3" />
              {post.district.name}
            </Link>
          )}
          <ReadCount count={post.viewCount} />
        </div>
      </div>
    </article>
  );
}
