import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { getPostPath } from "@/lib/post-url";
import { ImageWatermark } from "./image-watermark";

type HeroNewsCardProps = {
  post: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    imageUrl: string;
    publishedAt: Date | null;
    category?: { name: string; slug: string } | null;
    district?: { name: string; slug: string } | null;
    tags?: string[];
  };
};

export function HeroNewsCard({ post }: HeroNewsCardProps) {
  const postPath = getPostPath(post);

  return (
    <Link href={postPath} className="group relative block w-full overflow-hidden bg-[var(--np-background)]">
      {/* Full-bleed image with gradient overlay */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 70vw, 900px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          priority
        />

        {/* Gradient overlay — bottom-heavy for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Watermark */}
        <div className="absolute right-3 top-3 z-10">
          <ImageWatermark size="sm" showText={false} />
        </div>

        {/* Category badge */}
        {post.category && (
          <div className="absolute left-4 top-4 z-10">
            <span className="inline-block bg-[var(--np-primary)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              {post.category.name}
            </span>
          </div>
        )}

        {/* Text content sits on top of gradient */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6">
          {/* Meta row */}
          <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] text-white/70 font-mono uppercase tracking-wider">
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

          {/* Headline */}
          <h2 className="np-headline-lg text-white text-balance leading-tight text-xl sm:text-2xl md:text-3xl group-hover:text-white/90 transition-colors">
            {post.title}
          </h2>

          {/* Excerpt — visible on larger screens */}
          <p className="mt-2 hidden sm:block text-sm sm:text-base text-white/75 line-clamp-2 leading-relaxed max-w-2xl">
            {post.excerpt}
          </p>

          {/* Read more */}
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[var(--np-secondary)] group-hover:text-white transition-colors">
            বিস্তারিত পড়ুন <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Compact vertical card for the secondary story stack beside the hero */
export function SecondaryStoryCard({
  post,
  rank,
}: {
  post: HeroNewsCardProps["post"];
  rank?: number;
}) {
  const postPath = getPostPath(post);
  return (
    <Link
      href={postPath}
      className="group flex gap-3 border-b border-[var(--np-border)] pb-3 last:border-0 last:pb-0"
    >
      {/* Rank number */}
      {rank !== undefined && (
        <span className="shrink-0 text-2xl font-bold text-[var(--np-border)] leading-none mt-0.5 w-6 text-right">
          {rank}
        </span>
      )}

      {/* Thumbnail */}
      {post.imageUrl && (
        <div className="relative h-16 w-20 shrink-0 overflow-hidden bg-[var(--np-newsprint)]">
          <Image
            src={post.imageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        {post.category && (
          <span className="np-category text-[10px] block mb-0.5">{post.category.name}</span>
        )}
        <h3 className="np-headline-sm text-[13px] leading-snug line-clamp-2 group-hover:text-[var(--np-primary)] transition-colors">
          {post.title}
        </h3>
        {post.publishedAt && (
          <p className="np-timestamp text-[10px] mt-1">
            {format(post.publishedAt, "MMM d · h:mm a")}
          </p>
        )}
      </div>
    </Link>
  );
}
