import Image from "next/image";
import Link from "next/link";
import { formatBanglaDate } from "@/lib/bangla-date";
import { Clock, MapPin } from "lucide-react";
import { getPostPath } from "@/lib/post-url";
import { ImageWatermark, ImageWatermarkSimple } from "./image-watermark";

type NewsCardProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl: string | null;
    publishedAt: Date | null;
    author?: string | null;
    category?: { name: string; slug: string } | null;
    district?: { name: string; slug: string } | null;
  };
  variant?: "default" | "compact" | "horizontal";
};

export function NewsCard({ post, variant = "default" }: NewsCardProps) {
  const postPath = getPostPath(post);

  if (variant === "compact") {
    return (
      <article className="group flex gap-4">
        <Link href={postPath} className="relative h-20 w-20 shrink-0 overflow-hidden bg-[var(--np-background)]" aria-hidden="true" tabIndex={-1}>
          <Image
            src={post.imageUrl || "/images/placeholder.jpg"}
            alt={post.title}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute right-1 bottom-1 z-10">
            <ImageWatermarkSimple size={16} />
          </div>
        </Link>
        <div className="flex flex-col justify-center">
          {post.category && (
            <Link
              href={`/category/${post.category.slug}`}
              className="np-category hover:underline"
            >
              {post.category.name}
            </Link>
          )}
          <h3 className="mt-1 np-headline-sm leading-tight text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)] line-clamp-2">
            <Link href={postPath}>{post.title}</Link>
          </h3>
          {post.publishedAt && (
            <p className="mt-1 np-timestamp">
              {formatBanglaDate(post.publishedAt)}
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
          <Image
            src={post.imageUrl || "/images/placeholder.jpg"}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.category && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
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

  // Default vertical card — clean newspaper style
  return (
    <article className="group flex flex-col overflow-hidden bg-[var(--np-card)] border border-[var(--np-border)] shadow-sm hover:shadow-md transition-shadow">
      {/* Image — 16/9 ratio */}
      <Link href={postPath} className="relative aspect-video overflow-hidden bg-[var(--np-newsprint)]">
        <Image
          src={post.imageUrl || "/images/placeholder.jpg"}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Logo watermark */}
        <div className="absolute right-2 bottom-2 z-10">
          <ImageWatermark size="sm" showText={false} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        {/* Category badge — red pill below image */}
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="mb-2 self-start rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-red-700 transition-colors"
          >
            {post.category.name}
          </Link>
        )}

        {/* Title — 2-line clamp, underline on hover */}
        <h3 className="np-headline-sm line-clamp-2 leading-snug text-[var(--np-text-primary)] group-hover:underline decoration-[var(--np-primary)] decoration-1 underline-offset-2 transition-colors">
          <Link href={postPath}>{post.title}</Link>
        </h3>

        {/* Author + time — small gray */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--np-text-secondary)]">
          {post.author && (
            <span className="font-medium">{post.author}</span>
          )}
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatBanglaDate(post.publishedAt)}
            </span>
          )}
          {post.district && (
            <Link
              href={`/district/${post.district.slug}`}
              className="flex items-center gap-1 hover:text-[var(--np-primary)] transition-colors"
            >
              <MapPin className="h-3 w-3" />
              {post.district.name}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
