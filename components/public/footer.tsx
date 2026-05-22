import Link from "next/link";
import {
  Facebook, Twitter, Youtube, Mail, MapPin, Phone,
  Instagram, Linkedin, Apple, Monitor,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./site-logo";
import { getFooterMenuItems, getFooterBottomMenuItems, getSocialMenuItems } from "@/lib/menus";

type SocialIcon = React.ComponentType<{ className?: string }>;

const SOCIAL_ICONS: Record<string, SocialIcon> = {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
};

const SOCIAL_COLORS: Record<string, string> = {
  Facebook: "hover:bg-[#1877f2]",
  Twitter: "hover:bg-black",
  Instagram: "hover:bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]",
  LinkedIn: "hover:bg-[#0a66c2]",
  YouTube: "hover:bg-[#ff0000]",
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
  const [settings, footerItems, bottomItems, socialItems] = await Promise.all([
    getSiteSettings(),
    getFooterMenuItems(),
    getFooterBottomMenuItems(),
    getSocialMenuItems(),
  ]);

  const contactPhone = settings?.contactPhone || "+880 1234-567890";
  const contactEmail = settings?.contactEmail || "editor@muktirkantho.com";

  const displayFooterLinks = footerItems.length > 0 ? footerItems : DEFAULT_FOOTER_LINKS;
  const displayBottomLinks = bottomItems.length > 0 ? bottomItems : DEFAULT_BOTTOM_LINKS;

  return (
    <footer className="mt-8 border-t border-[var(--np-border)] bg-[var(--np-newsprint-2)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2">

          {/* Brand */}
          <div className="space-y-4">
            {settings?.logoUrl && settings?.iconUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logoUrl} alt="মুক্তির কণ্ঠ" className="block dark:hidden h-8 w-auto" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.iconUrl} alt="মুক্তির কণ্ঠ" className="hidden dark:block h-8 w-auto" />
              </>
            ) : settings?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt="মুক্তির কণ্ঠ" className="h-8 w-auto" />
            ) : settings?.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.iconUrl} alt="মুক্তির কণ্ঠ" className="h-8 w-auto" />
            ) : (
              <SiteLogo width={120} height={32} />
            )}
            <p className="text-xs leading-relaxed text-[var(--np-text-secondary)]">
              বাংলাদেশের জেলা-উপজেলা পর্যায়ের বিশ্বস্ত আঞ্চলিক সংবাদমাধ্যম।
            </p>
            {socialItems.length > 0 && (
              <div className="flex gap-2">
                {socialItems.map((social) => {
                  const Icon = social.icon ? SOCIAL_ICONS[social.icon] : null;
                  if (!Icon) return null;
                  const color = social.icon ? (SOCIAL_COLORS[social.icon] ?? "") : "";
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      aria-label={social.label}
                      target={social.openInNewTab ? "_blank" : undefined}
                      rel={social.openInNewTab ? "noopener noreferrer" : undefined}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border border-[var(--np-border)] text-[var(--np-text-secondary)] hover:text-white transition-all ${color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer links column */}
          <div>
            <h4 className="mb-4 font-label text-xs uppercase tracking-wider text-[var(--np-muted)]">বিভাগসমূহ</h4>
            <ul className="space-y-2.5">
              {displayFooterLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="text-sm text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* E-Paper & Apps */}
          <div>
            <h4 className="mb-4 font-label text-xs uppercase tracking-wider text-[var(--np-muted)]">ই-পেপার ও অ্যাপ</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/e-paper"
                  className="flex items-center gap-3 rounded-lg border border-[var(--np-border)] px-4 py-3 text-sm text-[var(--np-text-soft)] hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)] transition-all"
                >
                  <Monitor className="h-5 w-5 shrink-0 text-[var(--np-muted)]" />
                  <div>
                    <div className="font-medium">ই-পেপার</div>
                    <div className="text-xs text-[var(--np-text-secondary)]">আজকের সংবাদপত্র</div>
                  </div>
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-lg border border-[var(--np-border)] px-4 py-3 text-sm text-[var(--np-text-soft)] hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)] transition-all"
                >
                  <Apple className="h-5 w-5 shrink-0 text-[var(--np-muted)]" />
                  <div>
                    <div className="font-medium">অ্যাপ স্টোর</div>
                    <div className="text-xs text-[var(--np-text-secondary)]">iOS অ্যাপ ডাউনলোড</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-lg border border-[var(--np-border)] px-4 py-3 text-sm text-[var(--np-text-soft)] hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)] transition-all"
                >
                  <svg className="h-5 w-5 shrink-0 text-[var(--np-muted)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 1.5c-2.1 0-4.5 1.5-6 3.5-1.5-2-3.9-3.5-6-3.5C3.1 1.5 1 5.5 1 9c0 7 11 14 11 14s11-7 11-14c0-3.5-2.1-7.5-5-7.5z" />
                  </svg>
                  <div>
                    <div className="font-medium">গুগল প্লে</div>
                    <div className="text-xs text-[var(--np-text-secondary)]">Android অ্যাপ ডাউনলোড</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--np-muted)]">যোগাযোগ</h4>
            <ul className="space-y-2.5 text-xs text-[var(--np-text-secondary)]">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--np-primary)]" />
                {contactPhone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--np-primary)]" />
                {contactEmail}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--np-primary)]" />
                <a href="mailto:ads@muktirkantho.com"
                  className="hover:text-[var(--np-primary)] transition-colors">
                  বিজ্ঞাপন: ads@muktirkantho.com
                </a>
              </li>
            </ul>
            <div className="mt-5 rounded-lg border border-[var(--np-border)] p-4">
              <p className="text-xs text-[var(--np-muted)] mb-1 font-label uppercase tracking-wider">বিজ্ঞাপন</p>
              <p className="text-sm text-[var(--np-text-soft)]">
                <a href="mailto:ads@muktirkantho.com" className="hover:text-[var(--np-primary)] transition-colors">
                  ads@muktirkantho.com
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--np-border)]">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-[var(--np-text-secondary)] sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Muktir Kantho. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {displayBottomLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.url}
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                  className="hover:text-[var(--np-primary)] transition-colors"
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
