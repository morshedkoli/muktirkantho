"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "bn";

const translations = {
  en: {
    // Sidebar sections
    sectionOverview: "Overview",
    sectionContent: "Content",
    sectionModules: "Modules",
    sectionSocial: "Social",
    sectionAnalytics: "Analytics",
    sectionSystem: "System",
    // Nav items
    navDashboard: "Dashboard",
    navAllPosts: "All Posts",
    navNewPost: "New Post",
    navCategories: "Categories",
    navTags: "Tags",
    navMedia: "Media",
    navComments: "Comments",
    navEPaper: "E-Paper",
    navOpinion: "Opinion",
    navVideo: "Video",
    navGallery: "Gallery",
    navBreaking: "Breaking",
    navHomepage: "Homepage",
    navDistricts: "Districts",
    navUpazilas: "Upazilas",
    navTwitter: "X / Twitter",
    navFacebook: "Facebook",
    navInstagram: "Instagram",
    navLinkedIn: "LinkedIn",
    navQueue: "Queue",
    navTemplates: "Templates",
    navAnalytics: "Analytics",
    navSEO: "SEO",
    navAds: "Ads",
    navBranding: "Branding",
    navGeo: "Geo",
    navUsers: "Users",
    navSubscribers: "Subscribers",
    navSettings: "Settings",
    navPosts: "Posts",
    navMenus: "Menus",
    // Sidebar bottom
    adminPanel: "Admin Panel",
    viewSite: "View Site",
    signOut: "Sign Out",
    // Header
    adminBreadcrumb: "Admin",
    searchPlaceholder: "Search articles, categories…",
    notifications: "Notifications",
    unread: "unread",
    profileSettings: "Profile Settings",
    // Notifications content
    notifBreakingTitle: "Breaking News Alert",
    notifBreakingDesc: "New article flagged as breaking ready for review",
    notifFacebookTitle: "Facebook Post Failed",
    notifFacebookDesc: "Scheduled post failed to publish",
    notifCommentTitle: "Comment Spike Detected",
    notifCommentDesc: "45 new comments on recent article",
    notifSitemapTitle: "Sitemap Updated",
    notifSitemapDesc: "XML sitemap regenerated successfully",
    // Dashboard
    dashboard: "Dashboard",
    publishingOverview: "Publishing Overview",
    today: "Today",
    thisWeek: "This Week",
    last30Days: "Last 30 Days",
    totalPublished: "Total Published",
    draftsPending: "Drafts pending",
    liveArticles: "Live articles",
    across: "Across",
    categoriesLabel: "categories",
    districtsCovered: "Districts covered",
    upazilasActive: "upazilas active",
    totalPosts: "Total Posts",
    published: "Published",
    drafts: "Drafts",
    districts: "Districts",
    upazilas: "Upazilas",
    recentArticles: "Recent Articles",
    total: "total",
    viewAll: "VIEW ALL",
    filterAll: "All",
    filterLive: "Live",
    filterDraft: "Draft",
    filterScheduled: "Scheduled",
    noArticlesYet: "No articles yet.",
    createOne: "Create one",
    quickActions: "Quick Actions",
    newPost: "New Post",
    media: "Media",
    categories: "Categories",
    socialDistribution: "Social Distribution",
    allActive: "All Active",
    todayCount: "today",
    publishingActivity: "Publishing Activity",
    last7Days: "Last 7 days",
    postsPerDay: "Posts per day",
    totalPostsUpper: "TOTAL POSTS",
    topCategories: "Top Categories",
    noCategoriesYet: "No categories yet",
    lastReports: "Last Reports",
    exportBtn: "Export",
    colTitle: "Title",
    colDate: "Date",
    colStatus: "Status",
    systemReport: "System Report",
    completed: "Completed",
    weeklyDigest: "Weekly Digest",
    inProgress: "In Progress",
    monthlyRecap: "Monthly Recap",
    pending: "Pending",
    liveBadge: "Live",
    draftBadge: "Draft",
    editBtn: "Edit",
    // Posts page
    managePosts: "Manage Posts",
    managePostsDesc: "Create, edit, and manage your news articles",
    createPost: "Create Post",
    searchPosts: "Search posts...",
    filters: "Filters",
    colPost: "Post",
    colCategory: "Category",
    colLocation: "Location",
    colActions: "Actions",
    viewBtn: "View",
    noPostsYet: "No posts yet",
    noPostsDesc: "Get started by creating your first post",
    showing: "Showing",
    posts: "posts",
    previous: "Previous",
    next: "Next",
  },
  bn: {
    // Sidebar sections
    sectionOverview: "সংক্ষিপ্ত",
    sectionContent: "কন্টেন্ট",
    sectionModules: "মডিউল",
    sectionSocial: "সোশ্যাল",
    sectionAnalytics: "বিশ্লেষণ",
    sectionSystem: "সিস্টেম",
    // Nav items
    navDashboard: "ড্যাশবোর্ড",
    navAllPosts: "সব পোস্ট",
    navNewPost: "নতুন পোস্ট",
    navCategories: "বিভাগ",
    navTags: "ট্যাগ",
    navMedia: "মিডিয়া",
    navComments: "মন্তব্য",
    navEPaper: "ই-পেপার",
    navOpinion: "মতামত",
    navVideo: "ভিডিও",
    navGallery: "গ্যালারি",
    navBreaking: "ব্রেকিং",
    navHomepage: "হোমপেজ",
    navDistricts: "জেলা",
    navUpazilas: "উপজেলা",
    navTwitter: "এক্স / টুইটার",
    navFacebook: "ফেসবুক",
    navInstagram: "ইনস্টাগ্রাম",
    navLinkedIn: "লিংকডইন",
    navQueue: "কিউ",
    navTemplates: "টেমপ্লেট",
    navAnalytics: "বিশ্লেষণ",
    navSEO: "এসইও",
    navAds: "বিজ্ঞাপন",
    navBranding: "ব্র্যান্ডিং",
    navGeo: "ভূগোল",
    navUsers: "ব্যবহারকারী",
    navSubscribers: "সাবস্ক্রাইবার",
    navSettings: "সেটিংস",
    navPosts: "পোস্ট",
    navMenus: "মেনু",
    // Sidebar bottom
    adminPanel: "অ্যাডমিন প্যানেল",
    viewSite: "সাইট দেখুন",
    signOut: "সাইন আউট",
    // Header
    adminBreadcrumb: "অ্যাডমিন",
    searchPlaceholder: "নিবন্ধ, বিভাগ খুঁজুন…",
    notifications: "বিজ্ঞপ্তি",
    unread: "অপঠিত",
    profileSettings: "প্রোফাইল সেটিংস",
    // Notifications content
    notifBreakingTitle: "ব্রেকিং নিউজ সতর্কতা",
    notifBreakingDesc: "নতুন নিবন্ধ ব্রেকিং হিসেবে পর্যালোচনার জন্য চিহ্নিত",
    notifFacebookTitle: "ফেসবুক পোস্ট ব্যর্থ",
    notifFacebookDesc: "নির্ধারিত পোস্ট প্রকাশ করা যায়নি",
    notifCommentTitle: "মন্তব্য বৃদ্ধি সনাক্ত",
    notifCommentDesc: "সাম্প্রতিক নিবন্ধে ৪৫টি নতুন মন্তব্য",
    notifSitemapTitle: "সাইটম্যাপ আপডেট",
    notifSitemapDesc: "XML সাইটম্যাপ সফলভাবে পুনরুৎপন্ন হয়েছে",
    // Dashboard
    dashboard: "ড্যাশবোর্ড",
    publishingOverview: "প্রকাশনার সারসংক্ষেপ",
    today: "আজ",
    thisWeek: "এই সপ্তাহ",
    last30Days: "গত ৩০ দিন",
    totalPublished: "মোট প্রকাশিত",
    draftsPending: "ড্রাফট অপেক্ষমাণ",
    liveArticles: "লাইভ নিবন্ধ",
    across: "মোট",
    categoriesLabel: "বিভাগ",
    districtsCovered: "জেলা কভার",
    upazilasActive: "উপজেলা সক্রিয়",
    totalPosts: "মোট পোস্ট",
    published: "প্রকাশিত",
    drafts: "ড্রাফট",
    districts: "জেলা",
    upazilas: "উপজেলা",
    recentArticles: "সাম্প্রতিক নিবন্ধ",
    total: "মোট",
    viewAll: "সব দেখুন",
    filterAll: "সব",
    filterLive: "লাইভ",
    filterDraft: "ড্রাফট",
    filterScheduled: "নির্ধারিত",
    noArticlesYet: "কোনো নিবন্ধ নেই।",
    createOne: "তৈরি করুন",
    quickActions: "দ্রুত অ্যাকশন",
    newPost: "নতুন পোস্ট",
    media: "মিডিয়া",
    categories: "বিভাগ",
    socialDistribution: "সোশ্যাল বিতরণ",
    allActive: "সব সক্রিয়",
    todayCount: "আজ",
    publishingActivity: "প্রকাশনা কার্যক্রম",
    last7Days: "গত ৭ দিন",
    postsPerDay: "প্রতিদিনের পোস্ট",
    totalPostsUpper: "মোট পোস্ট",
    topCategories: "শীর্ষ বিভাগ",
    noCategoriesYet: "এখনো কোনো বিভাগ নেই",
    lastReports: "সর্বশেষ রিপোর্ট",
    exportBtn: "এক্সপোর্ট",
    colTitle: "শিরোনাম",
    colDate: "তারিখ",
    colStatus: "অবস্থা",
    systemReport: "সিস্টেম রিপোর্ট",
    completed: "সম্পন্ন",
    weeklyDigest: "সাপ্তাহিক সারাংশ",
    inProgress: "চলমান",
    monthlyRecap: "মাসিক সারাংশ",
    pending: "অপেক্ষমাণ",
    liveBadge: "লাইভ",
    draftBadge: "ড্রাফট",
    editBtn: "সম্পাদনা",
    // Posts page
    managePosts: "পোস্ট ব্যবস্থাপনা",
    managePostsDesc: "নিবন্ধ তৈরি, সম্পাদনা ও পরিচালনা করুন",
    createPost: "পোস্ট তৈরি করুন",
    searchPosts: "পোস্ট খুঁজুন...",
    filters: "ফিল্টার",
    colPost: "পোস্ট",
    colCategory: "বিভাগ",
    colLocation: "অবস্থান",
    colActions: "অ্যাকশন",
    viewBtn: "দেখুন",
    noPostsYet: "এখনো কোনো পোস্ট নেই",
    noPostsDesc: "প্রথম পোস্ট তৈরি করে শুরু করুন",
    showing: "দেখাচ্ছে",
    posts: "পোস্ট",
    previous: "আগে",
    next: "পরে",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

type LangContextType = {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
};

const LangContext = createContext<LangContextType>({
  lang: "en",
  toggleLang: () => {},
  t: (key) => translations.en[key],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("admin-lang") as Lang | null;
    if (stored === "en" || stored === "bn") setLang(stored);
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "bn" : "en";
    setLang(next);
    localStorage.setItem("admin-lang", next);
  };

  const t = (key: TranslationKey): string => translations[lang][key];

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
