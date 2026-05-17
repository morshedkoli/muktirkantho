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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Login page doesn't get the sidebar layout
  if (isLoginPage) {
    return (
      <ToastProvider>
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
      </ToastProvider>
    );
  }

  // Protected pages get the full admin layout with sidebar
  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-[var(--ad-background)] overflow-x-hidden">
          <div className="flex">
            {/* Sidebar */}
            <AdminSidebar
              mobileMenuOpen={mobileMenuOpen}
              onMobileMenuClose={() => setMobileMenuOpen(false)}
              collapsed={sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
            />

            {/* Main content area - margin adjusts based on sidebar state */}
            <div className={`flex-1 min-w-0 w-full max-w-full transition-all duration-300 ease-in-out pb-16 lg:pb-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
              <AdminHeader
                onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              />
              <main className="w-full max-w-full overflow-x-hidden p-4 sm:p-5 lg:p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
