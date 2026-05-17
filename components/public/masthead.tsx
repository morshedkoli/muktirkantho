import Image from "next/image";
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
 * When both exist, both <Image> tags are rendered in the DOM but only the
 * theme-appropriate one is visible (Tailwind `dark:` is wired to data-theme="dark"
 * in globals.css via @custom-variant — no class purge risk).
 */
export async function Masthead() {
  const settings = await getSiteSettings();
  const today = new Date();

  const englishDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(today);

  const banglaDate = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(today);

  const lightLogo = settings?.logoUrl ?? null;
  const darkLogo = settings?.iconUrl ?? null;
  const hasBoth = Boolean(lightLogo && darkLogo);
  const hasAny = Boolean(lightLogo || darkLogo);
  // When only one is uploaded, use it in both themes
  const fallbackLogo = lightLogo ?? darkLogo;

  return (
    <header className="border-b border-[var(--np-border)] bg-[var(--np-card)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4 lg:py-5">
        <div className="flex items-center justify-between gap-3 sm:gap-4">

          {/* Logo */}
          <Link href="/" className="block shrink-0" aria-label="Muktir Kantho — হোম">
            {hasBoth ? (
              <>
                <Image
                  src={lightLogo!}
                  alt="Muktir Kantho"
                  width={240}
                  height={60}
                  priority
                  className="block dark:hidden h-9 sm:h-10 lg:h-12 w-auto"
                />
                <Image
                  src={darkLogo!}
                  alt="Muktir Kantho"
                  width={240}
                  height={60}
                  priority
                  className="hidden dark:block h-9 sm:h-10 lg:h-12 w-auto"
                />
              </>
            ) : hasAny ? (
              <Image
                src={fallbackLogo!}
                alt="Muktir Kantho"
                width={240}
                height={60}
                priority
                className="h-9 sm:h-10 lg:h-12 w-auto"
              />
            ) : (
              <SiteLogo width={200} height={50} className="h-9 sm:h-10 lg:h-12 w-auto" />
            )}
          </Link>

          {/* Date strip — hidden on mobile, single line on tablet, stacked on desktop */}
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
