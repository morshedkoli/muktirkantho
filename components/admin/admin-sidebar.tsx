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
  Globe,
  Settings,
  Megaphone,
  X,
  Palette,
  Facebook,
  MessageSquare,
  Search,
  Zap,
  TrendingUp,
  Layout,
  Navigation,
  Users,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
      { name: "Menus", href: "/admin/menus", icon: Navigation },
      { name: "Media", href: "/admin/media", icon: Image },
      { name: "Comments", href: "/admin/comments", icon: MessageSquare },
    ],
  },
  {
    label: "Locations",
    items: [
      { name: "Divisions", href: "/admin/divisions", icon: Globe },
      { name: "Districts", href: "/admin/districts", icon: MapPin },
      { name: "Upazilas", href: "/admin/upazilas", icon: MapPinned },
    ],
  },
  {
    label: "Social",
    items: [
      { name: "Facebook", href: "/admin/facebook", icon: Facebook },
      { name: "Queue", href: "/admin/social/queue", icon: Zap },
    ],
  },
  {
    label: "Analytics",
    items: [
      { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
      { name: "Ads", href: "/admin/ads", icon: Megaphone },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Branding", href: "/admin/branding", icon: Palette },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const mobileNavItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Posts",     href: "/admin/posts",     icon: FileText },
  { name: "Media",     href: "/admin/media",     icon: Image },
  { name: "Comments",  href: "/admin/comments",  icon: MessageSquare },
  { name: "Settings",  href: "/admin/settings",  icon: Settings },
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
  logoDarkUrl,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_collapsed_sections");
      if (saved) setCollapsedSections(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  // Auto-expand the section that contains the current active route
  useEffect(() => {
    setCollapsedSections((prev) => {
      for (const section of navSections) {
        if (section.items.some((item) => isActive(item.href)) && prev.has(section.label)) {
          const next = new Set(prev);
          next.delete(section.label);
          localStorage.setItem("admin_collapsed_sections", JSON.stringify([...next]));
          return next;
        }
      }
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      localStorage.setItem("admin_collapsed_sections", JSON.stringify([...next]));
      return next;
    });
  };

  // Mobile drawer full navigation tree (with names, collapsible sections)
  const navTreeMobile = (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
      {navSections.map((section) => {
        const isCollapsed = collapsedSections.has(section.label);
        const hasActive = section.items.some((item) => isActive(item.href));
        return (
          <div key={section.label}>
            <button
              onClick={() => toggleSection(section.label)}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded-md group cursor-pointer hover:bg-[var(--ad-border)]/40 transition-colors"
            >
              <span className={`text-[10px] font-bold tracking-[0.12em] uppercase transition-colors ${hasActive ? "text-[var(--ad-green)]" : "text-[var(--ad-text-muted)] opacity-60 group-hover:opacity-100"}`}>
                {section.label}
              </span>
              <ChevronDown className={`h-3 w-3 text-[var(--ad-text-muted)] opacity-50 group-hover:opacity-80 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
            </button>
            <div className={`grid transition-all duration-200 ease-in-out ${isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
              <div className="overflow-hidden">
                <ul className="space-y-0.5 pt-0.5 pb-2">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={onMobileMenuClose}
                          className={`group flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all duration-200 relative ${
                            active
                              ? "bg-[var(--ad-green-light)] text-[var(--ad-green)] rounded-md font-semibold"
                              : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/60 hover:text-[var(--ad-text-primary)] rounded-md"
                          }`}
                        >
                          {active && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[var(--ad-green)] rounded-full" />
                          )}
                          <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${active ? "text-[var(--ad-green)]" : "opacity-70 group-hover:opacity-100"}`} />
                          <span className="flex-1 truncate">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );

  // Desktop slim navigation tree (icons + tooltips only, or full list with collapsible sections when expanded)
  const navTreeDesktop = (
    <TooltipProvider>
      <nav className={`flex-1 overflow-y-auto py-4 scrollbar-none flex flex-col transition-all duration-300 ${expanded ? "px-3 gap-0.5" : "px-2 gap-1 items-center"}`}>
        {navSections.map((section, sIdx) => {
          const isCollapsed = collapsedSections.has(section.label);
          const hasActive = section.items.some((item) => isActive(item.href));

          if (!expanded) {
            // Collapsed icon-only mode: show all icons, no section collapsing
            return (
              <div key={section.label} className="flex flex-col items-center gap-1">
                {sIdx > 0 && <div className="w-6 h-px bg-[var(--ad-border)]/50 my-0.5 shrink-0" />}
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Tooltip key={item.name} delayDuration={50}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={`group flex h-9 w-9 items-center justify-center transition-all duration-200 relative rounded-xl shrink-0 ${
                            active
                              ? "bg-[var(--ad-green-light)] text-[var(--ad-green)] shadow-sm"
                              : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/50 hover:text-[var(--ad-text-primary)]"
                          }`}
                        >
                          {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--ad-green)] rounded-full" />}
                          <Icon className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 group-hover:scale-105 ${active ? "text-[var(--ad-green)]" : "opacity-70 group-hover:opacity-100"}`} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-semibold text-xs py-1 px-2.5 shadow-premium">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            );
          }

          // Expanded mode: collapsible sections
          return (
            <div key={section.label} className="w-full">
              {sIdx > 0 && <div className="h-px bg-[var(--ad-border)]/40 mx-2 my-1" />}
              <button
                onClick={() => toggleSection(section.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg group cursor-pointer hover:bg-[var(--ad-border)]/30 transition-colors"
              >
                <span className={`text-[10px] font-bold tracking-[0.12em] uppercase whitespace-nowrap transition-colors ${hasActive ? "text-[var(--ad-green)]" : "text-[var(--ad-text-muted)] opacity-60 group-hover:opacity-100"}`}>
                  {section.label}
                </span>
                <ChevronDown className={`h-3 w-3 text-[var(--ad-text-muted)] opacity-0 group-hover:opacity-60 transition-all duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              <div className={`grid transition-all duration-200 ease-in-out ${isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-0.5 pb-1">
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-all duration-200 relative rounded-xl ${
                            active
                              ? "bg-[var(--ad-green-light)] text-[var(--ad-green)] font-semibold shadow-sm"
                              : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/50 hover:text-[var(--ad-text-primary)]"
                          }`}
                        >
                          {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-[var(--ad-green)] rounded-full" />}
                          <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 group-hover:scale-105 ${active ? "text-[var(--ad-green)]" : "opacity-70 group-hover:opacity-100"}`} />
                          <span className="truncate whitespace-nowrap">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </TooltipProvider>
  );

  // Desktop user controls
  const userCardDesktop = (
    <div className={`border-t border-[var(--ad-border)] py-4 flex flex-col shrink-0 bg-[var(--ad-sidebar)] transition-all duration-300 ${expanded ? "px-4 items-stretch gap-3" : "items-center gap-3.5"}`}>
      <button
        onClick={onToggleExpand}
        className={`group flex items-center justify-center rounded-xl text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/50 hover:text-[var(--ad-text-primary)] transition-all cursor-pointer ${expanded ? "h-9 px-3 gap-2.5 justify-start text-[13px] font-medium w-full" : "h-9 w-9"}`}
      >
        {expanded ? (
          <>
            <ChevronLeft className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="truncate whitespace-nowrap">Collapse Menu</span>
          </>
        ) : (
          <ChevronRight className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        )}
      </button>
    </div>
  );

  const brandIcon = (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--ad-brand)] to-[#ff6b8b] text-white text-[17px] font-bold font-bangla shrink-0 shadow-sm active:scale-95 transition-transform duration-200">
      ম
    </div>
  );

  const logoDesktop = (
    <Link href="/admin/dashboard" className={`flex h-16 items-center border-b border-[var(--ad-border)] shrink-0 transition-all duration-300 overflow-hidden ${expanded ? "px-4 gap-3 justify-start" : "justify-center px-0"}`}>
      {expanded ? (
        logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt="Muktir Kantho"
            className="h-8 w-auto max-w-[160px] object-contain shrink-0"
          />
        ) : (
          <>
            {brandIcon}
            <div className="min-w-0 transition-opacity duration-300 whitespace-nowrap">
              <div className="text-[13px] font-black tracking-tight text-[var(--ad-text-primary)] truncate">
                Muktir Kantho
              </div>
              <div className="text-[9px] font-mono tracking-[0.08em] text-[var(--ad-text-muted)] uppercase opacity-85">
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
    <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--ad-border)]">
      {logoUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logoUrl}
          alt="Muktir Kantho"
          className="h-8 w-auto max-w-[160px] object-contain shrink-0"
        />
      ) : (
        <>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[var(--ad-brand)] to-[#ff6b8b] text-white text-[15px] font-bold font-bangla shrink-0 shadow-sm">
            ম
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-black tracking-tight text-[var(--ad-text-primary)] truncate">
              Muktir Kantho
            </div>
            <div className="text-[9px] font-mono tracking-[0.08em] text-[var(--ad-text-muted)] uppercase opacity-85">
              Admin Console
            </div>
          </div>
        </>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Desktop sidebar — dynamic collapsed/expanded premium design */}
      <aside className={`fixed inset-y-0 left-0 z-50 hidden lg:flex lg:flex-col border-r border-[var(--ad-border)] bg-[var(--ad-sidebar)] transition-all duration-300 ${expanded ? "w-60" : "w-16"}`}>
        {logoDesktop}
        {navTreeDesktop}
        {userCardDesktop}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] flex flex-col border-r border-[var(--ad-border)] bg-[var(--ad-sidebar)] lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--ad-border)] shrink-0">
          {logoMobile}
          <button
            onClick={onMobileMenuClose}
            aria-label="Close menu"
            className="mr-3 rounded-md p-1.5 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-border)]/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {navTreeMobile}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--ad-card)] border-t border-[var(--ad-border)] lg:hidden safe-area-pb">
        <div className="grid grid-cols-5 gap-1 p-1">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1 transition-all ${
                  active
                    ? "text-[var(--ad-green)] font-semibold"
                    : "text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="text-[9px] font-medium truncate">{item.name}</span>
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
