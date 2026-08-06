"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { useStoredValue } from "@/lib/use-stored-value";

const SIDEBAR_KEY = "admin_sidebar_expanded";

const parseExpanded = (raw: string): boolean => raw === "true";

/**
 * Labelled by default. An icon-only rail asks you to memorise sixteen
 * glyphs before you can navigate; the collapse toggle is still there for
 * people who have, and the choice persists.
 */
const SIDEBAR_DEFAULT_EXPANDED = true;

interface AdminShellLayoutProps {
  children: React.ReactNode;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
}

/**
 * Console chrome: the ink rail on the left, a sticky header, and a measured
 * content column. The content column is capped — an editor scanning a table of
 * headlines on a 27" monitor should not have to track a line across 2000px.
 */
export function AdminShellLayout({ children, logoUrl }: AdminShellLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useStoredValue(
    SIDEBAR_KEY,
    SIDEBAR_DEFAULT_EXPANDED,
    parseExpanded
  );

  const handleToggleExpand = () => setSidebarExpanded(!sidebarExpanded);

  return (
    <div className="min-h-screen bg-[var(--ad-background)] text-[var(--ad-text-primary)]">
      <AdminSidebar
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
        expanded={sidebarExpanded}
        onToggleExpand={handleToggleExpand}
        logoUrl={logoUrl}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-200 ease-out",
          sidebarExpanded ? "lg:ml-[228px]" : "lg:ml-14"
        )}
      >
        <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen((o) => !o)} />
        <main className="w-full flex-1 overflow-x-hidden px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * AdminShell — page content wrapper.
 *
 * Kept as the single entry point every page already imports; the header itself
 * now comes from the shared PageHeader so titles, kickers and action rows are
 * identical everywhere.
 * ------------------------------------------------------------------------- */

interface AdminShellProps {
  title: string;
  kicker?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function AdminShell({
  title,
  kicker,
  description,
  children,
  actions,
}: AdminShellProps) {
  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader
        kicker={kicker}
        title={title}
        description={description}
        actions={actions}
      />
      <div className="space-y-6">{children}</div>
    </div>
  );
}
