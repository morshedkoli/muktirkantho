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
import { SiteLogo } from "./site-logo";
import {
  getFooterMenuItems,
  getFooterBottomMenuItems,
  getSocialMenuItems,
  type MenuItemRecord,
} from "@/lib/menus";
import { prisma } from "@/lib/prisma";

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
  Twitter: "hover:bg-zinc-900 hover:border-zinc-900",
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

type DistrictRecord = { id: string; name: string; slug: string };

export async function Footer() {
  let settings = null,
    footerItems: MenuItemRecord[] = [],
    bottomItems: MenuItemRecord[] = [],
    socialItems: MenuItemRecord[] = [],
    districts: DistrictRecord[] = [];
  try {
    [settings, footerItems, bottomItems, socialItems, districts] = await Promise.all([
      getSiteSettings(),
      getFooterMenuItems(),
      getFooterBottomMenuItems(),
      getSocialMenuItems(),
      prisma.district.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    // fall through to defaults
  }

  const contactPhone = settings?.contactPhone ?? "+880 1234-567890";
  const contactEmail = settings?.contactEmail ?? "editor@muktirkantho.com";

  const displayFooterLinks =
    footerItems.length > 0 ? footerItems : DEFAULT_FOOTER_LINKS;
  const displayBottomLinks =
    bottomItems.length > 0 ? bottomItems : DEFAULT_BOTTOM_LINKS;

  return (
    <footer className="bg-zinc-900 text-zinc-100 mt-8">
      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Column 1: About */}
          <div className="space-y-4">
            <div>
              {settings?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={settings.logoUrl}
                  alt="মুক্তির কণ্ঠ"
                  className="h-10 w-auto brightness-0 invert"
                />
              ) : (
                <SiteLogo width={140} height={40} className="brightness-0 invert" />
              )}
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              বাংলাদেশের জেলা-উপজেলা পর্যায়ের বিশ্বস্ত আঞ্চলিক সংবাদমাধ্যম।
              নিরপেক্ষ ও তথ্যনিষ্ঠ সংবাদ পরিবেশনে প্রতিশ্রুতিবদ্ধ।
            </p>
            {/* Contact */}
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-red-400" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-red-400" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-white transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-red-400" />
                <a
                  href="mailto:ads@muktirkantho.com"
                  className="hover:text-white transition-colors"
                >
                  বিজ্ঞাপন: ads@muktirkantho.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Categories */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[2px] text-zinc-500">
              বিভাগসমূহ
            </h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              {displayFooterLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors group"
                  >
                    <span className="text-red-500 text-xs group-hover:text-red-400">▸</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Districts */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[2px] text-zinc-500">
              জেলাভিত্তিক সংবাদ
            </h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
              {districts.map((district) => (
                <li key={district.id}>
                  <Link
                    href={`/district/${district.slug}`}
                    className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors group"
                  >
                    <span className="text-red-500 text-xs group-hover:text-red-400">▸</span>
                    {district.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social & Follow Us */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[2px] text-zinc-500">
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
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white transition-all duration-200 ${color}`}
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
                  { label: "Twitter / X", icon: Twitter, color: "hover:bg-zinc-800 hover:border-zinc-800", href: "#" },
                  { label: "YouTube", icon: Youtube, color: "hover:bg-[#ff0000] hover:border-[#ff0000]", href: "#" },
                  { label: "Instagram", icon: Instagram, color: "hover:bg-[#e4405f] hover:border-[#e4405f]", href: "#" },
                ].map(({ label, icon: Icon, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white transition-all duration-200 ${color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}

            {/* E-paper link */}
            <div className="mt-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-[2px] text-zinc-500">
                ই-পেপার
              </h4>
              <Link
                href="/e-paper"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:border-red-500 hover:text-white hover:bg-red-600/10 transition-all duration-200"
              >
                <span className="text-red-400">📰</span>
                আজকের সংখ্যা
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Red divider line */}
      <div className="h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      {/* Bottom copyright bar */}
      <div className="bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-zinc-500 sm:flex-row">
            <p>
              &copy; {new Date().getFullYear()}{" "}
              <span className="text-zinc-300">মুক্তির কণ্ঠ</span>. সর্বস্বত্ব
              সংরক্ষিত।
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
              {displayBottomLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className="hover:text-zinc-200 transition-colors"
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
