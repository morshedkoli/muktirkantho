"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/admin/toast-provider";
import { ConfirmProvider } from "@/components/admin/confirm-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { LangProvider } from "@/lib/admin-i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(null);

  // Sync sidebar expanded state from localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_expanded");
    if (saved !== null) setSidebarExpanded(saved === "true");
  }, []);

  // Fetch branding settings once on mount
  useEffect(() => {
    if (isLoginPage) return;
    fetch("/api/admin/branding", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { logoUrl?: string; logoDarkUrl?: string } | null) => {
        if (d) {
          setLogoUrl(d.logoUrl ?? null);
          setLogoDarkUrl(d.logoDarkUrl ?? null);
        }
      })
      .catch(() => {});
  }, [isLoginPage]);

  const handleToggleExpand = () => {
    setSidebarExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_expanded", String(next));
      return next;
    });
  };

  if (isLoginPage) {
    return (
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <ConfirmProvider>
      <LangProvider>
        <div className="min-h-screen bg-[var(--ad-background)]">
          <AdminSidebar
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuClose={() => setMobileMenuOpen(false)}
            expanded={sidebarExpanded}
            onToggleExpand={handleToggleExpand}
            logoUrl={logoUrl}
            logoDarkUrl={logoDarkUrl}
          />
          <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarExpanded ? "lg:ml-60" : "lg:ml-16"}`}>
            <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7 pb-20 lg:pb-7 w-full max-w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </LangProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
