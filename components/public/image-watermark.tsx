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
        <div className="flex flex-col leading-none">
          <span className={`font-bold text-[#1E3A8A] ${s.text}`}>
            মুক্তির কণ্ঠ
          </span>
          <span className={`text-[#DC2626] font-medium ${s.url}`}>
            muktirkantho.com
          </span>
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
