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
  ExternalLink,
} from "lucide-react";
import { AdminThemeToggle } from "@/components/theme-toggle";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  title: string;
  description: string;
  time: string;
  unread: boolean;
};

const sampleNotifications: Notification[] = [
  { id: "1", type: "breaking", title: "Breaking News Alert", description: "New article flagged as breaking ready for review", time: "2m ago", unread: true },
  { id: "2", type: "social", title: "Facebook Post Failed", description: "Scheduled post 'Budget Analysis 2026' failed to publish", time: "15m ago", unread: true },
  { id: "3", type: "comment", title: "Comment Spike Detected", description: "45 new comments on 'Local Election Results'", time: "1h ago", unread: false },
  { id: "4", type: "system", title: "Sitemap Updated", description: "XML sitemap regenerated successfully", time: "2h ago", unread: false },
];

const notificationIcons: Record<string, React.ElementType> = {
  breaking: AlertCircle,
  social: X,
  comment: MessageSquare,
  system: Bell,
};

function getBreadcrumb(pathname: string): { root: string; sub: string } {
  const seg = pathname.split("/").filter(Boolean);
  if (seg.length < 2) return { root: "Admin", sub: "Dashboard" };
  const sub = seg[1].charAt(0).toUpperCase() + seg[1].slice(1).replace(/-/g, " ");
  return { root: "Admin", sub };
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [notifications] = useState<Notification[]>(sampleNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const crumb = getBreadcrumb(pathname);

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
    <header className="sticky top-0 z-30 h-[56px] border-b border-[var(--ad-border)] glass-panel shadow-sm shrink-0">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-7">
        
        {/* Left Side: Mobile Hamburger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-1.5 -ml-1 rounded-full text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/60 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2 text-[10.5px] font-bold tracking-wider text-[var(--ad-text-muted)] uppercase">
            <Link href="/admin/dashboard" className="hover:text-[var(--ad-text-primary)] transition-colors">
              {crumb.root}
            </Link>
            <span className="opacity-30 text-xs font-light">/</span>
            <span className="text-[var(--ad-text-primary)] font-extrabold">{crumb.sub}</span>
          </div>
        </div>

        {/* Search pill — center */}
        <div className="flex-1 max-w-[280px] mx-auto hidden md:block">
          <div className="flex items-center gap-2 h-8.5 bg-[var(--ad-border)]/40 border border-transparent rounded-full px-3.5 hover:bg-[var(--ad-border)]/70 focus-within:bg-[var(--ad-card)] focus-within:border-[var(--ad-green)] focus-within:ring-2 focus-within:ring-[var(--ad-green)]/10 transition-all duration-200 cursor-text">
            <Search className="h-3.5 w-3.5 text-[var(--ad-text-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Search console..."
              className="flex-1 bg-transparent border-none outline-none text-[12px] text-[var(--ad-text-primary)] placeholder:text-[var(--ad-text-muted)] min-w-0"
            />
            <kbd className="inline-flex font-mono text-[8px] font-bold text-[var(--ad-text-muted)] bg-[var(--ad-background)] px-1.5 py-0.5 rounded border border-[var(--ad-border)]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Actions — Right Side */}
        <TooltipProvider>
          <div className="flex items-center gap-3">

            {/* View Site */}
            <Tooltip delayDuration={50}>
              <TooltipTrigger asChild>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl text-[11px] font-semibold text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-border)]/40 transition-all border border-[var(--ad-border)] shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span>View Site</span>
                </a>
              </TooltipTrigger>
              <TooltipContent className="shadow-premium py-1 px-2.5">
                Open front-end site
              </TooltipContent>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip delayDuration={50}>
              <TooltipTrigger asChild>
                <div className="h-8.5 w-8.5 flex items-center justify-center rounded-xl text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-border)]/40 transition-all cursor-pointer">
                  <AdminThemeToggle variant="minimal" size="sm" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="shadow-premium py-1 px-2.5">
                Toggle Theme
              </TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setNotifOpen((o) => !o)}
                    className="h-8.5 w-8.5 flex items-center justify-center rounded-xl text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] hover:bg-[var(--ad-border)]/40 transition-all cursor-pointer relative"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-[var(--ad-brand)] rounded-full ring-2 ring-[var(--ad-card)]" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="shadow-premium py-1 px-2.5">
                  Notifications
                </TooltipContent>
              </Tooltip>

              {notifOpen && (
                <div className="absolute right-0 top-10 z-50 w-80 sm:w-96 rounded-2xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-premium overflow-hidden animate-in fade-in duration-200">
                  <div className="border-b border-[var(--ad-border)] px-4 py-3 flex items-center justify-between bg-[var(--ad-background)]/50">
                    <h3 className="text-[10px] font-bold text-[var(--ad-text-primary)] uppercase tracking-wider font-mono">Notifications</h3>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[var(--ad-green)] bg-[var(--ad-green-light)] px-2.5 py-0.5 rounded-full border border-[var(--ad-green)]/10">{unreadCount} new</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[var(--ad-border)]">
                    {notifications.map((n) => {
                      const Icon = notificationIcons[n.type];
                      return (
                        <div
                          key={n.id}
                          className={`px-4 py-3.5 transition-colors hover:bg-[var(--ad-background)]/40 ${
                            n.unread ? "bg-[var(--ad-green-light)]/10" : ""
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-0.5 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg ${
                                n.type === "breaking"
                                  ? "bg-[var(--ad-brand-light)] text-[var(--ad-brand)] border border-[var(--ad-brand)]/10"
                                  : n.type === "social"
                                  ? "bg-[var(--ad-blue-light)] text-[var(--ad-blue)] border border-[var(--ad-blue)]/10"
                                  : n.type === "comment"
                                  ? "bg-[var(--ad-green-light)] text-[var(--ad-green)] border border-[var(--ad-green)]/10"
                                  : "bg-[var(--ad-amber-light)] text-[var(--ad-amber)] border border-[var(--ad-amber)]/10"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[var(--ad-text-primary)]">{n.title}</p>
                              <p className="text-[11px] text-[var(--ad-text-secondary)] mt-0.5 line-clamp-1 leading-normal font-medium">{n.description}</p>
                              <p className="text-[9px] font-semibold text-[var(--ad-text-muted)] mt-1 font-mono">{n.time}</p>
                            </div>
                            {n.unread && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--ad-brand)] shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar dropdown (slim version with minimal text) */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="h-8.5 w-8.5 rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br from-[var(--ad-green)] to-[var(--ad-green-mid)] hover:shadow-md hover:scale-105 transition-all cursor-pointer border border-emerald-500/10 shrink-0"
                aria-label="User menu"
              >
                {initials(user?.name)}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 z-50 w-52 rounded-2xl border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-premium overflow-hidden animate-in fade-in duration-200">
                  <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-[var(--ad-border)] bg-[var(--ad-background)]/50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold bg-gradient-to-br from-[var(--ad-green)] to-[var(--ad-green-mid)]">
                      {initials(user?.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--ad-text-primary)] truncate">{user?.name || "Admin"}</p>
                      <p className="text-[9.5px] text-[var(--ad-text-muted)] truncate font-mono mt-0.5">{user?.role || "Super Admin"}</p>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/admin/user"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/40 hover:text-[var(--ad-text-primary)] transition-colors"
                    >
                      <SettingsIcon className="h-3.5 w-3.5 text-[var(--ad-text-secondary)]" />
                      Profile Settings
                    </Link>
                    <form action={logoutAdminAction}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--ad-brand)] hover:bg-[var(--ad-brand-light)] transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}
