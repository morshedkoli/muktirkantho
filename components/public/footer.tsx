import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Youtube, Mail, MapPin, Phone, Instagram, Linkedin, Apple, Monitor } from "lucide-react";
import { AdSlot } from "@/components/public/ad-slot";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./site-logo";
import { prisma } from "@/lib/prisma";

const FOOTER_CATEGORIES = [
  { slug: "bangladesh", name: "বাংলাদেশ" },
  { slug: "politics", name: "রাজনীতি" },
  { slug: "world", name: "বিশ্ব" },
  { slug: "business", name: "বাণিজ্য" },
  { slug: "opinion", name: "মতামত" },
  { slug: "sports", name: "খেলা" },
  { slug: "entertainment", name: "বিনোদন" },
  { slug: "lifestyle", name: "জীবনযাপন" },
  { slug: "jobs", name: "চাকরি" },
];

const SOCIAL_LINKS = [
  { name: "Facebook", icon: Facebook, href: "#", color: "hover:bg-[#1877f2]" },
  { name: "Twitter", icon: Twitter, href: "#", color: "hover:bg-black" },
  { name: "Instagram", icon: Instagram, href: "#", color: "hover:bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888]" },
  { name: "LinkedIn", icon: Linkedin, href: "#", color: "hover:bg-[#0a66c2]" },
  { name: "Youtube", icon: Youtube, href: "#", color: "hover:bg-[#ff0000]" },
];

export async function Footer() {
  const settings = await getSiteSettings();
  const categories = await prisma.category.findMany({ take: 9, orderBy: { name: "asc" } });
  const contactAddress = settings?.contactAddress || "123 News Street, Dhaka-1200, Bangladesh";
  const contactPhone = settings?.contactPhone || "+880 1234-567890";
  const contactEmail = settings?.contactEmail || "editor@muktirkantho.com";

  const footerCats = categories.length > 0 ? categories : FOOTER_CATEGORIES;

  return (
    <footer className="mt-16 border-t border-[var(--np-border)] bg-[var(--np-card)] text-[var(--np-text-primary)]">
      {/* Footer Strip Ad */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <AdSlot placement={AD_PLACEMENTS.FOOTER_STRIP} showPlaceholder={false} />
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <Image src={settings.logoUrl} alt="Muktir Kantho" width={160} height={48} className="h-auto w-[160px]" />
              ) : (
                <SiteLogo width={160} height={48} />
              )}
            </div>
            <p className="text-sm leading-relaxed text-[var(--np-text-secondary)]">
              Voice of Freedom — Your trusted source for regional news, local reporting, and verified journalism from across Bangladesh.
            </p>
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.name} href={social.href} aria-label={social.name}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-[var(--np-border)] text-[var(--np-text-secondary)] hover:text-white transition-all ${social.color}`}>
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-4 font-label text-xs uppercase tracking-wider text-[var(--np-muted)]">বিভাগসমূহ</h4>
            <ul className="space-y-2.5">
              {footerCats.map((cat: { name: string; slug: string }) => {
                const { name, slug } = cat;
                return (
                  <li key={slug}>
                    <Link href={`/category/${slug}`}
                      className="text-sm text-[var(--np-text-secondary)] hover:text-[var(--np-primary)] transition-colors">
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* E-Paper & Apps */}
          <div>
            <h4 className="mb-4 font-label text-xs uppercase tracking-wider text-[var(--np-muted)]">ই-পেপার ও অ্যাপ</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/e-paper"
                  className="flex items-center gap-3 rounded-lg border border-[var(--np-border)] px-4 py-3 text-sm text-[var(--np-text-soft)] hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)] transition-all">
                  <Monitor className="h-5 w-5 shrink-0 text-[var(--np-muted)]" />
                  <div>
                    <div className="font-medium">ই-পেপার</div>
                    <div className="text-xs text-[var(--np-text-secondary)]">আজকের সংবাদপত্র</div>
                  </div>
                </Link>
              </li>
              <li>
                <a href="#"
                  className="flex items-center gap-3 rounded-lg border border-[var(--np-border)] px-4 py-3 text-sm text-[var(--np-text-soft)] hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)] transition-all">
                  <Apple className="h-5 w-5 shrink-0 text-[var(--np-muted)]" />
                  <div>
                    <div className="font-medium">অ্যাপ স্টোর</div>
                    <div className="text-xs text-[var(--np-text-secondary)]">iOS অ্যাপ ডাউনলোড</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="#"
                  className="flex items-center gap-3 rounded-lg border border-[var(--np-border)] px-4 py-3 text-sm text-[var(--np-text-soft)] hover:bg-[var(--np-newsprint)] hover:text-[var(--np-primary)] transition-all">
                  <svg className="h-5 w-5 shrink-0 text-[var(--np-muted)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 1.5c-2.1 0-4.5 1.5-6 3.5-1.5-2-3.9-3.5-6-3.5C3.1 1.5 1 5.5 1 9c0 7 11 14 11 14s11-7 11-14c0-3.5-2.1-7.5-5-7.5z"/>
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
            <h4 className="mb-4 font-label text-xs uppercase tracking-wider text-[var(--np-muted)]">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-[var(--np-text-secondary)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--np-primary)]" />
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--np-text-secondary)]">
                <Phone className="h-4 w-4 shrink-0 text-[var(--np-primary)]" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--np-text-secondary)]">
                <Mail className="h-4 w-4 shrink-0 text-[var(--np-primary)]" />
                <span>{contactEmail}</span>
              </li>
            </ul>
            <div className="mt-5 rounded-lg border border-[var(--np-border)] p-4">
              <p className="text-xs text-[var(--np-muted)] mb-1 font-label uppercase tracking-wider">বিজ্ঞাপন</p>
              <p className="text-sm text-[var(--np-text-soft)]">
                <a href="mailto:ads@muktirkantho.com" className="hover:text-[var(--np-primary)] transition-colors">ads@muktirkantho.com</a>
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
              <Link href="/privacy-policy" className="hover:text-[var(--np-primary)] transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-use" className="hover:text-[var(--np-primary)] transition-colors">Terms of Use</Link>
              <Link href="/cookie-policy" className="hover:text-[var(--np-primary)] transition-colors">Cookie Policy</Link>
              <Link href="/accessibility" className="hover:text-[var(--np-primary)] transition-colors">Accessibility</Link>
              <Link href="/contact" className="hover:text-[var(--np-primary)] transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
