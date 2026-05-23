import { AD_PLACEMENTS, getActiveAdsByPlacement, getAdPlacementMeta } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/cn";
import Image from "next/image";
import { Megaphone } from "lucide-react";

type AdSlotProps = {
  placement?: (typeof AD_PLACEMENTS)[keyof typeof AD_PLACEMENTS];
  className?: string;
  showPlaceholder?: boolean;
};

export async function AdSlot({
  placement = AD_PLACEMENTS.SIDEBAR_PRIMARY,
  className = "",
  showPlaceholder = true,
}: AdSlotProps) {
  // Check if ads are globally enabled
  const settings = await getSiteSettings();
  const adsEnabled = settings?.adsEnabled ?? true;

  // If ads are disabled globally, don't show anything
  if (!adsEnabled) {
    return null;
  }

  const ads = await getActiveAdsByPlacement(placement);

  if (!ads || ads.length === 0) {
    if (!showPlaceholder) return null;

    const meta = getAdPlacementMeta(placement);

    return (
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2",
            "border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50",
            meta.aspectClass,
          )}
        >
          <Megaphone className="h-6 w-6 text-zinc-300" />
          <div className="text-center">
            <p className="text-xs font-medium text-zinc-400">{meta.label}</p>
            <p className="text-xs text-zinc-300">{meta.dimensions}</p>
          </div>
        </div>
      </div>
    );
  }

  // Select first active ad
  const selectedAd = ads[0];

  const content = (
    <div className="group relative overflow-hidden rounded-lg">
      <Image
        src={selectedAd.imageUrl}
        alt={selectedAd.title}
        width={1200}
        height={400}
        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  return (
    <div className={cn(
      "rounded-xl border border-[var(--np-border)] bg-[var(--np-card)] p-3 shadow-[var(--np-shadow)] hover:shadow-[var(--np-shadow-lg)] transition-shadow",
      className,
    )}>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--np-text-secondary)]">
          Sponsored
        </span>
        <span className="text-[10px] text-[var(--np-text-secondary)] opacity-60">
          Ad
        </span>
      </div>
      {selectedAd.targetUrl ? (
        <a
          href={selectedAd.targetUrl}
          target="_blank"
          rel="noreferrer sponsored"
          className="block"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

// Server component wrapper to handle async
export function AdSlotWrapper(props: AdSlotProps) {
  return <AdSlot {...props} />;
}
