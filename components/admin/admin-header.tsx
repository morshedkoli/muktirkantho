"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Bell, User, Menu } from "lucide-react";
import { AdminThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";

type AdminUser = {
  name: string;
  email: string;
  role: string;
};

interface AdminHeaderProps {
  onMobileMenuToggle?: () => void;
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/admin/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: AdminUser | null) => {
        if (active && data) setUser(data);
      })
      .catch(() => {
        // Ignore header profile fetch errors.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--ad-border)] bg-[var(--ad-card)] px-6 shadow-[var(--ad-shadow)]">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 hover:bg-[var(--ad-background)] rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-[var(--ad-text-secondary)]" />
        </button>
        
        {/* Breadcrumb - could be dynamic */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-[var(--ad-text-secondary)]">
          <span className="text-[var(--ad-text-primary)] font-medium">Admin</span>
          <span>/</span>
          <span>Dashboard</span>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2">
          <Search className="h-4 w-4 text-[var(--ad-text-secondary)]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none placeholder:text-[var(--ad-text-secondary)] w-32 lg:w-48 text-[var(--ad-text-primary)]"
          />
        </div>

        {/* Theme Toggle */}
        <AdminThemeToggle variant="minimal" size="md" />

        {/* Notifications */}
        <button className="relative p-2 hover:bg-[var(--ad-background)] rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-[var(--ad-text-secondary)]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--ad-primary)]" />
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative border-l border-[var(--ad-border)] pl-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-[var(--ad-background)]"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-[var(--ad-text-primary)]">{user?.name || "Admin"}</p>
              <p className="text-xs text-[var(--ad-text-secondary)]">{user?.email || "admin"}</p>
              <p className="text-xs text-[var(--ad-text-secondary)] capitalize">{user?.role || "Administrator"}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ad-background)]">
              <User className="h-5 w-5 text-[var(--ad-text-secondary)]" />
            </div>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-12 z-50 w-44 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] p-1 shadow-[var(--ad-shadow-lg)]">
              <Link
                href="/admin/user"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-[var(--ad-text-primary)] hover:bg-[var(--ad-background)]"
              >
                Profile
              </Link>
              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-[var(--ad-error)] hover:bg-[var(--ad-background)]"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
