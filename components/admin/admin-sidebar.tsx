"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Image,
  Tags,
  MapPin,
  MapPinned,

  Settings,
  Megaphone,
  X,
  Home,
  Palette,
  Facebook,
  MessageSquare,
  Hash,
  Search,
  Twitter,
  Linkedin,
  Instagram,
  Zap,
  TrendingUp,
  Lightbulb,
  Video,
  Images,
  Radio,
  Layout,
  Lock,
  BookOpen,
  FileText as FileTextIcon,
  ChevronRight,
  HelpCircle,
  Globe,
} from "lucide-react";

import { useEffect, useState, useCallback } from "react";
import { useLang, type TranslationKey } from "@/lib/admin-i18n";
import { useTheme } from "@/components/theme-provider";

type NavItem = {
  nameKey: TranslationKey;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
};

type NavSection = {
  labelKey: TranslationKey;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    labelKey: "sectionOverview",
    items: [{ nameKey: "navDashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "sectionContent",
    items: [
      { nameKey: "navAllPosts",   href: "/admin/posts",          icon: FileText },
      { nameKey: "navNewPost",    href: "/admin/posts/create",   icon: Layout },
      { nameKey: "navCategories", href: "/admin/categories",     icon: Tags },
      { nameKey: "navTags",       href: "/admin/tags",           icon: Hash },
      { nameKey: "navMedia",      href: "/admin/media",          icon: Image },
      { nameKey: "navComments",   href: "/admin/comments",       icon: MessageSquare },
      { nameKey: "navMenus",      href: "/admin/menus",          icon: Layout },
      { nameKey: "navEPaper",     href: "/admin/e-paper",        icon: BookOpen },
    ],
  },
  {
    labelKey: "sectionModules",
    items: [
      { nameKey: "navOpinion",  href: "/admin/opinion",   icon: Lightbulb },
      { nameKey: "navVideo",    href: "/admin/video",     icon: Video },
      { nameKey: "navGallery",  href: "/admin/gallery",   icon: Images },
      { nameKey: "navBreaking", href: "/admin/breaking",  icon: Radio },
      { nameKey: "navHomepage", href: "/admin/homepage",  icon: Layout },
      { nameKey: "navDistricts",href: "/admin/districts", icon: MapPin },
      { nameKey: "navUpazilas", href: "/admin/upazilas",  icon: MapPinned },
    ],
  },
  {
    labelKey: "sectionSocial",
    items: [
      { nameKey: "navTwitter",   href: "/admin/social/twitter",    icon: Twitter },
      { nameKey: "navFacebook",  href: "/admin/facebook",          icon: Facebook },
      { nameKey: "navInstagram", href: "/admin/social/instagram",  icon: Instagram },
      { nameKey: "navLinkedIn",  href: "/admin/social/linkedin",   icon: Linkedin },
      { nameKey: "navQueue",     href: "/admin/social/queue",      icon: Zap },
      { nameKey: "navTemplates", href: "/admin/social/templates",  icon: FileTextIcon },
    ],
  },
  {
    labelKey: "sectionAnalytics",
    items: [
      { nameKey: "navAnalytics", href: "/admin/analytics", icon: TrendingUp },
      { nameKey: "navSEO",       href: "/admin/seo",       icon: Search },
      { nameKey: "navAds",       href: "/admin/ads",       icon: Megaphone },
    ],
  },
  {
    labelKey: "sectionSystem",
    items: [
      { nameKey: "navBranding",     href: "/admin/branding",     icon: Palette },
      { nameKey: "navGeo",          href: "/admin/divisions",    icon: Globe },
      { nameKey: "navUsers",        href: "/admin/users",        icon: HelpCircle },
      { nameKey: "navSubscribers",  href: "/admin/subscribers",  icon: Lock },
      { nameKey: "navSettings",     href: "/admin/settings",     icon: Settings },
    ],
  },
];

const mobileNavItems: NavItem[] = [
  { nameKey: "navDashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { nameKey: "navPosts",     href: "/admin/posts",     icon: FileText },
  { nameKey: "navMedia",     href: "/admin/media",     icon: Image },
  { nameKey: "navComments",  href: "/admin/comments",  icon: MessageSquare },
  { nameKey: "navSettings",  href: "/admin/settings",  icon: Settings },
];

type LogoData = { logoUrl: string | null; darkLogoUrl: string | null; logoHeight: number | null };

interface AdminSidebarProps {
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AdminSidebar({
  mobileMenuOpen = false,
  onMobileMenuClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useLang();
  const { theme } = useTheme();
  const [logoData, setLogoData] = useState<LogoData>({ logoUrl: null, darkLogoUrl: null, logoHeight: null });

  useEffect(() => {
    fetch("/api/admin/logo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LogoData | null) => data && setLogoData(data))
      .catch(() => {});
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const sectionHasActive = useCallback(
    (section: NavSection) => section.items.some((item) => isActive(item.href)),
    [pathname] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Start with sections open if they contain the active route
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(navSections.map((s) => [s.labelKey, s.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))]))
  );

  // Re-open the active section when pathname changes
  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      navSections.forEach((s) => {
        if (s.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))) {
          next[s.labelKey] = true;
        }
      });
      return next;
    });
  }, [pathname]);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const navTree = (
    <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin">
      {navSections.map((section) => {
        const isOpen = openSections[section.labelKey] ?? false;
        const hasActive = sectionHasActive(section);
        return (
          <div key={section.labelKey}>
            {/* Section header — clickable toggle */}
            <button
              type="button"
              onClick={() => toggleSection(section.labelKey)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors ${
                hasActive
                  ? "text-[var(--ad-green)]"
                  : "text-[var(--ad-text-muted)] hover:text-[var(--ad-text-secondary)] hover:bg-[var(--ad-sidebar-divider)]/40"
              }`}
            >
              <span>{t(section.labelKey)}</span>
              <ChevronRight
                className={`h-3 w-3 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              />
            </button>

            {/* Collapsible items */}
            {isOpen && (
              <ul className="mt-0.5 mb-1 space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.nameKey}>
                      <Link
                        href={item.href}
                        onClick={onMobileMenuClose}
                        className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                          active
                            ? "bg-[var(--ad-green)] text-white shadow-sm"
                            : "text-[var(--ad-text-secondary)] hover:bg-[var(--ad-sidebar-divider)]/60 hover:text-[var(--ad-text-primary)]"
                        }`}
                      >
                        <Icon className={`h-[17px] w-[17px] shrink-0 ${active ? "text-white" : "opacity-70"}`} />
                        <span className="flex-1 truncate">{t(item.nameKey)}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? "bg-white/20 text-white" : "bg-[var(--ad-brand)] text-white"}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  const userCard = (
    <div className="border-t border-[var(--ad-sidebar-divider)] p-3 shrink-0">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium text-[var(--ad-text-secondary)] hover:bg-[var(--ad-sidebar-divider)]/60 hover:text-[var(--ad-text-primary)] transition-all"
      >
        <Home className="h-4 w-4" />
        {t("viewSite")}
      </Link>
    </div>
  );

  const activeLogo = theme === "dark"
    ? (logoData.darkLogoUrl ?? logoData.logoUrl)
    : (logoData.logoUrl ?? logoData.darkLogoUrl);

  const logo = (
    <Link href="/admin/dashboard" className="flex items-center justify-center px-3 py-3 border-b border-[var(--ad-sidebar-divider)] min-h-[60px]">
      {activeLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeLogo}
          alt="মুক্তির কণ্ঠ"
          style={{ height: `${Math.min(logoData.logoHeight ?? 40, 44)}px`, maxWidth: "100%" }}
          className="object-contain w-full lg:w-auto lg:max-w-[180px]"
        />
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[var(--ad-brand)] text-white text-[16px] font-bold font-bangla shrink-0">
            ম
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-bold leading-tight text-[var(--ad-text-primary)] truncate">
              মুক্তির কণ্ঠ
            </div>
            <div className="text-[10px] font-mono tracking-[0.05em] text-[var(--ad-text-muted)] uppercase">
              {t("adminPanel")}
            </div>
          </div>
        </div>
      )}
    </Link>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Desktop sidebar — fixed 220px mint-green */}
      <aside className="fixed inset-y-0 left-0 z-50 w-[220px] hidden lg:flex lg:flex-col border-r border-[var(--ad-sidebar-border)] bg-[var(--ad-sidebar)]">
        {logo}
        {navTree}
        {userCard}
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col border-r border-[var(--ad-sidebar-border)] bg-[var(--ad-sidebar)] lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--ad-sidebar-divider)]">
          {logo}
          <button
            onClick={onMobileMenuClose}
            aria-label="Close menu"
            className="mr-2 rounded-md p-2 text-[var(--ad-text-secondary)] hover:bg-[var(--ad-sidebar-divider)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navTree}
        {userCard}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--ad-card)] border-t border-[var(--ad-border)] lg:hidden safe-area-pb">
        <div className="grid grid-cols-5 gap-1 p-1.5">
          {mobileNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-all ${
                  active
                    ? "text-[var(--ad-green)]"
                    : "text-[var(--ad-text-secondary)] hover:text-[var(--ad-text-primary)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium truncate">{t(item.nameKey)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
