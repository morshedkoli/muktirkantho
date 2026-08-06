import { AdminShell } from "@/components/admin/admin-shell";
import { Alert } from "@/components/admin/ui";
import { AdsManager } from "@/components/admin/ads-manager";
import { getAllAds, hasAdModel } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  const [ads, settings] = await Promise.all([getAllAds(), getSiteSettings()]);
  const modelReady = hasAdModel();
  const adsEnabled = settings?.adsEnabled ?? true;

  return (
    <AdminShell
      kicker="প্রচার"
      title="বিজ্ঞাপন"
      description="সাইটের বিভিন্ন স্লটে বিজ্ঞাপন যোগ করুন, চালু বা বন্ধ রাখুন।"
    >
      {!modelReady && (
        <Alert tone="warning" title="বিজ্ঞাপন মডিউল প্রস্তুত নয়">
          ডেটাবেস স্কিমা হালনাগাদ করতে <code className="adm-mono">npm run prisma:push</code>{" "}
          চালিয়ে সার্ভার পুনরায় চালু করুন।
        </Alert>
      )}
      <AdsManager ads={ads} adsEnabled={adsEnabled} />
    </AdminShell>
  );
}
