import { AD_PLACEMENTS, getActiveAdsByPlacement } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";
import { AdSlot } from "@/components/public/ad-slot";
import { MobileAnchorAdShell } from "./mobile-anchor-ad-shell";

/**
 * Sticky bottom ad bar for small screens.
 *
 * Renders nothing at all when there is no anchor ad to show. Previously the bar
 * (label + dismiss button) mounted unconditionally and the layout reserved 60px
 * for it, so phones with no ad booked lost a strip of viewport to an empty box.
 */
export async function MobileAnchorAd() {
  const [settings, ads] = await Promise.all([
    getSiteSettings(),
    getActiveAdsByPlacement(AD_PLACEMENTS.MOBILE_ANCHOR),
  ]);

  if (!(settings?.adsEnabled ?? true) || ads.length === 0) return null;

  return (
    <MobileAnchorAdShell>
      <AdSlot placement={AD_PLACEMENTS.MOBILE_ANCHOR} showPlaceholder={false} />
    </MobileAnchorAdShell>
  );
}
