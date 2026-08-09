import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  Instagram,
  Linkedin,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { getBranding, SITE_NAME } from "@/lib/branding";
import {
  getFooterMenuItems,
  getFooterBottomMenuItems,
  getSocialMenuItems,
  type MenuItemRecord,
} from "@/lib/menus";

type SocialIconComponent = React.ComponentType<{ className?: string }>;

const SOCIAL_ICONS: Record<string, SocialIconComponent> = {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
};

const SOCIAL_COLORS: Record<string, string> = {
  Facebook: "hover:bg-[#1877f2] hover:border-[#1877f2]",
  Twitter: "hover:bg-[var(--np-footer-deep)] hover:border-[var(--np-footer-deep)]",
  Instagram: "hover:bg-[#e4405f] hover:border-[#e4405f]",
  LinkedIn: "hover:bg-[#0a66c2] hover:border-[#0a66c2]",
  YouTube: "hover:bg-[#ff0000] hover:border-[#ff0000]",
};

const DEFAULT_FOOTER_LINKS = [
  { id: "d1", label: "বাংলাদেশ", url: "/category/bangladesh", openInNewTab: false },
  { id: "d2", label: "রাজনীতি", url: "/category/politics", openInNewTab: false },
  { id: "d3", label: "বিশ্ব", url: "/category/world", openInNewTab: false },
  { id: "d4", label: "বাণিজ্য", url: "/category/business", openInNewTab: false },
  { id: "d5", label: "মতামত", url: "/category/opinion", openInNewTab: false },
  { id: "d6", label: "খেলা", url: "/category/sports", openInNewTab: false },
  { id: "d7", label: "বিনোদন", url: "/category/entertainment", openInNewTab: false },
  { id: "d8", label: "জীবনযাপন", url: "/category/lifestyle", openInNewTab: false },
  { id: "d9", label: "চাকরি", url: "/category/jobs", openInNewTab: false },
];

const DEFAULT_BOTTOM_LINKS = [
  { id: "b1", label: "Privacy Policy", url: "/privacy-policy", openInNewTab: false },
  { id: "b2", label: "Terms of Use", url: "/terms-of-use", openInNewTab: false },
  { id: "b3", label: "Cookie Policy", url: "/cookie-policy", openInNewTab: false },
  { id: "b4", label: "Accessibility", url: "/accessibility", openInNewTab: false },
  { id: "b5", label: "Contact", url: "/contact", openInNewTab: false },
];

export async function Footer() {
  let settings = null,
    footerItems: MenuItemRecord[] = [],
    bottomItems: MenuItemRecord[] = [],
    socialItems: MenuItemRecord[] = [];
  try {
    [settings, footerItems, bottomItems, socialItems] = await Promise.all([
      getSiteSettings(),
      getFooterMenuItems(),
      getFooterBottomMenuItems(),
      getSocialMenuItems(),
    ]);
  } catch {
    // fall through to defaults
  }

  const contactPhone = settings?.contactPhone ?? "+880 1234-567890";
  const contactEmail = settings?.contactEmail ?? "editor@muktirkantho.com";

  // The footer sits on the dark surface, so it wants the dark mark first.
  const { darkLogoUrl, logoUrl, hasDistinctDarkLogo } = await getBranding();
  const footerLogo = darkLogoUrl ?? logoUrl;

  const displayFooterLinks =
    footerItems.length > 0 ? footerItems : DEFAULT_FOOTER_LINKS;
  const displayBottomLinks =
    bottomItems.length > 0 ? bottomItems : DEFAULT_BOTTOM_LINKS;

  return (
    <footer className="mt-8 bg-[var(--np-footer-bg)] text-[var(--np-footer-text)]">
      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {/* Column 1: About */}
          <div className="space-y-4">
            <div>
              {footerLogo ? (
                // Was a raw <img> of the full-size Cloudinary PNG. React hoists
                // a preload for those during SSR, so every page pulled the
                // unoptimized original in addition to the masthead's optimized
                // copy — for a 40px-tall mark below the fold.
                <Image
                  src={footerLogo}
                  alt={SITE_NAME}
                  width={200}
                  height={40}
                  sizes="200px"
                  loading="lazy"
                  // The footer is always dark. A dedicated dark mark was drawn
                  // for that and is used as uploaded; only the light mark needs
                  // flattening to white, which costs it its colours.
                  className={`h-10 w-auto${hasDistinctDarkLogo ? "" : " brightness-0 invert"}`}
                />
              ) : (
                <span className="text-2xl font-bold leading-none tracking-tight text-[var(--np-footer-text)]">
                  {SITE_NAME}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-[var(--np-footer-muted)]">
              বাংলাদেশের জেলা-উপজেলা পর্যায়ের বিশ্বস্ত আঞ্চলিক সংবাদমাধ্যম।
              নিরপেক্ষ ও তথ্যনিষ্ঠ সংবাদ পরিবেশনে প্রতিশ্রুতিবদ্ধ।
            </p>
            {/* Contact */}
            <ul className="space-y-2 text-sm text-[var(--np-footer-muted)]">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--np-footer-accent)]" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--np-footer-accent)]" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-[var(--np-footer-text)] transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--np-footer-accent)]" />
                <a
                  href="mailto:ads@muktirkantho.com"
                  className="hover:text-[var(--np-footer-text)] transition-colors"
                >
                  বিজ্ঞাপন: ads@muktirkantho.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[2px] text-[var(--np-footer-heading)]">
              বিভাগসমূহ
            </h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              {displayFooterLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1.5 text-sm text-[var(--np-footer-muted)] hover:text-[var(--np-footer-text)] transition-colors group"
                  >
                    <span className="text-[var(--np-footer-accent)] text-xs group-hover:text-[var(--np-footer-accent)]">▸</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social & Follow Us */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[2px] text-[var(--np-footer-heading)]">
              আমাদের অনুসরণ করুন
            </h4>
            {socialItems.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {socialItems.map((social) => {
                  const Icon = social.icon ? SOCIAL_ICONS[social.icon] : null;
                  if (!Icon) return null;
                  const color = social.icon
                    ? (SOCIAL_COLORS[social.icon] ?? "")
                    : "";
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      aria-label={social.label}
                      target={social.openInNewTab ? "_blank" : undefined}
                      rel={
                        social.openInNewTab ? "noopener noreferrer" : undefined
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--np-footer-border)] text-[var(--np-footer-muted)] hover:text-[var(--np-footer-text)] transition-all duration-200 ${color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            ) : (
              /* Default social icons when no DB entries */
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: "Facebook", icon: Facebook, color: "hover:bg-[#1877f2] hover:border-[#1877f2]", href: "#" },
                  { label: "Twitter / X", icon: Twitter, color: "hover:bg-[var(--np-footer-deep)] hover:border-[var(--np-footer-deep)]", href: "#" },
                  { label: "YouTube", icon: Youtube, color: "hover:bg-[#ff0000] hover:border-[#ff0000]", href: "#" },
                  { label: "Instagram", icon: Instagram, color: "hover:bg-[#e4405f] hover:border-[#e4405f]", href: "#" },
                ].map(({ label, icon: Icon, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--np-footer-border)] text-[var(--np-footer-muted)] hover:text-[var(--np-footer-text)] transition-all duration-200 ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}

            {/* E-paper link */}
            <div className="mt-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-[var(--np-footer-heading)]">
                ই-পেপার
              </h4>
              <Link
                href="/e-paper"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--np-footer-border)] px-4 py-2.5 text-sm text-[var(--np-footer-text)] hover:border-[var(--np-footer-accent)] hover:text-[var(--np-footer-text)] hover:bg-[var(--np-footer-accent)]/10 transition-all duration-200"
              >
                <span className="text-[var(--np-footer-accent)]">📰</span>
                আজকের সংখ্যা
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Red divider line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--np-footer-accent)] to-transparent" />

      {/* Bottom copyright bar */}
      <div className="bg-[var(--np-footer-deep)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-[var(--np-footer-heading)] sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()}{" "}
              <span className="text-[var(--np-footer-text)]">মুক্তির কণ্ঠ</span>. সর্বস্বত্ব
              সংরক্ষিত।
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
              {displayBottomLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className="hover:text-[var(--np-footer-text)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
