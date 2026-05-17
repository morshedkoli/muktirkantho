import { AdSlot } from "@/components/public/ad-slot";
import { AD_PLACEMENTS } from "@/lib/ads";

export async function MobileAnchorAd() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--np-border)] bg-[var(--np-card)] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] lg:hidden">
      <div className="flex items-center justify-center py-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-label uppercase tracking-wider text-[var(--np-muted)]">Ad</span>
          <AdSlot placement={AD_PLACEMENTS.MOBILE_ANCHOR} showPlaceholder={false} />
        </div>
      </div>
      <style>{`
        @media (min-width: 1024px) {
          .fixed.bottom-0.left-0.right-0.z-40 {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
