import { SiteFavicon } from "./site-logo";

interface WatermarkProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function ImageWatermark({ size = "md", showText = true }: WatermarkProps) {
  const sizes = {
    sm: { icon: 16, padding: "px-1.5 py-1", text: "text-[9px]", gap: "gap-1", url: "text-[7px]" },
    md: { icon: 20, padding: "px-2 py-1", text: "text-[10px]", gap: "gap-1", url: "text-[8px]" },
    lg: { icon: 24, padding: "px-2.5 py-1.5", text: "text-xs", gap: "gap-1.5", url: "text-[9px]" },
  };

  const s = sizes[size];

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-md shadow-md border border-white/30 ${s.padding} flex items-center ${s.gap}`}>
      <SiteFavicon size={s.icon} />
      {showText && (
        // Fixed colours, not theme tokens: this pill is always a light chip on
        // top of a photo, so it reads the same in both themes. The navy it used
        // to carry appeared nowhere else in the brand.
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-[#17171a] ${s.text}`}>মুক্তির কণ্ঠ</span>
          <span className={`font-medium text-[#bf4046] ${s.url}`}>muktirkantho.com</span>
        </div>
      )}
    </div>
  );
}

export function ImageWatermarkSimple({ size = 20 }: { size?: number }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-md shadow-md border border-white/30 p-1">
      <SiteFavicon size={size} />
    </div>
  );
}
