import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { getPostPath } from "@/lib/post-url";
import { ImageWatermark } from "./image-watermark";

type Post = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: Date | null;
  category?: { name: string; slug: string } | null;
  district?: { name: string; slug: string } | null;
};

/** Hero card — full-bleed image with bottom-gradient overlay for text */
export function HeroNewsCard({ post }: { post: Post }) {
  const postPath = getPostPath(post);

  return (
    <Link
      href={postPath}
      className="group relative block w-full overflow-hidden bg-[var(--np-background)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 65vw, 800px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          priority
        />

        {/* Gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Watermark */}
        <div className="absolute right-3 top-3 z-10">
          <ImageWatermark size="sm" showText={false} />
        </div>

        {/* Category badge */}
        {post.category && (
          <div className="absolute left-4 top-4 z-10">
            <span className="inline-block bg-[var(--np-primary)] px-2.5 py-1 font-label text-[10px] font-semibold uppercase tracking-[1.5px] text-white">
              {post.category.name}
            </span>
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
          {/* Meta */}
          <div className="mb-2 flex flex-wrap items-center gap-3 text-[10.5px] font-mono uppercase tracking-[1.5px] text-white/70">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(post.publishedAt, "MMM d, yyyy · h:mm a")}
              </span>
            )}
            {post.district && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {post.district.name}
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="np-headline-lg text-balance leading-tight text-white text-xl sm:text-2xl md:text-[28px] group-hover:underline decoration-2 underline-offset-[6px]">
            {post.title}
          </h2>

          {/* Excerpt (sm+) */}
          <p className="mt-2 hidden max-w-2xl text-[13.5px] leading-relaxed text-white/80 line-clamp-2 sm:block">
            {post.excerpt}
          </p>

          {/* CTA */}
          <div className="mt-3 inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-[2px] text-[var(--np-secondary)] group-hover:text-white transition-colors">
            বিস্তারিত পড়ুন
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Compact horizontal card for the secondary stack beside the hero */
export function SecondaryStoryCard({
  post,
  rank,
}: {
  post: Post;
  rank?: number;
}) {
  const postPath = getPostPath(post);
  return (
    <Link
      href={postPath}
      className="group flex gap-3 border-b border-[var(--np-border)] pb-4 last:border-0 last:pb-0"
    >
      {rank !== undefined && (
        <span className="font-display shrink-0 text-3xl font-bold leading-none text-[var(--np-border)] mt-0.5 w-7 text-right">
          {rank}
        </span>
      )}

      {post.imageUrl && (
        <div className="relative h-16 w-[88px] shrink-0 overflow-hidden bg-[var(--np-newsprint)]">
          <Image
            src={post.imageUrl}
            alt=""
            fill
            sizes="88px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        {post.category && (
          <span className="np-category text-[10px] block">{post.category.name}</span>
        )}
        <h3 className="np-headline-sm mt-0.5 line-clamp-2 text-[13px] leading-snug group-hover:text-[var(--np-primary)] transition-colors">
          {post.title}
        </h3>
        {post.publishedAt && (
          <p className="np-timestamp mt-1 text-[10px]">
            {format(post.publishedAt, "MMM d · h:mm a")}
          </p>
        )}
      </div>
    </Link>
  );
}
