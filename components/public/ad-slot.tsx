import { AD_PLACEMENTS, getActiveAdsByPlacement } from "@/lib/ads";
import { getSiteSettings } from "@/lib/site-settings";
import Image from "next/image";

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

    const placementLabels: Record<string, { label: string; size: string; aspectRatio: string }> = {
      [AD_PLACEMENTS.SIDEBAR_PRIMARY]: { 
        label: "Sidebar Ad", 
        size: "300x250",
        aspectRatio: "aspect-[6/5]"
      },
      [AD_PLACEMENTS.HOMEPAGE_BANNER]: { 
        label: "Homepage Banner", 
        size: "1200x220",
        aspectRatio: "aspect-[40/7]"
      },
      [AD_PLACEMENTS.ARTICLE_INLINE]: { 
        label: "Article Inline Ad", 
        size: "970x250",
        aspectRatio: "aspect-[4/1]"
      },
      [AD_PLACEMENTS.FOOTER_STRIP]: { 
        label: "Footer Strip Ad", 
        size: "1200x160",
        aspectRatio: "aspect-[15/2]"
      },
    };

    const config = placementLabels[placement] || { 
      label: "Advertisement", 
      size: "Flexible",
      aspectRatio: "aspect-video"
    };

    return (
      <div className={`rounded-xl border-2 border-dashed border-[var(--np-border)] bg-[var(--np-background)] p-4 text-center ${className}`}>
        <div className={`relative ${config.aspectRatio} mb-3 flex items-center justify-center rounded-lg border border-[var(--np-border)] bg-[var(--np-card)]`}>
          <span className="text-xs font-medium text-[var(--np-text-secondary)]">
            {config.label}
          </span>
        </div>
        <p className="text-xs text-[var(--np-text-secondary)]">{config.size} • Available for rent</p>
        <a 
          href="mailto:ads@muktirkantho.com" 
          className="mt-2 inline-block text-xs font-medium text-[var(--np-primary)] hover:underline"
        >
          Contact for advertising
        </a>
      </div>
    );
  }

  // Select first active ad (rotation handled at display time)
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
    <div className={`rounded-xl border border-[var(--np-border)] bg-[var(--np-card)] p-3 shadow-[var(--np-shadow)] hover:shadow-[var(--np-shadow-lg)] transition-shadow ${className}`}>
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
