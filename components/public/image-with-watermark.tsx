import Image from "next/image";
import { SiteFavicon } from "./site-logo";

interface ImageWithWatermarkProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  showWatermark?: boolean;
  watermarkSize?: number;
}

export function ImageWithWatermark({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className = "",
  priority,
  showWatermark = true,
  watermarkSize = 40,
}: ImageWithWatermarkProps) {
  return (
    <div className="relative w-full h-full">
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={className}
          priority={priority}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={className}
          priority={priority}
        />
      )}
      
      {showWatermark && (
        <div className="absolute right-3 bottom-3 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-1.5">
            <SiteFavicon size={watermarkSize} />
          </div>
        </div>
      )}
    </div>
  );
}
