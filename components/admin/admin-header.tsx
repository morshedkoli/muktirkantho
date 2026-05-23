"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Menu,
  LogOut,
  Settings as SettingsIcon,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { AdminThemeToggle } from "@/components/theme-toggle";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";
import { cn } from "@/lib/cn";

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

// Bangla breadcrumb label map
const pathLabelMap: Record<string, string> = {
  dashboard: "ড্যাশবোর্ড",
  posts: "পোস্টসমূহ",
  create: "নতুন পোস্ট",
  categories: "ক্যাটাগরি",
  tags: "ট্যাগ",
  media: "মিডিয়া",
  comments: "মন্তব্য",
  divisions: "বিভাগ",
  districts: "জেলা",
  upazilas: "উপজেলা",
  ads: "বিজ্ঞাপন",
  facebook: "ফেসবুক",
  social: "সোশ্যাল",
  queue: "সোশ্যাল কিউ",
  analytics: "অ্যানালিটিক্স",
  menus: "মেনু",
  branding: "ব্র্যান্ডিং",
  seo: "এসইও",
  settings: "সেটিংস",
  users: "ব্যবহারকারী",
  user: "প্রোফাইল",
  login: "লগইন",
};

function getBanglaLabel(segment: string): string {
  return pathLabelMap[segment.toLowerCase()] ?? segment;
}

function getBreadcrumb(pathname: string): { root: string; sub: string } {
  const seg = pathname.split("/").filter(Boolean);
  // seg[0] = "admin", seg[1] = section, seg[2] = subsection (optional)
  if (seg.length < 2) return { root: "অ্যাডমিন", sub: "ড্যাশবোর্ড" };

  // Special case: social/queue
  if (seg[1] === "social" && seg[2] === "queue") {
    return { root: "অ্যাডমিন", sub: "সোশ্যাল কিউ" };
  }

  // Special case: posts/create
  if (seg[1] === "posts" && seg[2] === "create") {
    return { root: "পোস্টসমূহ", sub: "নতুন পোস্ট" };
  }

  const sub = getBanglaLabel(seg[1]);
  return { root: "অ্যাডমিন", sub };
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
    title: "ব্রেকিং নিউজ",
    description: "নতুন ব্রেকিং স্টোরি প্রকাশিত হয়েছে",
    time: "২ মি",
    unread: true,
  },
  {
    id: "2",
    type: "social",
    title: "ফেসবুক শেয়ার",
    description: "সর্বশেষ পোস্ট ফেসবুকে শেয়ার করা হয়েছে",
    time: "১৫ মি",
    unread: true,
  },
  {
    id: "3",
    type: "comment",
    title: "নতুন মন্তব্য",
    description: "একটি মন্তব্য অনুমোদনের অপেক্ষায়",
    time: "১ ঘ",
    unread: false,
  },
  {
    id: "4",
    type: "system",
    title: "সাইটম্যাপ আপডেট",
    description: "XML সাইটম্যাপ পুনরায় তৈরি হয়েছে",
    time: "২ ঘ",
    unread: false,
  },
];

const notificationIcons: Record<string, React.ElementType> = {
  breaking: AlertCircle,
  social: ExternalLink,
  comment: MessageSquare,
  system: Bell,
};

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const crumb = getBreadcrumb(pathname);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [notifications] = useState<Notification[]>(sampleNotifications);
  const unreadCount = notifications.filter((n) => n.unread).length;

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
    <header className="sticky top-0 z-30 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm shrink-0">
      <div className="h-full flex items-center justify-between px-4 sm:px-6">

        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="মেনু খুলুন"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1.5 text-sm">
            <Link
              href="/admin/dashboard"
              className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors font-medium text-xs"
            >
              {crumb.root}
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700 text-xs">/</span>
            <span className="text-zinc-800 dark:text-zinc-100 font-bold text-xs">
              {crumb.sub}
            </span>
          </nav>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">

          {/* View Site */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-700 shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span>সাইট দেখুন</span>
          </a>

          {/* Theme toggle */}
          <div className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer">
            <AdminThemeToggle size="sm" />
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer relative"
              aria-label="বিজ্ঞপ্তি"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-in fade-in duration-200">
                <div className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
                  <h3 className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    বিজ্ঞপ্তি
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                      {unreadCount} নতুন
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                  {notifications.map((n) => {
                    const Icon = notificationIcons[n.type];
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                          n.unread ? "bg-red-50/30 dark:bg-red-950/10" : ""
                        )}
                      >
                        <div className="flex gap-3">
                          <div
                            className={cn(
                              "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                              n.type === "breaking"
                                ? "bg-red-100 dark:bg-red-950/40 text-red-500"
                                : n.type === "social"
                                ? "bg-blue-100 dark:bg-blue-950/40 text-blue-500"
                                : n.type === "comment"
                                ? "bg-green-100 dark:bg-green-950/40 text-green-500"
                                : "bg-amber-100 dark:bg-amber-950/40 text-amber-500"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">
                              {n.title}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 leading-normal">
                              {n.description}
                            </p>
                            <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-600 mt-1">
                              {n.time} আগে
                            </p>
                          </div>
                          {n.unread && (
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User avatar dropdown */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              aria-label="ইউজার মেনু"
            >
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br from-red-500 to-red-700 shrink-0">
                {initials(user?.name)}
              </div>
              <span className="hidden md:block text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate">
                {user?.name ?? "অ্যাডমিন"}
              </span>
              <ChevronDown className="hidden md:block h-3.5 w-3.5 text-zinc-400 shrink-0" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-in fade-in duration-200">
                <div className="px-4 py-3 flex items-center gap-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold bg-gradient-to-br from-red-500 to-red-700">
                    {initials(user?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 truncate">
                      {user?.name || "অ্যাডমিন"}
                    </p>
                    <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {user?.role || "Super Admin"}
                    </p>
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <Link
                    href="/admin/user"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <SettingsIcon className="h-3.5 w-3.5" />
                    প্রোফাইল সেটিংস
                  </Link>
                  <form action={logoutAdminAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      লগআউট
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
