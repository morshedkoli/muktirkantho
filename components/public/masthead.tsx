import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram, Linkedin } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { getSocialMenuItems } from "@/lib/menus";
import { SiteLogo } from "./site-logo";

function isValidLogoUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type SocialIconComponent = React.ComponentType<{ className?: string }>;

const SOCIAL_ICONS: Record<string, SocialIconComponent> = {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
};

export async function Masthead() {
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;
  let socialItems: Awaited<ReturnType<typeof getSocialMenuItems>> = [];

  try {
    [settings, socialItems] = await Promise.all([
      getSiteSettings(),
      getSocialMenuItems(),
    ]);
  } catch {
    settings = null;
    socialItems = [];
  }

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

  const lightLogo = isValidLogoUrl(settings?.logoUrl) ? settings!.logoUrl : null;
  const darkLogo = isValidLogoUrl(settings?.iconUrl) ? settings!.iconUrl : null;
  const hasBoth = Boolean(lightLogo && darkLogo);
  const hasAny = Boolean(lightLogo || darkLogo);
  const fallbackLogo = lightLogo ?? darkLogo;
  const logoH = settings?.logoHeight ?? 52;

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
            {hasBoth ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightLogo!}
                  alt="মুক্তির কণ্ঠ"
                  className="block dark:hidden w-auto max-w-[56vw] sm:max-w-none"
                  style={{ height: `${logoH}px` }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={darkLogo!}
                  alt="মুক্তির কণ্ঠ"
                  className="hidden dark:block w-auto max-w-[56vw] sm:max-w-none"
                  style={{ height: `${logoH}px` }}
                />
              </>
            ) : hasAny ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fallbackLogo!}
                alt="মুক্তির কণ্ঠ"
                className="w-auto max-w-[56vw] sm:max-w-none"
                style={{ height: `${logoH}px` }}
              />
            ) : (
              <SiteLogo width={Math.round(logoH * 4)} height={logoH} />
            )}
          </Link>

          {/* Right: Social icons */}
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
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--np-border)] text-[var(--np-text-secondary)] hover:bg-[var(--np-primary)] hover:text-white hover:border-[var(--np-primary)] transition-all duration-200"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  );
                })
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
