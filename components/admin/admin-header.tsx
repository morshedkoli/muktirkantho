"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Bell, Menu, LogOut, Settings, ChevronDown, AlertCircle, X } from "lucide-react";
import { AdminThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";

type AdminUser = {
  name: string;
  email: string;
  role: string;
};

const ROLE_COLORS: Record<string, { bg: string; text: string; ring: string; badge: string }> = {
  admin: { bg: "bg-red-500", text: "text-white", ring: "ring-red-500/20", badge: "bg-red-500/10 text-red-600 dark:text-red-400" },
  editor: { bg: "bg-blue-500", text: "text-white", ring: "ring-blue-500/20", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  author: { bg: "bg-emerald-500", text: "text-white", ring: "ring-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  contributor: { bg: "bg-amber-500", text: "text-white", ring: "ring-amber-500/20", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
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
  {
    id: "1",
    type: "breaking",
    title: "Breaking News Alert",
    description: "New article flagged as breaking ready for review",
    time: "2m ago",
    unread: true,
  },
  {
    id: "2",
    type: "social",
    title: "Facebook Post Failed",
    description: "Scheduled post 'Budget Analysis 2026' failed to publish",
    time: "15m ago",
    unread: true,
  },
  {
    id: "3",
    type: "comment",
    title: "Comment Spike Detected",
    description: "45 new comments on 'Local Election Results'",
    time: "1h ago",
    unread: false,
  },
  {
    id: "4",
    type: "system",
    title: "Sitemap Updated",
    description: "XML sitemap regenerated successfully",
    time: "2h ago",
    unread: false,
  },
];

const notificationIcons: Record<string, React.ElementType> = {
  breaking: AlertCircle,
  social: X,
  comment: MessageSquare,
  system: Bell,
};

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [notifications] = useState<Notification[]>(sampleNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    let active = true;
    fetch("/api/admin/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AdminUser | null) => {
        if (active && data) setUser(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!notifRef.current?.contains(event.target as Node)) setNotifOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-[var(--ad-border)] bg-[var(--ad-background)] px-3 sm:px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 hover:bg-[var(--ad-paper-2)] rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-[var(--ad-text-secondary)]" />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <Link href="/admin/dashboard" className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors">
            Admin
          </Link>
          <span className="text-[var(--ad-text-secondary)]/40">/</span>
          <span className="font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-primary)]">
            Dashboard
          </span>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--ad-text-secondary)]" />
          <input
            type="text"
            placeholder="Search articles, categories..."
            className="w-48 lg:w-64 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] py-2 pl-9 pr-4 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-text-primary)] focus:ring-0 transition-colors placeholder:text-[var(--ad-text-secondary)] font-editorial-sans"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-1 rounded border border-[var(--ad-border)] bg-[var(--ad-paper-2)] px-1.5 py-0.5 font-editorial-mono text-[10px] text-[var(--ad-text-secondary)]">
            ⌘K
          </kbd>
        </div>

        {/* Theme Toggle */}
        <AdminThemeToggle variant="minimal" size="md" />

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 hover:bg-[var(--ad-paper-2)] rounded-lg transition-colors"
          >
            <Bell className="h-4 w-4 text-[var(--ad-text-secondary)]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--ad-breaking)] text-[9px] font-bold text-white font-editorial-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-lg shadow-black/5 overflow-hidden">
              <div className="border-b border-[var(--ad-border)] px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--ad-text-primary)]">Notifications</h3>
                <span className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)]">
                  {unreadCount} unread
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--ad-border)]">
                {notifications.map((n) => {
                  const Icon = notificationIcons[n.type];
                  return (
                    <div
                      key={n.id}
                      className={`px-4 py-3 transition-colors hover:bg-[var(--ad-paper)] ${
                        n.unread ? "bg-[var(--ad-paper)]" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            n.type === "breaking"
                              ? "bg-[var(--ad-error)]/10 text-[var(--ad-error)]"
                              : n.type === "social"
                              ? "bg-[var(--ad-primary)]/10 text-[var(--ad-primary)]"
                              : n.type === "comment"
                              ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)]"
                              : "bg-[var(--ad-warning)]/10 text-[var(--ad-warning)]"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--ad-text-primary)]">{n.title}</p>
                          <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5 line-clamp-1">{n.description}</p>
                          <p className="font-editorial-mono text-[10px] text-[var(--ad-text-secondary)] mt-1">{n.time}</p>
                        </div>
                        {n.unread && <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--ad-breaking)] shrink-0" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-[var(--ad-border)] px-4 py-2.5">
                <button className="w-full text-center text-xs font-medium text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)] transition-colors font-editorial-mono tracking-wider uppercase">
                  View All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div ref={menuRef} className="relative border-l border-[var(--ad-border)] pl-2 sm:pl-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-1.5 p-1.5 hover:bg-[var(--ad-paper-2)] rounded-lg transition-colors"
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${(() => {
              const c = ROLE_COLORS[user?.role?.toLowerCase() || ""] || ROLE_COLORS.admin;
              return `${c.bg} ${c.text}`;
            })()}`}>
              {getInitials(user?.name || "A")}
            </div>
            <span className="hidden sm:inline font-editorial-mono text-[10px] tracking-widest uppercase text-[var(--ad-text-secondary)]">
              {user?.role || "Admin"}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] shadow-lg shadow-black/5 overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--ad-border)]">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${(() => {
                  const c = ROLE_COLORS[user?.role?.toLowerCase() || ""] || ROLE_COLORS.admin;
                  return `${c.bg} ${c.text}`;
                })()}`}>
                  {getInitials(user?.name || "A")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--ad-text-primary)] truncate">{user?.name || "Admin"}</p>
                  <p className="text-xs text-[var(--ad-text-secondary)] truncate">{user?.email || ""}</p>
                </div>
              </div>
              <div className="p-1">
                <Link
                  href="/admin/user"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ad-text-primary)] hover:bg-[var(--ad-background)] transition-colors"
                >
                  <Settings className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                  Profile Settings
                </Link>
                <form action={logoutAdminAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--ad-error)] hover:bg-[var(--ad-error)]/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
