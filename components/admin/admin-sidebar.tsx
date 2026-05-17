"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Image,
  Tags,
  MapPin,
  MapPinned,
  LogOut,
  Settings,
  Megaphone,
  X,
  Home,
  Palette,
  Facebook,
  MessageSquare,
  Hash,
  Search,
  Twitter,
  Linkedin,
  Instagram,
  Zap,
  TrendingUp,
  Lightbulb,
  Video,
  Images,
  Radio,
  Layout,
  Lock,
  BookOpen,
  FileText as FileTextIcon,
  ChevronRight,
  HelpCircle,
  Globe,
} from "lucide-react";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";
import { useEffect, useState } from "react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { name: "All Posts", href: "/admin/posts", icon: FileText },
      { name: "New Post", href: "/admin/posts/create", icon: Layout },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "Tags", href: "/admin/tags", icon: Hash },
      { name: "Media", href: "/admin/media", icon: Image },
      { name: "Comments", href: "/admin/comments", icon: MessageSquare },
      { name: "E-Paper", href: "/admin/e-paper", icon: BookOpen },
    ],
  },
  {
    label: "Modules",
    items: [
      { name: "Opinion", href: "/admin/opinion", icon: Lightbulb },
      { name: "Video", href: "/admin/video", icon: Video },
      { name: "Gallery", href: "/admin/gallery", icon: Images },
      { name: "Breaking", href: "/admin/breaking", icon: Radio },
      { name: "Homepage", href: "/admin/homepage", icon: Layout },
      { name: "Districts", href: "/admin/districts", icon: MapPin },
      { name: "Upazilas", href: "/admin/upazilas", icon: MapPinned },
    ],
  },
  {
    label: "Social",
    items: [
      { name: "X / Twitter", href: "/admin/social/twitter", icon: Twitter },
      { name: "Facebook", href: "/admin/facebook", icon: Facebook },
      { name: "Instagram", href: "/admin/social/instagram", icon: Instagram },
      { name: "LinkedIn", href: "/admin/social/linkedin", icon: Linkedin },
      { name: "Queue", href: "/admin/social/queue", icon: Zap },
      { name: "Templates", href: "/admin/social/templates", icon: FileTextIcon },
    ],
  },
  {
    label: "Analytics",
    items: [
      { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
      { name: "SEO", href: "/admin/seo", icon: Search },
      { name: "Ads", href: "/admin/ads", icon: Megaphone },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Branding", href: "/admin/branding", icon: Palette },
      { name: "Geo", href: "/admin/divisions", icon: Globe },
      { name: "Users", href: "/admin/users", icon: HelpCircle },
      { name: "Subscribers", href: "/admin/subscribers", icon: Lock },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const mobileNavItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Media", href: "/admin/media", icon: Image },
  { name: "Comments", href: "/admin/comments", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

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

interface AdminSidebarProps {
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AdminSidebar({
  mobileMenuOpen = false,
  onMobileMenuClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AdminUser | null) => data && setUser(data))
      .catch(() => {});
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const navTree = (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3 scrollbar-thin">
      {navSections.map((section) => (
        <div key={section.label}>
          <div className="px-3 pt-1 pb-1.5 text-[9.5px] font-semibold tracking-[0.1em] uppercase text-[var(--ad-text-muted)]">
            {section.label}
          </div>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onMobileMenuClose}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-all ${
                      active
                        ? "bg-[var(--ad-green)] text-white shadow-sm"
                        : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-sidebar-divider)]/60 hover:text-[var(--ad-text-primary)]"
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-white" : "opacity-80"}`} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                          active ? "bg-white/20 text-white" : "bg-[var(--ad-brand)] text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const userCard = (
    <div className="border-t border-[var(--ad-sidebar-divider)] p-3 shrink-0">
      <div className="flex items-center gap-2.5 rounded-lg bg-[var(--ad-card)] p-2.5 shadow-[var(--ad-shadow)]">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-white text-[13px] font-bold shrink-0 bg-gradient-to-br from-[var(--ad-green)] to-[var(--ad-green-mid)]">
          {initials(user?.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-[var(--ad-text-primary)] truncate">
            {user?.name || "Admin"}
          </div>
          <div className="text-[10.5px] text-[var(--ad-text-muted)] truncate">
            {user?.role || "Super Admin"}
          </div>
        </div>
        <Link
          href="/admin/user"
          aria-label="Profile"
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-md bg-[var(--ad-green)] text-white shrink-0 hover:bg-[var(--ad-green-hover)] transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <Link
        href="/"
        className="mt-2 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-sidebar-divider)]/60 hover:text-[var(--ad-text-primary)] transition-all"
      >
        <Home className="h-4 w-4" />
        View Site
      </Link>
      <form action={logoutAdminAction}>
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-brand-light)] hover:text-[var(--ad-brand)] transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </form>
    </div>
  );

  const logo = (
    <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-4 border-b border-[var(--ad-sidebar-divider)]">
      <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[var(--ad-brand)] text-white text-[16px] font-bold font-bangla shrink-0">
        ম
      </div>
      <div className="min-w-0">
        <div className="text-[13.5px] font-bold leading-tight text-[var(--ad-text-primary)] truncate">
          Muktir Kantho
        </div>
        <div className="text-[10px] font-mono tracking-[0.05em] text-[var(--ad-text-muted)] uppercase">
          Admin Panel
        </div>
      </div>
    </Link>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Desktop sidebar — fixed 220px mint-green */}
      <aside className="fixed inset-y-0 left-0 z-50 w-[220px] hidden lg:flex lg:flex-col border-r border-[var(--ad-sidebar-border)] bg-[var(--ad-sidebar)]">
        {logo}
        {navTree}
        {userCard}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col border-r border-[var(--ad-sidebar-border)] bg-[var(--ad-sidebar)] lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--ad-sidebar-divider)]">
          {logo}
          <button
            onClick={onMobileMenuClose}
            aria-label="Close menu"
            className="mr-2 rounded-md p-2 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-sidebar-divider)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navTree}
        {userCard}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--ad-card)] border-t border-[var(--ad-border)] lg:hidden safe-area-pb">
        <div className="grid grid-cols-5 gap-1 p-1.5">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-all ${
                  active
                    ? "text-[var(--ad-green)]"
                    : "text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
