"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { ToastProvider } from "@/components/admin/toast-provider";
import { ConfirmProvider } from "@/components/admin/confirm-provider";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="min-h-screen bg-[var(--ad-background)]">
          <AdminSidebar
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuClose={() => setMobileMenuOpen(false)}
          />

          {/* Main column — offset 220px on desktop for fixed sidebar */}
          <div className="lg:ml-[220px] flex flex-col min-h-screen">
            <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
            <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7 pb-20 lg:pb-7 w-full max-w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
