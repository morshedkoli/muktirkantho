import Image from "next/image";
import Link from "next/link";
import { formatBanglaDateTime } from "@/lib/bangla-date";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { getPostPath } from "@/lib/post-url";
import { ImageWatermark } from "./image-watermark";
import { cn } from "@/lib/cn";

type Post = {
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

type HeroNewsCardProps = {
  post: Post;
  /** "large" = ~500px tall (full-width hero), "medium" = ~350px tall (half-width) */
  size?: "large" | "medium";
};

/** Hero card — full-bleed image with bottom-gradient overlay for text */
export function HeroNewsCard({ post, size = "large" }: HeroNewsCardProps) {
  const postPath = getPostPath(post);

  return (
    <Link
      href={postPath}
      className="group relative block w-full overflow-hidden bg-neutral-900"
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          size === "large" ? "h-[340px] sm:h-[420px] md:h-[500px]" : "h-[240px] sm:h-[300px] md:h-[350px]"
        )}
      >
        <Image
          src={post.imageUrl || "/images/placeholder.jpg"}
          alt={post.title}
          fill
          sizes={
            size === "large"
              ? "(max-width: 640px) 100vw, (max-width: 1280px) 65vw, 800px"
              : "(max-width: 640px) 100vw, (max-width: 1280px) 35vw, 450px"
          }
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          // The lead story's photo is the LCP element on every page it appears
          // on, so it gets both the preload hint and a high fetch priority.
          priority={size === "large"}
          fetchPriority={size === "large" ? "high" : "auto"}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Watermark */}
        <div className="absolute right-3 top-3 z-10">
          <ImageWatermark size="sm" showText={false} />
        </div>

        {/* Category badge — top left, red pill */}
        {post.category && (
          <div className="absolute left-4 top-4 z-10">
            <span className="inline-block rounded-full bg-[var(--np-primary)] px-3 py-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--np-on-primary)] shadow-md">
              {post.category.name}
            </span>
          </div>
        )}

        {/* Bottom content over gradient */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6">
          {/* Author + time metadata */}
          <div className="mb-2 flex flex-wrap items-center gap-3 text-[10.5px] font-mono uppercase tracking-[1.5px] text-white/70">
            {post.author && (
              <span>{post.author}</span>
            )}
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatBanglaDateTime(post.publishedAt)}
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
          <h2
            className={cn(
              "text-balance font-bold leading-tight text-white group-hover:underline decoration-2 underline-offset-[6px]",
              size === "large" ? "text-xl sm:text-2xl md:text-[28px]" : "text-lg sm:text-xl md:text-2xl"
            )}
          >
            {post.title}
          </h2>

          {/* Excerpt — only on large hero, sm+ screens */}
          {size === "large" && (
            <p className="mt-2 hidden max-w-2xl text-[13.5px] leading-relaxed text-white/80 line-clamp-2 sm:block">
              {post.excerpt}
            </p>
          )}

          {/* CTA */}
          {/* Sits on the photo's dark gradient, so it uses the media accent —
              the body accent reads at only ~3.6:1 against black. */}
          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[2px] text-[var(--np-accent-on-media)] transition-colors group-hover:text-white">
            বিস্তারিত পড়ুন
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
