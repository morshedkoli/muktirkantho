import { AdminShell } from "@/components/admin/admin-shell";
import { getSiteSettings } from "@/lib/site-settings";
import { isFacebookConfigured, getFacebookAppId } from "@/lib/facebook";
import { FacebookConnectClient } from "./facebook-connect-client";

export const metadata = {
  title: "ফেসবুক সংযোগ",
  description: "ফেসবুক পেজ যুক্ত করে সংবাদ স্বয়ংক্রিয়ভাবে শেয়ার করুন",
};

export const dynamic = "force-dynamic";

export default async function FacebookPage() {
  const [settings, configured, appId] = await Promise.all([
    getSiteSettings(),
    isFacebookConfigured(),
    getFacebookAppId(),
  ]);

  return (
    <AdminShell
      kicker="প্রচার"
      title="ফেসবুক সংযোগ"
      description="পেজ যুক্ত করলে প্রকাশিত সংবাদ স্বয়ংক্রিয়ভাবে ফেসবুকে শেয়ার হবে।"
    >
      <FacebookConnectClient
        settings={{
          connected: settings?.facebookConnected ?? false,
          pageId: settings?.facebookPageId ?? null,
          pageName: settings?.facebookPageName ?? null,
          autoPost: settings?.facebookAutoPost ?? false,
          connectedAt: settings?.facebookConnectedAt ?? null,
          appId,
        }}
        isConfigured={configured}
      />
    </AdminShell>
  );
}
