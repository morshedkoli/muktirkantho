"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  FolderOpen,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Map,
  Megaphone,
  Share2,
  Clock,
  BarChart2,
  Menu as MenuIcon,
  Palette,
  Search,
  Settings,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Exact match only — for routes that are a prefix of their own children. */
  exact?: boolean;
  /**
   * Extra route prefixes that should light this entry. Used where one rail item
   * is the doorway to a small cluster of sibling pages that link to each other.
   */
  alsoMatches?: string[];
};

type NavSection = {
  label: string;
  items: NavItem[];
};

/**
 * Three groups: what you publish, how it reaches readers, and the machinery
 * behind it. Dashboard sits above them because it is the landing page, not a
 * category.
 *
 * Entries that already have a permanent home elsewhere are deliberately absent
 * — "নতুন পোস্ট" lives in the header and on the posts page, "প্রোফাইল" in the
 * header's account menu, and জেলা/উপজেলা behind অঞ্চল, whose three pages step
 * through each other. A rail that repeats the rest of the console is a rail
 * nobody scans.
 */
const primaryItem: NavItem = {
  name: "ড্যাশবোর্ড",
  href: "/admin/dashboard",
  icon: LayoutDashboard,
};

const navSections: NavSection[] = [
  {
    label: "কনটেন্ট",
    items: [
      { name: "পোস্ট", href: "/admin/posts", icon: FileText },
      { name: "ক্যাটাগরি", href: "/admin/categories", icon: FolderOpen },
      { name: "ট্যাগ", href: "/admin/tags", icon: Tag },
      { name: "মিডিয়া", href: "/admin/media", icon: ImageIcon },
      { name: "মন্তব্য", href: "/admin/comments", icon: MessageSquare },
      {
        name: "অঞ্চল",
        href: "/admin/divisions",
        icon: Map,
        alsoMatches: ["/admin/districts", "/admin/upazilas"],
      },
    ],
  },
  {
    label: "প্রচার",
    items: [
      { name: "বিজ্ঞাপন", href: "/admin/ads", icon: Megaphone },
      { name: "ফেসবুক", href: "/admin/facebook", icon: Share2 },
      { name: "সোশ্যাল কিউ", href: "/admin/social/queue", icon: Clock },
      { name: "অ্যানালিটিক্স", href: "/admin/analytics", icon: BarChart2 },
      { name: "এসইও", href: "/admin/seo", icon: Search },
    ],
  },
  {
    label: "সিস্টেম",
    items: [
      { name: "মেনু", href: "/admin/menus", icon: MenuIcon },
      { name: "ব্র্যান্ডিং", href: "/admin/branding", icon: Palette },
      { name: "সেটিংস", href: "/admin/settings", icon: Settings },
      { name: "ব্যবহারকারী", href: "/admin/users", icon: Users },
    ],
  },
];

/**
 * Bottom tab bar — the five things an editor touches from a phone. "নতুন" stays
 * here even though the rail dropped it: the header's compose button is `sm:flex`,
 * so on a phone this is the only one-tap path to a new post.
 */
const mobileNavItems: NavItem[] = [
  { name: "ড্যাশবোর্ড", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "পোস্ট", href: "/admin/posts", icon: FileText, exact: true },
  { name: "নতুন", href: "/admin/posts/create", icon: PenSquare },
  { name: "মিডিয়া", href: "/admin/media", icon: ImageIcon },
  { name: "মন্তব্য", href: "/admin/comments", icon: MessageSquare },
];

function isActive(item: NavItem, pathname: string): boolean {
  const underRoute = (base: string) =>
    pathname === base || pathname.startsWith(`${base}/`);

  if (item.exact ? pathname === item.href : underRoute(item.href)) return true;
  return item.alsoMatches?.some(underRoute) ?? false;
}

/* ── Rail link ───────────────────────────────────────────────────────────── */

interface RailLinkProps {
  item: NavItem;
  pathname: string;
  expanded: boolean;
  onNavigate?: () => void;
}

function RailLink({ item, pathname, expanded, onNavigate }: RailLinkProps) {
  const active = isActive(item, pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={expanded ? undefined : item.name}
      className={cn(
        "group relative flex items-center rounded-[var(--ad-radius-sm)] text-[13px] transition-colors duration-150",
        expanded ? "gap-3 px-3 py-2" : "h-10 w-10 justify-center",
        // One signal, not three. "Where am I" is carried by the soft red wash
        // and red label together; the old version stacked a raised background,
        // a 2px bar and a recoloured icon to say the same thing once.
        active
          ? "bg-[var(--ad-primary-tint)] font-semibold text-[var(--ad-primary)]"
          : "font-medium text-[var(--ad-rail-muted)] hover:bg-[var(--ad-rail-raised)] hover:text-[var(--ad-rail-text)]"
      )}
    >
      <Icon className="h-[17px] w-[17px] shrink-0" />
      {expanded && <span className="truncate">{item.name}</span>}
    </Link>
  );
}

/* ── Nav tree ────────────────────────────────────────────────────────────── */

function NavTree({
  pathname,
  expanded,
  onNavigate,
}: {
  pathname: string;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      aria-label="অ্যাডমিন নেভিগেশন"
      className={cn(
        "flex flex-1 flex-col overflow-y-auto scrollbar-none py-3",
        expanded ? "gap-5 px-3" : "items-center gap-3 px-2"
      )}
    >
      <RailLink
        item={primaryItem}
        pathname={pathname}
        expanded={expanded}
        onNavigate={onNavigate}
      />

      {navSections.map((section) => (
        <div
          key={section.label}
          className={cn("flex flex-col", expanded ? "gap-0.5" : "items-center gap-1")}
        >
          {expanded ? (
            <p className="adm-label mb-1.5 px-3 text-[var(--ad-rail-muted)]/70">
              {section.label}
            </p>
          ) : (
            <span aria-hidden className="my-1 h-px w-5 bg-[var(--ad-rail-border)]" />
          )}
          {section.items.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              pathname={pathname}
              expanded={expanded}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

/* ── Masthead ────────────────────────────────────────────────────────────── */

function Masthead({ expanded, logoUrl }: { expanded: boolean; logoUrl?: string | null }) {
  return (
    <Link
      href="/admin/dashboard"
      className={cn(
        "flex h-14 shrink-0 items-center overflow-hidden border-b border-[var(--ad-rail-border)]",
        expanded ? "gap-2.5 px-4" : "justify-center px-0"
      )}
    >
      {expanded && logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt="মুক্তির কণ্ঠ"
          className="h-7 w-auto max-w-[150px] shrink-0 object-contain"
        />
      ) : (
        <>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[var(--ad-accent)] text-[15px] font-bold leading-none text-[var(--ad-on-primary)]">
            ম
          </span>
          {expanded && (
            <span className="min-w-0 whitespace-nowrap">
              <span className="block truncate font-serif text-[13px] font-bold tracking-tight text-[var(--ad-rail-text)]">
                মুক্তির কণ্ঠ
              </span>
              <span className="adm-label block text-[8.5px] text-[var(--ad-rail-muted)]">
                Newsroom Console
              </span>
            </span>
          )}
        </>
      )}
    </Link>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */

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
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden flex-col border-r border-[var(--ad-rail-border)] bg-[var(--ad-rail)] lg:flex",
          "transition-[width] duration-200 ease-out",
          expanded ? "w-[228px]" : "w-14"
        )}
      >
        <Masthead expanded={expanded} logoUrl={logoUrl} />
        <NavTree pathname={pathname} expanded={expanded} />

        <div className="shrink-0 border-t border-[var(--ad-rail-border)] p-2">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? "সাইডবার সংকুচিত করুন" : "সাইডবার প্রসারিত করুন"}
            className={cn(
              "flex items-center rounded-[var(--ad-radius-sm)] text-[13px] font-medium text-[var(--ad-rail-muted)] transition-colors hover:bg-[var(--ad-rail-raised)] hover:text-[var(--ad-rail-text)]",
              expanded ? "h-9 w-full gap-3 px-3" : "mx-auto h-10 w-10 justify-center"
            )}
          >
            {expanded ? (
              <>
                <PanelLeftClose className="h-[17px] w-[17px] shrink-0" />
                <span>সংকুচিত করুন</span>
              </>
            ) : (
              <PanelLeftOpen className="h-[17px] w-[17px]" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-[var(--ad-rail-border)] bg-[var(--ad-rail)] lg:hidden",
          "transform transition-transform duration-200 ease-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--ad-rail-border)] pr-2">
          <div className="flex-1">
            <Masthead expanded logoUrl={logoUrl} />
          </div>
          <button
            type="button"
            onClick={onMobileMenuClose}
            aria-label="মেনু বন্ধ করুন"
            className="rounded-[var(--ad-radius-sm)] p-2 text-[var(--ad-rail-muted)] transition-colors hover:bg-[var(--ad-rail-raised)] hover:text-[var(--ad-rail-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavTree pathname={pathname} expanded onNavigate={onMobileMenuClose} />
      </aside>

      {/* Mobile tab bar */}
      <nav
        aria-label="দ্রুত নেভিগেশন"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--ad-rail-border)] bg-[var(--ad-rail)] safe-area-pb lg:hidden"
      >
        <div className="grid grid-cols-5">
          {mobileNavItems.map((item) => {
            const active = isActive(item, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2 transition-colors",
                  active
                    ? "font-semibold text-[var(--ad-primary)]"
                    : "text-[var(--ad-rail-muted)] hover:text-[var(--ad-rail-text)]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="text-[9.5px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
