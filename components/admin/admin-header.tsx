"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  Menu,
  LogOut,
  Settings as SettingsIcon,
  AlertCircle,
  X,
  MessageSquare,
  Languages,
} from "lucide-react";
import { AdminThemeToggle } from "@/components/theme-toggle";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";
import { useLang } from "@/lib/admin-i18n";

type AdminUser = { name: string; email: string; role: string };

function initials(name?: string) {
  if (!name) return "AD";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface AdminHeaderProps {
  onMobileMenuToggle?: () => void;
}

type Notification = {
  id: string;
  type: "breaking" | "social" | "comment" | "system";
  titleKey: "notifBreakingTitle" | "notifFacebookTitle" | "notifCommentTitle" | "notifSitemapTitle";
  descKey: "notifBreakingDesc" | "notifFacebookDesc" | "notifCommentDesc" | "notifSitemapDesc";
  time: string;
  unread: boolean;
};

const sampleNotifications: Notification[] = [
  { id: "1", type: "breaking", titleKey: "notifBreakingTitle", descKey: "notifBreakingDesc", time: "2m", unread: true },
  { id: "2", type: "social",   titleKey: "notifFacebookTitle", descKey: "notifFacebookDesc", time: "15m", unread: true },
  { id: "3", type: "comment",  titleKey: "notifCommentTitle",  descKey: "notifCommentDesc",  time: "1h", unread: false },
  { id: "4", type: "system",   titleKey: "notifSitemapTitle",  descKey: "notifSitemapDesc",  time: "2h", unread: false },
];

const notificationIcons: Record<string, React.ElementType> = {
  breaking: AlertCircle,
  social: X,
  comment: MessageSquare,
  system: Bell,
};

const breadcrumbMap: Record<string, { en: string; bn: string }> = {
  dashboard:   { en: "Dashboard",  bn: "ড্যাশবোর্ড" },
  posts:       { en: "Posts",      bn: "পোস্ট" },
  categories:  { en: "Categories", bn: "বিভাগ" },
  tags:        { en: "Tags",       bn: "ট্যাগ" },
  media:       { en: "Media",      bn: "মিডিয়া" },
  comments:    { en: "Comments",   bn: "মন্তব্য" },
  breaking:    { en: "Breaking",   bn: "ব্রেকিং" },
  branding:    { en: "Branding",   bn: "ব্র্যান্ডিং" },
  analytics:   { en: "Analytics",  bn: "বিশ্লেষণ" },
  settings:    { en: "Settings",   bn: "সেটিংস" },
  users:       { en: "Users",      bn: "ব্যবহারকারী" },
  districts:   { en: "Districts",  bn: "জেলা" },
  upazilas:    { en: "Upazilas",   bn: "উপজেলা" },
  divisions:   { en: "Geo",        bn: "ভূগোল" },
  facebook:    { en: "Facebook",   bn: "ফেসবুক" },
  seo:         { en: "SEO",        bn: "এসইও" },
  ads:         { en: "Ads",        bn: "বিজ্ঞাপন" },
  opinion:     { en: "Opinion",    bn: "মতামত" },
  video:       { en: "Video",      bn: "ভিডিও" },
  gallery:     { en: "Gallery",    bn: "গ্যালারি" },
  homepage:    { en: "Homepage",   bn: "হোমপেজ" },
  subscribers: { en: "Subscribers",bn: "সাবস্ক্রাইবার" },
  user:        { en: "Profile",    bn: "প্রোফাইল" },
  social:      { en: "Social",     bn: "সোশ্যাল" },
};

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLang();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [notifications] = useState<Notification[]>(sampleNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const seg = pathname.split("/").filter(Boolean);
  const subSlug = seg[1] ?? "dashboard";
  const subLabel = breadcrumbMap[subSlug]?.[lang] ?? (subSlug.charAt(0).toUpperCase() + subSlug.slice(1).replace(/-/g, " "));

  useEffect(() => {
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: AdminUser | null) => d && setUser(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", fn);
    return () => window.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    const fn = (e: MouseEvent) => {
      if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false);
    };
    window.addEventListener("mousedown", fn);
    return () => window.removeEventListener("mousedown", fn);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-30 h-[60px] bg-[var(--ad-card)] border-b border-[var(--ad-border)] shadow-[var(--ad-shadow)]">
      <div className="h-full flex items-center gap-3 px-4 sm:px-6 lg:px-7">

        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--ad-text-secondary)] hover:bg-[var(--ad-paper-2)] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.05em]">
          <Link href="/admin/dashboard" className="text-[var(--ad-text-muted)] hover:text-[var(--ad-text-primary)] transition-colors">
            {t("adminBreadcrumb")}
          </Link>
          <span className="text-[var(--ad-text-muted)]/60">/</span>
          <span className="text-[var(--ad-text-secondary)]">{subLabel}</span>
        </div>

        {/* Search pill */}
        <div className="flex-1 max-w-[420px] mx-auto">
          <div className="flex items-center gap-2 h-9 bg-[var(--ad-background)] border border-[var(--ad-border)] rounded-full px-3.5 hover:border-[var(--ad-green)] transition-colors cursor-text">
            <Search className="h-3.5 w-3.5 text-[var(--ad-text-muted)] shrink-0" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--ad-text-primary)] placeholder:text-[var(--ad-text-muted)] min-w-0"
            />
            <kbd className="hidden md:inline-flex font-mono text-[10px] bg-[var(--ad-border)] text-[var(--ad-text-muted)] px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            title={lang === "en" ? "Switch to বাংলা" : "Switch to English"}
            className="h-[34px] px-2.5 flex items-center gap-1.5 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] hover:border-[var(--ad-green)] hover:text-[var(--ad-green)] text-[var(--ad-text-secondary)] transition-colors text-[11px] font-bold tracking-wide"
          >
            <Languages className="h-3.5 w-3.5 shrink-0" />
            <span>{lang === "en" ? "বাং" : "EN"}</span>
          </button>

          {/* Theme toggle */}
          <div className="h-[34px] w-[34px] flex items-center justify-center rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] hover:border-[var(--ad-green)] transition-colors">
            <AdminThemeToggle variant="minimal" size="sm" />
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="h-[34px] w-[34px] flex items-center justify-center rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] hover:border-[var(--ad-green)] hover:text-[var(--ad-green)] text-[var(--ad-text-secondary)] transition-colors relative"
              aria-label={t("notifications")}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] bg-[var(--ad-brand)] rounded-full border-[1.5px] border-[var(--ad-card)]" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-[var(--ad-shadow-lg)] overflow-hidden">
                <div className="border-b border-[var(--ad-border)] px-4 py-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--ad-text-primary)]">{t("notifications")}</h3>
                  <span className="font-mono text-[10px] text-[var(--ad-text-muted)]">{unreadCount} {t("unread")}</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[var(--ad-border)]">
                  {notifications.map((n) => {
                    const Icon = notificationIcons[n.type];
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 transition-colors hover:bg-[var(--ad-paper)] ${n.unread ? "bg-[var(--ad-paper)]" : ""}`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            n.type === "breaking" ? "bg-[var(--ad-brand-light)] text-[var(--ad-brand)]"
                            : n.type === "social"  ? "bg-[var(--ad-blue-light)] text-[var(--ad-blue)]"
                            : n.type === "comment" ? "bg-[var(--ad-green-light)] text-[var(--ad-green)]"
                            : "bg-[var(--ad-amber-light)] text-[var(--ad-amber)]"
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[var(--ad-text-primary)]">{t(n.titleKey)}</p>
                            <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5 line-clamp-1">{t(n.descKey)}</p>
                            <p className="font-mono text-[10px] text-[var(--ad-text-muted)] mt-1">{n.time}</p>
                          </div>
                          {n.unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--ad-brand)] shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User avatar / menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="h-[34px] w-[34px] rounded-full flex items-center justify-center text-white text-[12px] font-bold bg-gradient-to-br from-[var(--ad-green)] to-[var(--ad-green-mid)] hover:opacity-90 transition-opacity"
              aria-label="User menu"
            >
              {initials(user?.name)}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-[var(--ad-shadow-lg)] overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--ad-border)]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold bg-gradient-to-br from-[var(--ad-green)] to-[var(--ad-green-mid)]">
                    {initials(user?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--ad-text-primary)] truncate">{user?.name || "Admin"}</p>
                    <p className="text-xs text-[var(--ad-text-muted)] truncate">{user?.email || ""}</p>
                  </div>
                </div>
                <div className="p-1">
                  <Link
                    href="/admin/user"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ad-text-primary)] hover:bg-[var(--ad-background)] transition-colors"
                  >
                    <SettingsIcon className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                    {t("profileSettings")}
                  </Link>
                  <form action={logoutAdminAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ad-brand)] hover:bg-[var(--ad-brand-light)] transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("signOut")}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
