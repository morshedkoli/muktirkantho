"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tag,
  Image,
  MessageSquare,
  Map,
  MapPin,
  Building2,
  Megaphone,
  Share2,
  Clock,
  BarChart2,
  Menu,
  Palette,
  Search,
  Settings,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "কন্টেন্ট",
    items: [
      { name: "পোস্টসমূহ", href: "/admin/posts", icon: FileText },
      { name: "নতুন পোস্ট", href: "/admin/posts/create", icon: FileText },
      { name: "ক্যাটাগরি", href: "/admin/categories", icon: FolderOpen },
      { name: "ট্যাগ", href: "/admin/tags", icon: Tag },
      { name: "মিডিয়া", href: "/admin/media", icon: Image },
      { name: "মন্তব্য", href: "/admin/comments", icon: MessageSquare },
    ],
  },
  {
    label: "অবস্থান",
    items: [
      { name: "বিভাগ", href: "/admin/divisions", icon: Map },
      { name: "জেলা", href: "/admin/districts", icon: MapPin },
      { name: "উপজেলা", href: "/admin/upazilas", icon: Building2 },
    ],
  },
  {
    label: "মার্কেটিং",
    items: [
      { name: "বিজ্ঞাপন", href: "/admin/ads", icon: Megaphone },
      { name: "ফেসবুক", href: "/admin/facebook", icon: Share2 },
      { name: "সোশ্যাল কিউ", href: "/admin/social/queue", icon: Clock },
    ],
  },
  {
    label: "বিশ্লেষণ",
    items: [
      { name: "অ্যানালিটিক্স", href: "/admin/analytics", icon: BarChart2 },
      { name: "ড্যাশবোর্ড", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "সিস্টেম",
    items: [
      { name: "মেনু", href: "/admin/menus", icon: Menu },
      { name: "ব্র্যান্ডিং", href: "/admin/branding", icon: Palette },
      { name: "এসইও", href: "/admin/seo", icon: Search },
      { name: "সেটিংস", href: "/admin/settings", icon: Settings },
      { name: "ব্যবহারকারী", href: "/admin/users", icon: Users },
      { name: "প্রোফাইল", href: "/admin/user", icon: User },
    ],
  },
];

function isActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavItemLinkProps {
  item: NavItem;
  onClick?: () => void;
  showLabel?: boolean;
  pathname: string;
}

function NavItemLink({ item, onClick, showLabel = true, pathname }: NavItemLinkProps) {
  const active = isActive(item.href, pathname);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={!showLabel ? item.name : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
        active
          ? "bg-zinc-700 text-white border-l-2 border-red-500"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
        !showLabel && "justify-center px-0 w-10 h-10 rounded-lg"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-all duration-200",
          active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300",
          !showLabel && "h-[18px] w-[18px]"
        )}
      />
      {showLabel && <span className="truncate whitespace-nowrap">{item.name}</span>}
    </Link>
  );
}

const mobileNavItems: NavItem[] = [
  { name: "ড্যাশবোর্ড", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "পোস্ট", href: "/admin/posts", icon: FileText },
  { name: "মিডিয়া", href: "/admin/media", icon: Image },
  { name: "মন্তব্য", href: "/admin/comments", icon: MessageSquare },
  { name: "সেটিংস", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
}

export function AdminSidebar({
  mobileMenuOpen = false,
  onMobileMenuClose,
  expanded = false,
  onToggleExpand,
  logoUrl,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_collapsed_sections");
      if (saved) setCollapsedSections(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Auto-expand section containing active route
  useEffect(() => {
    setCollapsedSections((prev) => {
      for (const section of navSections) {
        if (
          section.items.some((item) => isActive(item.href, pathname)) &&
          prev.has(section.label)
        ) {
          const next = new Set(prev);
          next.delete(section.label);
          localStorage.setItem(
            "admin_collapsed_sections",
            JSON.stringify([...next])
          );
          return next;
        }
      }
      return prev;
    });
  }, [pathname]);

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      localStorage.setItem(
        "admin_collapsed_sections",
        JSON.stringify([...next])
      );
      return next;
    });
  };

  // Desktop nav tree
  const navTreeDesktop = (
    <nav
      className={cn(
        "flex-1 overflow-y-auto py-3 flex flex-col scrollbar-none",
        expanded ? "px-3 gap-0" : "px-2 gap-1 items-center"
      )}
    >
      {navSections.map((section, sIdx) => {
        const isCollapsed = collapsedSections.has(section.label);

        if (!expanded) {
          // Collapsed: icon-only with tooltip via title attribute
          return (
            <div key={section.label} className="flex flex-col items-center gap-1">
              {sIdx > 0 && (
                <div className="w-6 h-px bg-zinc-700 my-1 shrink-0" />
              )}
              {section.items.map((item) => (
                <NavItemLink key={item.href} item={item} showLabel={false} pathname={pathname} />
              ))}
            </div>
          );
        }

        // Expanded: collapsible sections
        return (
          <div key={section.label} className="w-full">
            {sIdx > 0 && <div className="h-px bg-zinc-800 mx-2 my-1" />}
            <button
              onClick={() => toggleSection(section.label)}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg group cursor-pointer hover:bg-zinc-800/60 transition-colors"
            >
              <span
                className={cn(
                  "text-[10px] font-bold tracking-[0.12em] uppercase whitespace-nowrap transition-colors",
                  section.items.some((item) => isActive(item.href, pathname))
                    ? "text-red-400"
                    : "text-zinc-500 group-hover:text-zinc-400"
                )}
              >
                {section.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-zinc-600 transition-transform duration-200",
                  isCollapsed ? "-rotate-90" : ""
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-200 ease-in-out",
                isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="flex flex-col gap-0.5 pb-1 pt-0.5">
                  {section.items.map((item) => (
                    <NavItemLink key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );

  // Mobile nav tree
  const navTreeMobile = (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
      {navSections.map((section) => {
        const isCollapsed = collapsedSections.has(section.label);
        const hasActive = section.items.some((item) => isActive(item.href, pathname));
        return (
          <div key={section.label}>
            <button
              onClick={() => toggleSection(section.label)}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded-md group cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <span
                className={cn(
                  "text-[10px] font-bold tracking-[0.12em] uppercase transition-colors",
                  hasActive
                    ? "text-red-400"
                    : "text-zinc-500 group-hover:text-zinc-400"
                )}
              >
                {section.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-zinc-600 transition-transform duration-200",
                  isCollapsed ? "-rotate-90" : ""
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-200 ease-in-out",
                isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
              )}
            >
              <div className="overflow-hidden">
                <ul className="space-y-0.5 pt-0.5 pb-2">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <NavItemLink
                        item={item}
                        onClick={onMobileMenuClose}
                        pathname={pathname}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );

  const brandIcon = (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-red-400 text-white text-[17px] font-bold shrink-0 shadow-sm">
      ম
    </div>
  );

  const logoDesktop = (
    <Link
      href="/admin/dashboard"
      className={cn(
        "flex h-16 items-center border-b border-zinc-800 shrink-0 transition-all duration-300 overflow-hidden",
        expanded ? "px-4 gap-3 justify-start" : "justify-center px-0"
      )}
    >
      {expanded ? (
        logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="মুক্তির কণ্ঠ"
            className="h-8 w-auto max-w-[160px] object-contain shrink-0"
          />
        ) : (
          <>
            {brandIcon}
            <div className="min-w-0 whitespace-nowrap">
              <div className="text-[13px] font-black tracking-tight text-zinc-100 truncate">
                মুক্তির কণ্ঠ
              </div>
              <div className="text-[9px] font-mono tracking-[0.08em] text-zinc-500 uppercase">
                Admin Console
              </div>
            </div>
          </>
        )
      ) : (
        brandIcon
      )}
    </Link>
  );

  const logoMobile = (
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-800"
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt="মুক্তির কণ্ঠ"
          className="h-8 w-auto max-w-[160px] object-contain shrink-0"
        />
      ) : (
        <>
          {brandIcon}
          <div className="min-w-0">
            <div className="text-[13px] font-black tracking-tight text-zinc-100 truncate">
              মুক্তির কণ্ঠ
            </div>
            <div className="text-[9px] font-mono tracking-[0.08em] text-zinc-500 uppercase">
              Admin Console
            </div>
          </div>
        </>
      )}
    </Link>
  );

  const collapseButton = (
    <div className="border-t border-zinc-800 py-3 flex flex-col shrink-0">
      <button
        onClick={onToggleExpand}
        className={cn(
          "group flex items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all cursor-pointer mx-2",
          expanded
            ? "h-9 px-3 gap-2.5 justify-start text-[13px] font-medium"
            : "h-9 w-9 mx-auto"
        )}
      >
        {expanded ? (
          <>
            <ChevronLeft className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="truncate whitespace-nowrap">সাইডবার বন্ধ</span>
          </>
        ) : (
          <ChevronRight className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        )}
      </button>
    </div>
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

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden lg:flex lg:flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-100 transition-all duration-300",
          expanded ? "w-60" : "w-14"
        )}
      >
        {logoDesktop}
        {navTreeDesktop}
        {collapseButton}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col border-r border-zinc-800 bg-zinc-900 text-zinc-100 lg:hidden transform transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 shrink-0">
          {logoMobile}
          <button
            onClick={onMobileMenuClose}
            aria-label="মেনু বন্ধ করুন"
            className="mr-3 rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {navTreeMobile}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800 lg:hidden">
        <div className="grid grid-cols-5 gap-1 p-1">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 transition-all",
                  active
                    ? "text-red-400 font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-medium truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
