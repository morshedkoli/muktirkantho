import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./site-logo";

const SOCIAL_LINKS = [
  { name: "Facebook",  icon: Facebook,  href: "#" },
  { name: "Twitter",   icon: Twitter,   href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn",  icon: Linkedin,  href: "#" },
];

export async function Footer() {
  const settings = await getSiteSettings();
  const contactPhone = settings?.contactPhone || "+880 1234-567890";
  const contactEmail = settings?.contactEmail || "editor@muktirkantho.com";

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
            <div className="flex gap-2">
              {SOCIAL_LINKS.map(({ name, icon: Icon, href }) => (
                <a key={name} href={href} aria-label={name}
                  className="flex h-7 w-7 items-center justify-center rounded text-[var(--np-text-secondary)] border border-[var(--np-border)] hover:border-[var(--np-primary)] hover:text-[var(--np-primary)] transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
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
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--np-border)]">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--np-muted)]">
          <p>&copy; {new Date().getFullYear()} মুক্তির কণ্ঠ। সর্বস্বত্ব সংরক্ষিত।</p>
          <p>Powered by <span className="text-[var(--np-primary)]">মুক্তির কণ্ঠ</span> পাবলিশিং</p>
        </div>
      </div>
    </footer>
  );
}
