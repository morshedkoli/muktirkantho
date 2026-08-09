import Image from "next/image";
import { getBranding, SITE_NAME } from "@/lib/branding";

interface PostImageProps {
  /** The post's featured image, or null when it has none. */
  src: string | null;
  alt: string;
  sizes: string;
  /** Extra classes for the photo — hover transforms, mostly. */
  className?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * A post's featured image, with the site's own branding standing in when there
 * isn't one.
 *
 * Cards used to point at `/images/placeholder.jpg`, a file that does not exist
 * in `public/` — so every post without a photo rendered a broken image. The
 * uploaded logo takes that slot instead, and it is `object-contain` on a
 * newsprint panel rather than `object-cover`: a wordmark cropped to fill a 16:9
 * box is worse than no image at all. With nothing uploaded yet, the site name
 * is set as type, which is the only honest thing left to draw.
 */
export async function PostImage({
  src,
  alt,
  sizes,
  className = "",
  priority,
  fetchPriority,
}: PostImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover ${className}`}
        priority={priority}
        fetchPriority={fetchPriority}
      />
    );
  }

  const { postFallbackUrl } = await getBranding();

  if (!postFallbackUrl) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-[var(--np-newsprint-2)] p-[8%]">
        <span className="text-center text-[11px] font-bold leading-tight text-[var(--np-text-secondary)]/55 sm:text-sm">
          {SITE_NAME}
        </span>
      </div>
    );
  }

  return (
    // `absolute inset-0` is itself the positioning context, so the padding here
    // insets the `fill` image and keeps the mark clear of the card edges.
    <div className="absolute inset-0 bg-[var(--np-newsprint-2)] p-[10%]">
      <Image
        src={postFallbackUrl}
        alt={alt}
        fill
        sizes={sizes}
        className="object-contain opacity-45 mix-blend-multiply dark:opacity-35 dark:mix-blend-normal"
      />
    </div>
  );
}
