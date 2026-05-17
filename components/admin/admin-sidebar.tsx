"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Image,
  Tags,
  Globe,
  MapPin,
  MapPinned,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Newspaper,
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
  ChevronDown,
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
} from "lucide-react";
import { useState, useCallback } from "react";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";

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
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Posts", href: "/admin/posts", icon: FileText },
      { name: "Media Library", href: "/admin/media", icon: Image },
      { name: "Categories", href: "/admin/categories", icon: Tags },
      { name: "Tags", href: "/admin/tags", icon: Hash },
      { name: "Comments", href: "/admin/comments", icon: MessageSquare, badge: 12 },
      { name: "E-Paper", href: "/admin/e-paper", icon: BookOpen },
    ],
  },
  {
    label: "Modules",
    items: [
      { name: "Opinion / Columns", href: "/admin/opinion", icon: Lightbulb },
      { name: "Video", href: "/admin/video", icon: Video },
      { name: "Photo Gallery", href: "/admin/gallery", icon: Images },
      { name: "Breaking News", href: "/admin/breaking", icon: Radio },
      { name: "Homepage Editor", href: "/admin/homepage", icon: Layout },
    ],
  },
  {
    label: "Social",
    items: [
      { name: "X / Twitter", href: "/admin/social/twitter", icon: Twitter },
      { name: "Facebook", href: "/admin/facebook", icon: Facebook },
      { name: "Instagram", href: "/admin/social/instagram", icon: Instagram },
      { name: "LinkedIn", href: "/admin/social/linkedin", icon: Linkedin },
      { name: "Social Queue", href: "/admin/social/queue", icon: Zap },
      { name: "Social Templates", href: "/admin/social/templates", icon: FileTextIcon },
    ],
  },
  {
    label: "Analytics",
    items: [
      { name: "Analytics Hub", href: "/admin/analytics", icon: TrendingUp },
      { name: "SEO Manager", href: "/admin/seo", icon: Search },
      { name: "Ads", href: "/admin/ads", icon: Megaphone },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Branding", href: "/admin/branding", icon: Palette },
      { name: "Geo", href: "/admin/divisions", icon: Globe },
      { name: "Districts", href: "/admin/districts", icon: MapPin },
      { name: "Upazilas", href: "/admin/upazilas", icon: MapPinned },
      { name: "Settings", href: "/admin/settings", icon: Settings },
      { name: "Users", href: "/admin/users", icon: LogOut },
      { name: "Subscriber Wall", href: "/admin/subscribers", icon: Lock },
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

interface AdminSidebarProps {
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AdminSidebar({
  mobileMenuOpen = false,
  onMobileMenuClose,
  collapsed: externalCollapsed,
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const active: Record<string, boolean> = {};
    for (const section of navSections) {
      for (const item of section.items) {
        if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
          active[section.label] = true;
        }
      }
    }
    return active;
  });

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = useCallback(
    (value: boolean) => {
      if (onCollapsedChange) {
        onCollapsedChange(value);
      } else {
        setInternalCollapsed(value);
      }
    },
    [onCollapsedChange]
  );

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-[var(--ad-sidebar)] text-[var(--ad-text-primary)] transition-all duration-300 ease-in-out border-r border-[var(--ad-border)] ${
          collapsed ? "w-16" : "w-64"
        } hidden lg:flex lg:flex-col`}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center border-b border-[var(--ad-border)] px-4 shrink-0">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ad-primary)]">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight font-editorial-display text-[var(--ad-text-primary)]">
                  Muktir Kantho
                </span>
                <span className="text-[10px] font-editorial-mono text-[var(--ad-text-secondary)] tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto rounded-md p-1.5 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-paper-2)] hover:text-[var(--ad-text-primary)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation — scrollable */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
          {navSections.map((section) => {
            const isExpanded = expandedSections[section.label] ?? section.items.some((i) => isActive(i.href));
            const hasActive = section.items.some((i) => isActive(i.href));

            return (
              <div key={section.label}>
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(section.label)}
                    className="flex w-full items-center justify-between px-2 mb-2 group"
                  >
                    <span className={`text-[10px] font-editorial-mono tracking-widest uppercase ${
                      hasActive ? "text-[var(--ad-text-primary)]" : "text-[var(--ad-text-secondary)]"
                    }`}>
                      {section.label}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 text-[var(--ad-text-secondary)] transition-transform ${
                        isExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                )}
                {collapsed && (
                  <div className="flex justify-center mb-3">
                    <div className="h-px w-6 bg-[var(--ad-border)]" />
                  </div>
                )}
                {(isExpanded || collapsed) && (
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;

                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                              collapsed ? "justify-center" : ""
                            } ${
                              active
                                ? "bg-[var(--ad-primary)] text-white shadow-lg shadow-red-900/30"
                                : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-paper)] hover:text-[var(--ad-text-primary)]"
                            }`}
                            title={collapsed ? item.name : undefined}
                          >
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                active ? "text-white" : "text-[var(--ad-text-secondary)] group-hover:text-[var(--ad-text-primary)]"
                              }`}
                            />
                            {!collapsed && (
                              <>
                                <span className="flex-1 truncate">{item.name}</span>
                                {item.badge && (
                                  <span className="font-editorial-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--ad-paper-2)] text-[var(--ad-text-secondary)]">
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[var(--ad-border)] p-3 shrink-0">
          <Link
            href="/"
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-paper)] hover:text-[var(--ad-text-primary)] transition-all ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "View Site" : undefined}
          >
            <Home className="h-4 w-4 shrink-0 text-[var(--ad-text-secondary)] group-hover:text-[var(--ad-text-primary)]" />
            {!collapsed && <span>View Site</span>}
          </Link>
          <form action={logoutAdminAction} className="mt-1">
            <button
              type="submit"
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ad-text-secondary)] hover:bg-red-50 hover:text-[var(--ad-error)] transition-all ${
                collapsed ? "justify-center" : ""
              }`}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0 text-[var(--ad-text-secondary)] group-hover:text-[var(--ad-error)]" />
              {!collapsed && <span>Logout</span>}
            </button>
          </form>
          {/* Expand toggle when collapsed */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="mt-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-paper)] hover:text-[var(--ad-text-primary)] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-[var(--ad-sidebar)] text-[var(--ad-text-primary)] lg:hidden transform transition-transform duration-300 ease-in-out border-r border-[var(--ad-border)] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--ad-border)] px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--ad-primary)]">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight font-editorial-display text-[var(--ad-text-primary)]">Muktir Kantho</span>
              <span className="text-[10px] font-editorial-mono text-[var(--ad-text-secondary)] tracking-wider uppercase">Admin Panel</span>
            </div>
          </Link>
          <button
            onClick={onMobileMenuClose}
            className="rounded-md p-2 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-paper-2)] hover:text-[var(--ad-text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Nav */}
        <nav className="overflow-y-auto h-[calc(100vh-4rem)] py-4 px-3 space-y-4">
          {navSections.map((section) => {
            const isExpanded = expandedSections[section.label] ?? section.items.some((i) => isActive(i.href));
            return (
              <div key={section.label}>
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex w-full items-center justify-between px-2 mb-2"
                >
                  <span className="text-[10px] font-editorial-mono tracking-widest uppercase text-[var(--ad-text-secondary)]">
                    {section.label}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-[var(--ad-text-secondary)] transition-transform ${
                      isExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
                {isExpanded && (
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={onMobileMenuClose}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                              active
                                ? "bg-[var(--ad-primary)] text-white"
                                : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-paper)] hover:text-[var(--ad-text-primary)]"
                            }`}
                          >
                            <Icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-[var(--ad-text-secondary)]"}`} />
                            <span className="flex-1 truncate">{item.name}</span>
                            {item.badge && (
                              <span className="font-editorial-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--ad-paper-2)] text-[var(--ad-text-secondary)]">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--ad-card)] text-[var(--ad-text-primary)] lg:hidden border-t border-[var(--ad-border)] safe-area-pb">
        <div className="grid grid-cols-5 gap-1 p-2">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-xs font-medium transition-all ${
                  active ? "text-[var(--ad-primary)]" : "text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom padding spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
