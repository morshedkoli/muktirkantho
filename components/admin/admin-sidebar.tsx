"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
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
  Facebook
} from "lucide-react";
import { useState } from "react";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Divisions", href: "/admin/divisions", icon: Globe },
  { name: "Districts", href: "/admin/districts", icon: MapPin },
  { name: "Upazilas", href: "/admin/upazilas", icon: MapPinned },
  { name: "Ads", href: "/admin/ads", icon: Megaphone },
  { name: "Branding", href: "/admin/branding", icon: Palette },
  { name: "Facebook", href: "/admin/facebook", icon: Facebook },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

// Primary navigation items for mobile bottom bar (most used)
const mobileNavItems: Array<{
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isMenu?: boolean;
  isSpecial?: boolean;
}> = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "New", href: "/admin/posts/new", icon: FileText, isSpecial: true },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "More", href: "#", icon: Settings, isMenu: true },
];

// Additional items for mobile "More" menu
const mobileMoreItems = [
  { name: "Divisions", href: "/admin/divisions", icon: Globe },
  { name: "Districts", href: "/admin/districts", icon: MapPin },
  { name: "Upazilas", href: "/admin/upazilas", icon: MapPinned },
  { name: "Ads", href: "/admin/ads", icon: Megaphone },
  { name: "Branding", href: "/admin/branding", icon: Palette },
  { name: "Facebook", href: "/admin/facebook", icon: Facebook },
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
  onCollapsedChange 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = (value: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(value);
    } else {
      setInternalCollapsed(value);
    }
  };

  const handleMobileNavClick = (href: string, isMenu?: boolean) => {
    if (isMenu) {
      setMobileMoreOpen(!mobileMoreOpen);
      return;
    }
    setMobileMoreOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-[var(--ad-sidebar)] text-[var(--ad-text-primary)] transition-all duration-300 ease-in-out border-r border-[var(--ad-border)] ${collapsed ? "w-16" : "w-64"
          } hidden lg:block`}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--ad-border)] px-4">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ad-primary)]">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight text-[var(--ad-text-primary)]">Muktir Kantho</span>
                <span className="text-xs text-[var(--ad-text-secondary)]">Admin Panel</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-background)] hover:text-[var(--ad-text-primary)] transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                      ? "bg-[var(--ad-primary)] text-white shadow-[var(--ad-shadow-lg)]"
                      : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-background)] hover:text-[var(--ad-text-primary)]"
                      }`}
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-[var(--ad-text-secondary)] group-hover:text-[var(--ad-text-primary)]"}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--ad-border)] p-3">
          <Link
            href="/"
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-background)] hover:text-[var(--ad-text-primary)] transition-all ${collapsed ? "justify-center" : ""
              }`}
            title={collapsed ? "View Site" : undefined}
          >
            <Home className="h-5 w-5 shrink-0 text-[var(--ad-text-secondary)] group-hover:text-[var(--ad-text-primary)]" />
            {!collapsed && <span>View Site</span>}
          </Link>

          <form action={logoutAdminAction} className="mt-1">
            <button
              type="submit"
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-error)] hover:text-white transition-all ${collapsed ? "justify-center" : ""
                }`}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0 text-[var(--ad-text-secondary)] group-hover:text-white" />
              {!collapsed && <span>Logout</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-[var(--ad-sidebar)] text-[var(--ad-text-primary)] lg:hidden transform transition-transform duration-300 ease-in-out border-r border-[var(--ad-border)] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Mobile Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--ad-border)] px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ad-primary)]">
              <Newspaper className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-[var(--ad-text-primary)]">Muktir Kantho</span>
              <span className="text-xs text-[var(--ad-text-secondary)]">Admin Panel</span>
            </div>
          </Link>
          <button
            onClick={onMobileMenuClose}
            className="rounded-md p-2 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-background)] hover:text-[var(--ad-text-primary)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onMobileMenuClose}
                    className={`group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                      ? "bg-[var(--ad-primary)] text-white shadow-[var(--ad-shadow-lg)]"
                      : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-background)] hover:text-[var(--ad-text-primary)]"
                      }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-[var(--ad-text-secondary)] group-hover:text-[var(--ad-text-primary)]"}`} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Mobile Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--ad-border)] p-4">
          <Link
            href="/"
            onClick={onMobileMenuClose}
            className="group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-background)] hover:text-[var(--ad-text-primary)] transition-all"
          >
            <Home className="h-5 w-5 shrink-0 text-[var(--ad-text-secondary)] group-hover:text-[var(--ad-text-primary)]" />
            <span>View Site</span>
          </Link>

          <form action={logoutAdminAction} className="mt-1">
            <button
              type="submit"
              className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-error)] hover:text-white transition-all"
            >
              <LogOut className="h-5 w-5 shrink-0 text-[var(--ad-text-secondary)] group-hover:text-white" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--ad-sidebar)] text-[var(--ad-text-primary)] lg:hidden border-t border-[var(--ad-border)] safe-area-pb">
        <div className="flex items-center justify-around p-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleMobileNavClick(item.href, item.isMenu)}
                className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all min-w-[64px] ${isActive && !item.isMenu
                  ? "text-[var(--ad-primary)]"
                  : "text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
                  }`}
              >
                {item.isSpecial ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ad-primary)] text-white -mt-1">
                    <Icon className="h-4 w-4" />
                  </div>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile More Menu */}
        {mobileMoreOpen && (
          <div className="absolute bottom-full left-0 right-0 bg-[var(--ad-sidebar)] border-t border-[var(--ad-border)] p-4 shadow-[var(--ad-shadow-lg)]">
            <div className="grid grid-cols-4 gap-2">
              {mobileMoreItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMoreOpen(false)}
                    className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-all ${isActive
                      ? "text-[var(--ad-primary)] bg-[var(--ad-primary)]/10"
                      : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-background)] hover:text-[var(--ad-text-primary)]"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px]">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom padding spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
