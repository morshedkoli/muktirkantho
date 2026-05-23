"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/admin/toast-provider";
import { ConfirmProvider } from "@/components/admin/confirm-provider";
import { AdminShellLayout } from "@/components/admin/admin-shell";
import { LangProvider } from "@/lib/admin-i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(null);

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
          <AdminShellLayout logoUrl={logoUrl} logoDarkUrl={logoDarkUrl}>
            {children}
          </AdminShellLayout>
        </LangProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
