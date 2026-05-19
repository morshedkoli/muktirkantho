import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./site-logo";

/**
 * Masthead — site identity + date strip
 *
 * Logo strategy:
 *  - settings.logoUrl  → light-mode logo
 *  - settings.iconUrl  → dark-mode logo
 *
 * IMPORTANT: We use plain <img> here (not next/image) because:
 *  1. Logo URLs come from admin uploads (Cloudinary) and may not match
 *     remotePatterns exactly — next/image throws hard at SSR for any
 *     unrecognized hostname or malformed URL, crashing the whole page.
 *  2. The logo is small (~240×60). Image optimization is not material here.
 *  3. A broken <img> just shows a broken-icon — it does NOT crash SSR.
 *
 * Theme visibility is handled by Tailwind's `dark:` variant wired to
 * [data-theme="dark"] (see @custom-variant in globals.css).
 */
function isValidLogoUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Accept absolute http/https URLs or root-relative paths
  if (trimmed.startsWith("/")) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function Masthead() {
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    settings = await getSiteSettings();
  } catch {
    settings = null;
  }

  const today = new Date();

  const englishDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(today);

  const banglaDate = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(today);

  const lightLogo = isValidLogoUrl(settings?.logoUrl) ? settings!.logoUrl : null;
  const darkLogo = isValidLogoUrl(settings?.iconUrl) ? settings!.iconUrl : null;
  const hasBoth = Boolean(lightLogo && darkLogo);
  const hasAny = Boolean(lightLogo || darkLogo);
  const fallbackLogo = lightLogo ?? darkLogo;

  // Admin-configured logo height. Mobile auto-scales to ~75% via CSS calc.
  const logoH = settings?.logoHeight ?? 48;

  return (
    <header className="border-b border-[var(--np-border)] bg-[var(--np-card)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4 lg:py-5">
        <div className="flex items-center justify-between gap-3 sm:gap-4">

          {/* Logo — height is set by admin (branding page); dark: variant swaps logos */}
          <Link href="/" className="block shrink-0" aria-label="Muktir Kantho — হোম">
            {hasBoth ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lightLogo!} alt="Muktir Kantho" className="block dark:hidden w-auto"
                  style={{ height: `${logoH}px` }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={darkLogo!} alt="Muktir Kantho" className="hidden dark:block w-auto"
                  style={{ height: `${logoH}px` }} />
              </>
            ) : hasAny ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fallbackLogo!} alt="Muktir Kantho" className="w-auto"
                style={{ height: `${logoH}px` }} />
            ) : (
              <SiteLogo width={Math.round(logoH * 4)} height={logoH} />
            )}
          </Link>

          {/* Date strip */}
          <div className="hidden sm:flex flex-col items-end gap-0.5 text-right">
            <span className="font-label text-[10px] uppercase tracking-[2px] text-[var(--np-text-secondary)]">
              {englishDate}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-[var(--np-primary)]">
              {banglaDate}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
