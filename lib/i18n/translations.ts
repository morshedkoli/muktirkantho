export type Language = "en" | "bn";

export type TranslationKey =
  | "admin_panel"
  | "view_site"
  | "logout"
  | "search_placeholder"
  | "notifications"
  | "notifications_unread"
  | "view_all"
  | "profile_settings"
  | "sign_out"
  | "mobile_menu"

  | "nav_overview"
  | "nav_content"
  | "nav_locations"
  | "nav_social"
  | "nav_analytics"
  | "nav_settings"

  | "nav_dashboard"
  | "nav_posts"
  | "nav_media_library"
  | "nav_categories"
  | "nav_tags"
  | "nav_comments"
  | "nav_e_paper"
  | "nav_opinion"
  | "nav_video"
  | "nav_photo_gallery"
  | "nav_breaking_news"
  | "nav_homepage_editor"
  | "nav_x_twitter"
  | "nav_facebook"
  | "nav_instagram"
  | "nav_linkedin"
  | "nav_social_queue"
  | "nav_social_templates"
  | "nav_analytics_hub"
  | "nav_seo_manager"
  | "nav_ads"
  | "nav_branding"
  | "nav_divisions"
  | "nav_districts"
  | "nav_upazilas"
  | "nav_settings_page"
  | "nav_users"
  | "nav_subscriber_wall"

  | "breadcrumb_admin"
  | "breadcrumb_dashboard"

  | "dashboard_title"
  | "dashboard_subtitle"
  | "dashboard_date_label"
  | "dashboard_todays_publishes"
  | "dashboard_pending"
  | "dashboard_social_queue"
  | "dashboard_active_readers"
  | "dashboard_total_posts"
  | "dashboard_published"
  | "dashboard_drafts"
  | "dashboard_categories"
  | "dashboard_districts"
  | "dashboard_upazilas"
  | "dashboard_recent_articles"
  | "dashboard_view_all"
  | "dashboard_no_posts"
  | "dashboard_live"
  | "dashboard_draft"
  | "dashboard_edit"
  | "dashboard_quick_actions"
  | "dashboard_new_post"
  | "dashboard_media"
  | "dashboard_view_site"
  | "dashboard_social_distribution"
  | "dashboard_all_active"
  | "dashboard_posts_today"
  | "dashboard_manage_social_queue"
  | "dashboard_publishing_overview"
  | "dashboard_today"
  | "dashboard_published_label"
  | "dashboard_drafts_label"
  | "dashboard_tab_all"
  | "dashboard_tab_live"
  | "dashboard_tab_draft"
  | "dashboard_tab_scheduled"
  | "dashboard_total_count"
  | "dashboard_this_week"
  | "dashboard_last_30_days"
  | "dashboard_total_published_label"
  | "dashboard_drafts_pending_label"
  | "dashboard_publishing_activity"
  | "dashboard_last_7_days"

  | "shell_title"
  | "shell_description"

  | "branding_title"
  | "branding_description"
  | "branding_preview"
  | "branding_light_mode"
  | "branding_dark_mode"
  | "branding_logos"
  | "branding_logos_description"
  | "branding_site_identity"
  | "branding_site_identity_description"
  | "branding_watermark"
  | "branding_watermark_description"
  | "branding_save"
  | "branding_saving"
  | "branding_light_logo"
  | "branding_dark_logo"
  | "branding_site_icon"
  | "branding_favicon"
  | "branding_watermark_logo"
  | "branding_uploading"
  | "branding_uploaded"
  | "branding_replace"
  | "branding_click_upload"
  | "branding_default"
  | "branding_remove"
  | "branding_icon"
  | "branding_watermark_label"

  | "lang_en"
  | "lang_bn";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    admin_panel: "Admin Panel",
    view_site: "View Site",
    logout: "Logout",
    search_placeholder: "Search articles, categories...",
    notifications: "Notifications",
    notifications_unread: "unread",
    view_all: "View All",
    profile_settings: "Profile Settings",
    sign_out: "Sign Out",
    mobile_menu: "Toggle menu",

    nav_overview: "Overview",
    nav_content: "Content",
    nav_locations: "Locations",
    nav_social: "Social",
    nav_analytics: "Analytics",
    nav_settings: "Settings",

    nav_dashboard: "Dashboard",
    nav_posts: "Posts",
    nav_media_library: "Media Library",
    nav_categories: "Categories",
    nav_tags: "Tags",
    nav_comments: "Comments",
    nav_e_paper: "E-Paper",
    nav_opinion: "Opinion / Columns",
    nav_video: "Video",
    nav_photo_gallery: "Photo Gallery",
    nav_breaking_news: "Breaking News",
    nav_homepage_editor: "Homepage Editor",
    nav_x_twitter: "X / Twitter",
    nav_facebook: "Facebook",
    nav_instagram: "Instagram",
    nav_linkedin: "LinkedIn",
    nav_social_queue: "Social Queue",
    nav_social_templates: "Social Templates",
    nav_analytics_hub: "Analytics Hub",
    nav_seo_manager: "SEO Manager",
    nav_ads: "Ads",
    nav_branding: "Branding",
    nav_divisions: "Divisions",
    nav_districts: "Districts",
    nav_upazilas: "Upazilas",
    nav_settings_page: "Settings",
    nav_users: "Users",
    nav_subscriber_wall: "Subscriber Wall",

    breadcrumb_admin: "Admin",
    breadcrumb_dashboard: "Dashboard",

    dashboard_title: "Welcome to the Newsroom",
    dashboard_subtitle:
      "Your editorial command centre. Monitor content, manage social distribution, and track performance \u2014 all from one place.",
    dashboard_date_label: "Dashboard",
    dashboard_todays_publishes: "Today\u2019s Publishes",
    dashboard_pending: "Pending",
    dashboard_social_queue: "Social Queue",
    dashboard_active_readers: "Active Readers",
    dashboard_total_posts: "Total Posts",
    dashboard_published: "Published",
    dashboard_drafts: "Drafts",
    dashboard_categories: "Categories",
    dashboard_districts: "Districts",
    dashboard_upazilas: "Upazilas",
    dashboard_recent_articles: "Recent Articles",
    dashboard_view_all: "View All",
    dashboard_no_posts: "No posts yet. Create your first post to get started.",
    dashboard_live: "Live",
    dashboard_draft: "Draft",
    dashboard_edit: "Edit \u2192",
    dashboard_quick_actions: "Quick Actions",
    dashboard_new_post: "New Post",
    dashboard_media: "Media",
    dashboard_view_site: "View Site",
    dashboard_social_distribution: "Social Distribution",
    dashboard_all_active: "All Active",
    dashboard_posts_today: "posts today",
    dashboard_manage_social_queue: "Manage Social Queue",
    dashboard_publishing_overview: "Publishing Overview",
    dashboard_today: "Today",
    dashboard_published_label: "Published",
    dashboard_drafts_label: "Drafts",
    dashboard_tab_all: "All",
    dashboard_tab_live: "Live",
    dashboard_tab_draft: "Draft",
    dashboard_tab_scheduled: "Scheduled",
    dashboard_total_count: "total",
    dashboard_this_week: "This Week",
    dashboard_last_30_days: "Last 30 Days",
    dashboard_total_published_label: "Total Published",
    dashboard_drafts_pending_label: "Drafts pending",
    dashboard_publishing_activity: "Publishing Activity",
    dashboard_last_7_days: "Last 7 days",

    shell_title: "Page Title",
    shell_description: "Page Description",

    branding_title: "Branding & Logo",
    branding_description: "Manage your site branding, logos, and visual identity",
    branding_preview: "Preview",
    branding_light_mode: "Light Mode",
    branding_dark_mode: "Dark Mode",
    branding_logos: "Logos",
    branding_logos_description: "Upload light and dark mode versions of your site logo.",
    branding_site_identity: "Site Identity",
    branding_site_identity_description: "Upload a square site icon and browser favicon.",
    branding_watermark: "Watermark",
    branding_watermark_description: "A small transparent PNG overlay on news images.",
    branding_save: "Save Branding Settings",
    branding_saving: "Saving...",
    branding_light_logo: "Light Mode Logo",
    branding_dark_logo: "Dark Mode Logo",
    branding_site_icon: "Site Icon",
    branding_favicon: "Favicon",
    branding_watermark_logo: "Watermark Logo",
    branding_uploading: "Uploading...",
    branding_uploaded: "Uploaded",
    branding_replace: "Replace file",
    branding_click_upload: "Click to upload",
    branding_default: "Default",
    branding_remove: "Remove image",
    branding_icon: "Icon",
    branding_watermark_label: "Watermark",

    lang_en: "English",
    lang_bn: "বাংলা",
  },

  bn: {
    admin_panel: "অ্যাডমিন প্যানেল",
    view_site: "সাইট দেখুন",
    logout: "লগ আউট",
    search_placeholder: "নিবন্ধ, বিভাগ অনুসন্ধান...",
    notifications: "বিজ্ঞপ্তি",
    notifications_unread: "পড়া হয়নি",
    view_all: "সব দেখুন",
    profile_settings: "প্রোফাইল সেটিংস",
    sign_out: "সাইন আউট",
    mobile_menu: "মেনু টগল",

    nav_overview: "ওভারভিউ",
    nav_content: "কন্টেন্ট",
    nav_locations: "স্থানসমূহ",
    nav_social: "সামাজিক",
    nav_analytics: "অ্যানালিটিক্স",
    nav_settings: "সেটিংস",

    nav_dashboard: "ড্যাশবোর্ড",
    nav_posts: "পোস্ট",
    nav_media_library: "মিডিয়া লাইব্রেরি",
    nav_categories: "ক্যাটাগরি",
    nav_tags: "ট্যাগ",
    nav_comments: "মন্তব্য",
    nav_e_paper: "ই-পেপার",
    nav_opinion: "মতামত / কলাম",
    nav_video: "ভিডিও",
    nav_photo_gallery: "ফটো গ্যালারি",
    nav_breaking_news: "ব্রেকিং নিউজ",
    nav_homepage_editor: "হোমপেজ এডিটর",
    nav_x_twitter: "এক্স / টুইটার",
    nav_facebook: "ফেসবুক",
    nav_instagram: "ইনস্টাগ্রাম",
    nav_linkedin: "লিংকডইন",
    nav_social_queue: "সোশ্যাল কিউ",
    nav_social_templates: "সোশ্যাল টেমপ্লেট",
    nav_analytics_hub: "অ্যানালিটিক্স হাব",
    nav_seo_manager: "এসইও ম্যানেজার",
    nav_ads: "বিজ্ঞাপন",
    nav_branding: "ব্র্যান্ডিং",
    nav_divisions: "বিভাগ",
    nav_districts: "জেলা",
    nav_upazilas: "উপজেলা",
    nav_settings_page: "সেটিংস",
    nav_users: "ব্যবহারকারী",
    nav_subscriber_wall: "সাবস্ক্রাইবার ওয়াল",

    breadcrumb_admin: "অ্যাডমিন",
    breadcrumb_dashboard: "ড্যাশবোর্ড",

    dashboard_title: "নিউজরুমে স্বাগতম",
    dashboard_subtitle:
      "আপনার সম্পাদকীয় কমান্ড সেন্টার। কন্টেন্ট মনিটর করুন, সামাজিক বিতরণ পরিচালনা করুন এবং পারফরম্যান্স ট্র্যাক করুন \u2014 সবকিছু এক জায়গা থেকে।",
    dashboard_date_label: "ড্যাশবোর্ড",
    dashboard_todays_publishes: "আজকের প্রকাশনা",
    dashboard_pending: "মুলতুবি",
    dashboard_social_queue: "সোশ্যাল কিউ",
    dashboard_active_readers: "সক্রিয় পাঠক",
    dashboard_total_posts: "মোট পোস্ট",
    dashboard_published: "প্রকাশিত",
    dashboard_drafts: "খসড়া",
    dashboard_categories: "ক্যাটাগরি",
    dashboard_districts: "জেলা",
    dashboard_upazilas: "উপজেলা",
    dashboard_recent_articles: "সাম্প্রতিক নিবন্ধ",
    dashboard_view_all: "সব দেখুন",
    dashboard_no_posts: "এখনো কোনো পোস্ট নেই। শুরু করতে আপনার প্রথম পোস্ট তৈরি করুন।",
    dashboard_live: "প্রকাশিত",
    dashboard_draft: "খসড়া",
    dashboard_edit: "এডিট \u2192",
    dashboard_quick_actions: "দ্রুত অ্যাকশন",
    dashboard_new_post: "নতুন পোস্ট",
    dashboard_media: "মিডিয়া",
    dashboard_view_site: "সাইট দেখুন",
    dashboard_social_distribution: "সোশ্যাল ডিস্ট্রিবিউশন",
    dashboard_all_active: "সব সক্রিয়",
    dashboard_posts_today: "টি পোস্ট আজ",
    dashboard_manage_social_queue: "সোশ্যাল কিউ পরিচালনা",
    dashboard_publishing_overview: "প্রকাশনার ওভারভিউ",
    dashboard_today: "আজ",
    dashboard_published_label: "প্রকাশিত",
    dashboard_drafts_label: "খসড়া",
    dashboard_tab_all: "সব",
    dashboard_tab_live: "প্রকাশিত",
    dashboard_tab_draft: "খসড়া",
    dashboard_tab_scheduled: "নির্ধারিত",
    dashboard_total_count: "মোট",
    dashboard_this_week: "এই সপ্তাহ",
    dashboard_last_30_days: "গত ৩০ দিন",
    dashboard_total_published_label: "মোট প্রকাশিত",
    dashboard_drafts_pending_label: "খসড়া মুলতুবি",
    dashboard_publishing_activity: "প্রকাশনা কার্যকলাপ",
    dashboard_last_7_days: "গত ৭ দিন",

    shell_title: "পৃষ্ঠার শিরোনাম",
    shell_description: "পৃষ্ঠার বর্ণনা",

    branding_title: "ব্র্যান্ডিং ও লোগো",
    branding_description: "আপনার সাইটের ব্র্যান্ডিং, লোগো এবং ভিজুয়াল আইডেন্টিটি পরিচালনা করুন",
    branding_preview: "প্রিভিউ",
    branding_light_mode: "লাইট মোড",
    branding_dark_mode: "ডার্ক মোড",
    branding_logos: "লোগো",
    branding_logos_description: "আপনার সাইটের লোগোর লাইট এবং ডার্ক মোড ভার্সন আপলোড করুন।",
    branding_site_identity: "সাইট আইডেন্টিটি",
    branding_site_identity_description: "একটি বর্গাকার সাইট আইকন এবং ব্রাউজার ফেভিকন আপলোড করুন।",
    branding_watermark: "ওয়াটারমার্ক",
    branding_watermark_description: "নিউজ ইমেজের উপর একটি ছোট স্বচ্ছ PNG ওভারলে।",
    branding_save: "ব্র্যান্ডিং সেটিংস সংরক্ষণ",
    branding_saving: "সংরক্ষণ হচ্ছে...",
    branding_light_logo: "লাইট মোড লোগো",
    branding_dark_logo: "ডার্ক মোড লোগো",
    branding_site_icon: "সাইট আইকন",
    branding_favicon: "ফেভিকন",
    branding_watermark_logo: "ওয়াটারমার্ক লোগো",
    branding_uploading: "আপলোড হচ্ছে...",
    branding_uploaded: "আপলোড হয়েছে",
    branding_replace: "ফাইল পরিবর্তন",
    branding_click_upload: "আপলোড করতে ক্লিক করুন",
    branding_default: "ডিফল্ট",
    branding_remove: "ইমেজ সরান",
    branding_icon: "আইকন",
    branding_watermark_label: "ওয়াটারমার্ক",

    lang_en: "English",
    lang_bn: "বাংলা",
  },
};
