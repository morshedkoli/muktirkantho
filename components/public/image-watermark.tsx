import Image from "next/image";
import { getBranding, SITE_NAME } from "@/lib/branding";

interface WatermarkProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const SIZES = {
  sm: { icon: 16, padding: "px-1.5 py-1", text: "text-[9px]", gap: "gap-1", url: "text-[7px]" },
  md: { icon: 20, padding: "px-2 py-1", text: "text-[10px]", gap: "gap-1", url: "text-[8px]" },
  lg: { icon: 24, padding: "px-2.5 py-1.5", text: "text-xs", gap: "gap-1.5", url: "text-[9px]" },
} as const;

const CHIP =
  "bg-white/90 backdrop-blur-sm rounded-md shadow-md border border-white/30 flex items-center";

/**
 * The credit chip stamped onto article imagery.
 *
 * The icon is whatever the admin uploaded — it used to be a hardcoded SVG, so
 * every photo on the site carried a mark that no amount of uploading could
 * change. With no icon uploaded the chip falls back to type alone, and the
 * icon-only variant renders nothing rather than an empty white square.
 */
export async function ImageWatermark({ size = "md", showText = true }: WatermarkProps) {
  const { faviconUrl } = await getBranding();
  const s = SIZES[size];

  if (!faviconUrl && !showText) return null;

  return (
    <div className={`${CHIP} ${s.padding} ${s.gap}`}>
      {faviconUrl && (
        <Image src={faviconUrl} alt="" width={s.icon} height={s.icon} className="shrink-0" />
      )}
      {showText && (
        // Fixed colours, not theme tokens: this pill is always a light chip on
        // top of a photo, so it reads the same in both themes. The navy it used
        // to carry appeared nowhere else in the brand.
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-[#17171a] ${s.text}`}>{SITE_NAME}</span>
          <span className={`font-medium text-[#bf4046] ${s.url}`}>muktirkantho.com</span>
        </div>
      )}
    </div>
  );
}

export async function ImageWatermarkSimple({ size = 20 }: { size?: number }) {
  const { faviconUrl } = await getBranding();
  if (!faviconUrl) return null;

  return (
    <div className={`${CHIP} p-1`}>
      <Image src={faviconUrl} alt="" width={size} height={size} />
    </div>
  );
}
