import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram, Linkedin } from "lucide-react";
import { getBranding, SITE_NAME } from "@/lib/branding";
import { getSocialMenuItems } from "@/lib/menus";
import { ThemeToggle } from "@/components/theme-toggle";

type SocialIconComponent = React.ComponentType<{ className?: string }>;

const SOCIAL_ICONS: Record<string, SocialIconComponent> = {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
};

/**
 * Masthead logo rendered through next/image so it is served as AVIF/WebP at the
 * size actually displayed. The raw `<img>` tags this replaces pulled full-size
 * Cloudinary PNGs, and the browser preloaded both the light and dark variants
 * even though one is always `display:none`.
 */
function LogoImage({
  src,
  height,
  className = "",
}: {
  src: string;
  height: number;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={SITE_NAME}
      height={height}
      // Logos are wordmarks: width follows the aspect ratio, so we give next/image
      // a generous intrinsic width and let `h-full w-auto` do the real sizing.
      width={height * 5}
      // `lazy` rather than `priority`/`eager` on purpose. next/image emits a
      // `<link rel=preload>` for any non-lazy image, which put this small
      // wordmark ahead of the article hero — the real LCP element — in the
      // fetch queue. The logo is in the initial viewport, so browsers still
      // request it immediately; we only lose the preload hint, and its height
      // is pinned below so nothing shifts.
      loading="lazy"
      sizes={`${height * 5}px`}
      className={`${className} w-auto max-w-[56vw] sm:max-w-none`}
      style={{ height: `${height}px` }}
    />
  );
}

export async function Masthead() {
  let socialItems: Awaited<ReturnType<typeof getSocialMenuItems>> = [];

  try {
    socialItems = await getSocialMenuItems();
  } catch {
    socialItems = [];
  }

  // getBranding() swallows its own settings failure, so the masthead still
  // renders (as type) when the database is unreachable.
  const branding = await getBranding();

  const today = new Date();

  const englishDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

  const banglaDate = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

  const { logoUrl, darkLogoUrl, hasDistinctDarkLogo, logoHeight: logoH } = branding;
  // Either mark alone is enough to show one image; only a dedicated dark upload
  // justifies shipping two and toggling them by theme.
  const singleLogo = logoUrl ?? darkLogoUrl;

  return (
    <div className="bg-[var(--np-card)] border-b-2 border-[var(--np-primary)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">

          {/* Left: Date */}
          <div className="hidden sm:flex flex-col gap-0.5">
            <span className="font-label text-[10px] uppercase tracking-[2px] text-[var(--np-text-secondary)]">
              {englishDate}
            </span>
            <span className="text-xs font-medium text-[var(--np-primary)]">
              {banglaDate}
            </span>
          </div>
          {/* Mobile: empty left cell */}
          <div className="sm:hidden" />

          {/* Center: Logo */}
          <Link
            href="/"
            className="flex justify-center shrink-0"
            aria-label="মুক্তির কণ্ঠ — হোম"
          >
            {hasDistinctDarkLogo && logoUrl && darkLogoUrl ? (
              <>
                <LogoImage src={logoUrl} height={logoH} className="block dark:hidden" />
                <LogoImage src={darkLogoUrl} height={logoH} className="hidden dark:block" />
              </>
            ) : singleLogo ? (
              <LogoImage src={singleLogo} height={logoH} />
            ) : (
              // Nothing uploaded yet: set the name rather than draw a stand-in
              // mark, so the masthead never claims a logo the site doesn't have.
              <span
                className="font-bold leading-none tracking-tight text-[var(--np-text-primary)]"
                style={{ fontSize: `${Math.round(logoH * 0.62)}px` }}
              >
                {SITE_NAME}
              </span>
            )}
          </Link>

          {/* Right: Social icons + theme switch */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            {socialItems.length > 0
              ? socialItems.map((social) => {
                  const Icon = social.icon ? SOCIAL_ICONS[social.icon] : null;
                  if (!Icon) return null;
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      aria-label={social.label}
                      target={social.openInNewTab ? "_blank" : undefined}
                      rel={social.openInNewTab ? "noopener noreferrer" : undefined}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--np-border)] text-[var(--np-text-secondary)] hover:bg-[var(--np-primary)] hover:text-[var(--np-on-primary)] hover:border-[var(--np-primary)] transition-all duration-200"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  );
                })
              : null}

            {/* Social icons are hidden on the narrowest screens, so the theme
                switch sits outside that group and stays reachable everywhere. */}
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
