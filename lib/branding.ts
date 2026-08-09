import { cache } from "react";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * Resolved branding assets — the uploaded ones, and nothing else.
 *
 * The site used to ship hardcoded SVG logos and a data-URI favicon as
 * "defaults", which meant an admin could never tell whether the mark on screen
 * was theirs or the placeholder shipped in the bundle: uploading nothing looked
 * identical to uploading something. Every field here is `null` until an admin
 * uploads the asset, and each surface decides honestly what to show in the gap.
 */

/** Re-exported so server surfaces can take the name and the assets in one import. */
export { SITE_NAME } from "@/lib/site-name";

/** Masthead height when the admin hasn't chosen one. */
const DEFAULT_LOGO_HEIGHT = 52;

export interface Branding {
  /** Light-theme wordmark. */
  logoUrl: string | null;
  /** Dark-theme wordmark; falls back to the light one when only that exists. */
  darkLogoUrl: string | null;
  /** True when a dedicated dark mark exists, so callers can skip theme swapping. */
  hasDistinctDarkLogo: boolean;
  /** Browser tab icon, then the marks, so a favicon is set as soon as anything is. */
  faviconUrl: string | null;
  /** Stand-in for a post with no featured image. */
  postFallbackUrl: string | null;
  logoHeight: number;
}

const EMPTY: Branding = {
  logoUrl: null,
  darkLogoUrl: null,
  hasDistinctDarkLogo: false,
  faviconUrl: null,
  postFallbackUrl: null,
  logoHeight: DEFAULT_LOGO_HEIGHT,
};

/**
 * A stored value is only usable as an image source if it is a site-root path or
 * an http(s) URL. Anything else (an empty string left by a removed upload, a
 * half-typed value) would reach `next/image` and throw during render.
 */
function usableAssetUrl(url: string | null | undefined): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? trimmed : null;
  } catch {
    return null;
  }
}

/**
 * `cache()` dedupes this across a render, so the masthead, footer, watermark and
 * every card on the page share one settings read.
 */
export const getBranding = cache(async function getBranding(): Promise<Branding> {
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    settings = await getSiteSettings();
  } catch {
    // Branding is decoration — a settings outage must not take the page down.
    return EMPTY;
  }

  const logoUrl = usableAssetUrl(settings?.logoUrl);
  const darkUpload = usableAssetUrl(settings?.iconUrl);
  const faviconUpload = usableAssetUrl(settings?.faviconUrl);

  const height = settings?.logoHeight;

  return {
    logoUrl,
    darkLogoUrl: darkUpload ?? logoUrl,
    hasDistinctDarkLogo: Boolean(darkUpload && darkUpload !== logoUrl),
    faviconUrl: faviconUpload ?? darkUpload ?? logoUrl,
    // A wordmark fills a 16:9 card better than a square icon, so the marks come
    // first here even though the favicon leads for the tab icon.
    postFallbackUrl: logoUrl ?? darkUpload ?? faviconUpload,
    logoHeight: typeof height === "number" && height > 0 ? height : DEFAULT_LOGO_HEIGHT,
  };
});
