import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import { getPostPath } from "@/lib/post-url";
import { ImageWatermark, ImageWatermarkSimple } from "./image-watermark";

type NewsCardProps = {
  post: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl: string;
    publishedAt: Date | null;
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
        <Link href={postPath} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--np-background)]">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Logo watermark - bottom right (compact - icon only) */}
          <div className="absolute right-1 bottom-1 z-10">
            <ImageWatermarkSimple size={16} />
          </div>
        </Link>
        <div className="flex flex-col justify-center">
          {post.category && (
            <Link 
              href={`/category/${post.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-[var(--np-primary)] hover:underline"
            >
              {post.category.name}
            </Link>
          )}
          <h3 className="mt-1 font-display text-sm font-bold leading-tight text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)] line-clamp-2">
            <Link href={postPath}>{post.title}</Link>
          </h3>
          {post.publishedAt && (
            <p className="mt-1 text-xs text-[var(--np-text-secondary)]">
              {format(post.publishedAt, "MMM d, yyyy")}
            </p>
          )}
        </div>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Link href={postPath} className="relative aspect-video sm:aspect-[4/3] sm:w-1/3 overflow-hidden rounded-lg bg-[var(--np-background)]">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {post.category && (
            <div className="absolute left-3 top-3">
              <span className="rounded bg-[var(--np-primary)] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                {post.category.name}
              </span>
            </div>
          )}
          {/* Logo watermark - bottom right with name */}
          <div className="absolute right-2 bottom-2 z-10">
            <ImageWatermark size="sm" showText={true} />
          </div>
        </Link>
        <div className="flex flex-col justify-center sm:w-2/3">
          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[var(--np-text-secondary)]">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(post.publishedAt, "MMM d, yyyy")}
              </span>
            )}
            {post.district && (
              <Link href={`/district/${post.district.slug}`} className="flex items-center gap-1 hover:text-[var(--np-primary)]">
                <MapPin className="h-3 w-3" />
                {post.district.name}
              </Link>
            )}
          </div>
          <h3 className="font-display text-lg font-bold leading-tight text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)]">
            <Link href={postPath}>{post.title}</Link>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-[var(--np-text-secondary)]">
            {post.excerpt}
          </p>
        </div>
      </article>
    );
  }

  // Default vertical card
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-[var(--np-card)] shadow-[var(--np-shadow)] transition-all hover:shadow-[var(--np-shadow-lg)] border border-[var(--np-border)]">
      <Link href={postPath} className="relative aspect-[16/10] overflow-hidden bg-[var(--np-background)]">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {post.category && (
          <div className="absolute left-4 top-4">
            <span className="rounded-md bg-[var(--np-primary)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              {post.category.name}
            </span>
          </div>
        )}
        {/* Logo watermark - bottom right with name */}
        <div className="absolute right-3 bottom-3 z-10">
          <ImageWatermark size="md" showText={true} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-[var(--np-text-secondary)]">
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(post.publishedAt, "MMM d, yyyy")}
            </span>
          )}
          {post.district && (
            <Link href={`/district/${post.district.slug}`} className="flex items-center gap-1 hover:text-[var(--np-primary)] transition-colors">
              <MapPin className="h-3 w-3" />
              {post.district.name}
            </Link>
          )}
        </div>
        <h3 className="font-display text-lg font-bold leading-tight text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)] line-clamp-2">
          <Link href={postPath}>{post.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--np-text-secondary)]">
          {post.excerpt}
        </p>
      </div>
    </article>
  );
}
