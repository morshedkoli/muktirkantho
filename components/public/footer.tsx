import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Youtube, Mail, MapPin, Phone } from "lucide-react";
import { AdSlot } from "@/components/public/ad-slot";
import { AD_PLACEMENTS } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./site-logo";

export async function Footer() {
  const settings = await getSiteSettings();
  const contactAddress = settings?.contactAddress || "123 News Street, Dhaka-1200, Bangladesh";
  const contactPhone = settings?.contactPhone || "+880 1234-567890";
  const contactEmail = settings?.contactEmail || "editor@muktirkantho.com";

  return (
    <footer className="mt-16 border-t border-[var(--np-border)] bg-[var(--np-card)] text-[var(--np-text-primary)]">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Brand column */}
          <div className="space-y-4">
            {settings?.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt="Muktir Kantho"
                width={200}
                height={60}
                className="h-auto w-[200px]"
              />
            ) : (
              <SiteLogo width={200} height={60} />
            )}
            <p className="text-sm leading-relaxed text-[var(--np-text-secondary)]">
              Voice of Freedom - Your trusted source for regional news, local reporting, and verified journalism from across Bangladesh.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--np-border)] bg-[var(--np-background)] text-[var(--np-text-secondary)] hover:bg-[var(--np-primary)] hover:text-white transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--np-border)] bg-[var(--np-background)] text-[var(--np-text-secondary)] hover:bg-[var(--np-primary)] hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--np-border)] bg-[var(--np-background)] text-[var(--np-text-secondary)] hover:bg-[var(--np-primary)] hover:text-white transition-all">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--np-accent)]">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-[var(--np-text-secondary)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--np-accent)]" />
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--np-text-secondary)]">
                <Phone className="h-4 w-4 shrink-0 text-[var(--np-accent)]" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center gap-3 text-[var(--np-text-secondary)]">
                <Mail className="h-4 w-4 shrink-0 text-[var(--np-accent)]" />
                <span>{contactEmail}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-6">
        <AdSlot placement={AD_PLACEMENTS.FOOTER_STRIP} showPlaceholder={false} />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--np-border)]">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-[var(--np-text-secondary)] sm:flex-row">
            <p>&copy; {new Date().getFullYear()} Muktir Kantho. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy-policy" className="hover:text-[var(--np-primary)] transition-colors">Privacy Policy</Link>
              <Link href="/terms-of-use" className="hover:text-[var(--np-primary)] transition-colors">Terms of Use</Link>
              <Link href="/cookie-policy" className="hover:text-[var(--np-primary)] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
