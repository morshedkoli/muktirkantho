import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, MapPin, Tag } from "lucide-react";
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
    <article className="group grid gap-6 lg:grid-cols-2 lg:gap-8">
      {/* Image container */}
      <Link href={postPath} className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[var(--np-background)]">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
        {/* Category badge */}
        {post.category && (
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--np-primary)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              <Tag className="h-3 w-3" />
              {post.category.name}
            </span>
          </div>
        )}
        {/* Logo watermark - bottom right with name */}
        <div className="absolute right-3 bottom-3 z-10">
          <ImageWatermark size="lg" showText={true} />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col justify-center">
        {/* Meta info */}
        <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-[var(--np-text-secondary)]">
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {format(post.publishedAt, "MMMM d, yyyy")}
            </span>
          )}
          {post.district && (
            <Link 
              href={`/district/${post.district.slug}`}
              className="flex items-center gap-1.5 hover:text-[var(--np-primary)] transition-colors"
            >
              <MapPin className="h-4 w-4" />
              {post.district.name}
            </Link>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl font-bold leading-tight text-[var(--np-text-primary)] transition-colors group-hover:text-[var(--np-primary)] sm:text-3xl lg:text-4xl">
          <Link href={postPath}>
            {post.title}
          </Link>
        </h1>

        {/* Excerpt */}
        <p className="mt-4 text-base leading-relaxed text-[var(--np-text-secondary)] sm:text-lg">
          {post.excerpt}
        </p>

        {/* Read more link */}
        <div className="mt-6">
          <Link 
            href={postPath}
            className="inline-flex items-center gap-2 font-semibold text-[var(--np-primary)] hover:text-[var(--np-primary-hover)] transition-colors"
          >
            Read Full Story
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}`}
                className="text-xs text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
