"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { cn } from "@/lib/cn";

interface AdminShellLayoutProps {
  children: React.ReactNode;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
}

/**
 * AdminShellLayout — full page layout shell.
 * Renders sidebar (fixed left) + header (top of main) + content area.
 * Manages sidebar collapse state and mobile menu state.
 */
export function AdminShellLayout({
  children,
  logoUrl,
  logoDarkUrl,
}: AdminShellLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Restore sidebar expanded state from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_expanded");
      if (saved !== null) setSidebarExpanded(saved === "true");
    } catch {}
  }, []);

  const handleToggleExpand = () => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_expanded", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <AdminSidebar
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
        expanded={sidebarExpanded}
        onToggleExpand={handleToggleExpand}
        logoUrl={logoUrl}
        logoDarkUrl={logoDarkUrl}
      />

      {/* Main content area — offset by sidebar width */}
      <div
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300",
          sidebarExpanded ? "lg:ml-60" : "lg:ml-14"
        )}
      >
        <AdminHeader
          onMobileMenuToggle={() => setMobileMenuOpen((o) => !o)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7 pb-20 lg:pb-7 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdminShell — page-level content wrapper (title bar + actions + children)
// ---------------------------------------------------------------------------

interface AdminShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminShell({ title, children, actions }: AdminShellProps) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight">
            {title}
          </h1>
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">{actions}</div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}
