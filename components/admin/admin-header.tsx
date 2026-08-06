"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Menu,
  LogOut,
  UserCog,
  MessageSquare,
  FileText,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  PenSquare,
} from "lucide-react";
import { AdminThemeToggle } from "@/components/theme-toggle";
import { logoutAdminAction } from "@/app/(admin)/admin/actions";
import type { InboxItem } from "@/app/api/admin/inbox/route";
import { cn } from "@/lib/cn";

type AdminUser = { name: string; email: string; role: string };

function initials(name?: string): string {
  if (!name) return "ম";
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ── Breadcrumb ──────────────────────────────────────────────────────────── */

const segmentLabels: Record<string, string> = {
  dashboard: "ড্যাশবোর্ড",
  posts: "পোস্টসমূহ",
  create: "নতুন পোস্ট",
  edit: "সম্পাদনা",
  categories: "ক্যাটাগরি",
  tags: "ট্যাগ",
  media: "মিডিয়া",
  comments: "মন্তব্য",
  divisions: "বিভাগ",
  districts: "জেলা",
  upazilas: "উপজেলা",
  ads: "বিজ্ঞাপন",
  facebook: "ফেসবুক",
  social: "সোশ্যাল",
  queue: "কিউ",
  analytics: "অ্যানালিটিক্স",
  menus: "মেনু",
  branding: "ব্র্যান্ডিং",
  seo: "এসইও",
  settings: "সেটিংস",
  users: "ব্যবহারকারী",
  user: "প্রোফাইল",
  login: "লগইন",
};

type Crumb = { label: string; href?: string };

/** Builds a real trail from the path rather than a fixed two-level guess. */
function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop "admin"
  if (segments.length === 0) return [{ label: "ড্যাশবোর্ড" }];

  const crumbs: Crumb[] = [];
  let href = "/admin";

  for (const [index, segment] of segments.entries()) {
    href += `/${segment}`;
    const label = segmentLabels[segment];
    // Ids (post edit routes) get folded into their parent rather than shown raw.
    if (!label) continue;
    const isLast = index === segments.length - 1;
    crumbs.push({ label, href: isLast ? undefined : href });
  }

  return crumbs.length > 0 ? crumbs : [{ label: "ড্যাশবোর্ড" }];
}

/* ── Inbox bell ──────────────────────────────────────────────────────────── */

const inboxMeta: Record<
  InboxItem["kind"],
  { label: string; icon: React.ElementType; tone: string }
> = {
  comments: {
    label: "মন্তব্য অনুমোদনের অপেক্ষায়",
    icon: MessageSquare,
    tone: "text-[var(--ad-warning)]",
  },
  spam: {
    label: "স্প্যাম হিসেবে চিহ্নিত",
    icon: ShieldAlert,
    tone: "text-[var(--ad-error)]",
  },
  drafts: {
    label: "খসড়া প্রকাশের অপেক্ষায়",
    icon: FileText,
    tone: "text-[var(--ad-info)]",
  },
};

function InboxBell() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Refetch on navigation so acting on a queue updates the badge.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/inbox", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items?: InboxItem[] }) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={total > 0 ? `${total}টি কাজ বাকি` : "কাজের তালিকা"}
        aria-expanded={open}
        className="relative flex h-8 w-8 items-center justify-center rounded-[var(--ad-radius-sm)] text-[var(--ad-text-muted)] transition-colors hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)]"
      >
        <Bell className="h-[17px] w-[17px]" />
        {total > 0 && (
          <span className="absolute right-1 top-1 h-[6px] w-[6px] rounded-full bg-[var(--ad-accent)] ring-2 ring-[var(--ad-card)]" />
        )}
      </button>

      {open && (
        <div className="adm-pop animate-pop-in absolute right-0 top-10 z-50 w-72 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-4 py-2.5">
            <p className="adm-label">কাজের তালিকা</p>
            {total > 0 && (
              <span className="adm-mono text-[10px] font-semibold text-[var(--ad-accent)]">
                {total}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-[12px] text-[var(--ad-text-muted)]">
              সব কাজ শেষ। কিছু বাকি নেই।
            </p>
          ) : (
            <ul className="divide-y divide-[var(--ad-border)]">
              {items.map((item) => {
                const meta = inboxMeta[item.kind];
                const Icon = meta.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--ad-card-alt)]"
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", meta.tone)} />
                      <span className="min-w-0 flex-1 text-[12.5px] text-[var(--ad-text-secondary)]">
                        {meta.label}
                      </span>
                      <span className="adm-mono text-[13px] font-semibold text-[var(--ad-text-primary)]">
                        {item.count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Account menu ────────────────────────────────────────────────────────── */

function AccountMenu({ user }: { user: AdminUser | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="অ্যাকাউন্ট মেনু"
        aria-expanded={open}
        className="flex h-8 items-center gap-2 rounded-[var(--ad-radius-sm)] pl-1 pr-2 transition-colors hover:bg-[var(--ad-inset)]"
      >
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--ad-primary)] text-[10px] font-bold text-[var(--ad-on-primary)]">
          {initials(user?.name)}
        </span>
        <span className="hidden max-w-[110px] truncate text-[12.5px] font-medium text-[var(--ad-text-primary)] md:block">
          {user?.name ?? "অ্যাডমিন"}
        </span>
      </button>

      {open && (
        <div className="adm-pop animate-pop-in absolute right-0 top-10 z-50 w-56 overflow-hidden">
          <div className="border-b border-[var(--ad-border)] bg-[var(--ad-card-alt)] px-4 py-3">
            <p className="truncate text-[13px] font-semibold text-[var(--ad-text-primary)]">
              {user?.name || "অ্যাডমিন"}
            </p>
            <p className="adm-mono mt-0.5 truncate text-[10.5px] text-[var(--ad-text-muted)]">
              {user?.email || "—"}
            </p>
          </div>
          <div className="p-1.5">
            <Link
              href="/admin/user"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-[var(--ad-radius-sm)] px-3 py-2 text-[12.5px] font-medium text-[var(--ad-text-secondary)] transition-colors hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)]"
            >
              <UserCog className="h-4 w-4" />
              প্রোফাইল সেটিংস
            </Link>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-[var(--ad-radius-sm)] px-3 py-2 text-[12.5px] font-semibold text-[var(--ad-error)] transition-colors hover:bg-[var(--ad-error-tint)]"
              >
                <LogOut className="h-4 w-4" />
                লগআউট
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Header ──────────────────────────────────────────────────────────────── */

interface AdminHeaderProps {
  onMobileMenuToggle?: () => void;
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetch("/api/admin/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AdminUser | null) => data && setUser(data))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 h-14 shrink-0 border-b border-[var(--ad-border)] bg-[var(--ad-card)]">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left — menu + trail */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="মেনু খুলুন"
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-[var(--ad-radius-sm)] text-[var(--ad-text-secondary)] transition-colors hover:bg-[var(--ad-inset)] lg:hidden"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          <nav aria-label="ব্রেডক্রাম্ব" className="flex min-w-0 items-center gap-1.5">
            <Link
              href="/admin/dashboard"
              className="adm-label shrink-0 transition-colors hover:text-[var(--ad-text-primary)]"
            >
              অ্যাডমিন
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb.label} className="flex min-w-0 items-center gap-1.5">
                <ChevronRight className="h-3 w-3 shrink-0 text-[var(--ad-border-strong)]" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="adm-label truncate transition-colors hover:text-[var(--ad-text-primary)]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate text-[12.5px] font-semibold text-[var(--ad-text-primary)]">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Right — actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/admin/posts/create"
            className="hidden h-8 items-center gap-1.5 rounded-[var(--ad-radius-sm)] bg-[var(--ad-primary)] px-3 text-[12px] font-semibold text-[var(--ad-on-primary)] transition-colors hover:bg-[var(--ad-primary-hover)] sm:flex"
          >
            <PenSquare className="h-3.5 w-3.5" />
            নতুন পোস্ট
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-8 items-center gap-1.5 rounded-[var(--ad-radius-sm)] px-2.5 text-[12px] font-medium text-[var(--ad-text-secondary)] transition-colors hover:bg-[var(--ad-inset)] hover:text-[var(--ad-text-primary)] sm:flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            সাইট দেখুন
          </a>

          <span className="mx-1 hidden h-5 w-px bg-[var(--ad-border)] sm:block" />

          <AdminThemeToggle size="sm" />
          <InboxBell />
          <AccountMenu user={user} />
        </div>
      </div>
    </header>
  );
}
