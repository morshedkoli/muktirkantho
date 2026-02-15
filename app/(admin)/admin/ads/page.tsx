import { AdminShell } from "@/components/admin/admin-shell";
import { AdsManager } from "@/components/admin/ads-manager";
import { getAllAds, hasAdModel } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminAdsPage() {
  const [ads, settings] = await Promise.all([
    getAllAds(),
    getSiteSettings(),
  ]);
  const modelReady = hasAdModel();
  const adsEnabled = settings?.adsEnabled ?? true;

  return (
    <AdminShell
      title="Ads"
      description="Manage ads and publish them on website ad slots."
    >
      {!modelReady ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ads model is not ready. Run <code>npm run prisma:push</code> and restart the dev server.
        </p>
      ) : null}
      <AdsManager ads={ads} adsEnabled={adsEnabled} />
    </AdminShell>
  );
}
