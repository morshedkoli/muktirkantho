export function SiteLogo({ className = "", width = 280, height = 80 }: { className?: string; width?: number; height?: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 350 100" // Adjusted for new layout
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Graphic Element (Left) */}
      <g transform="translate(45, 50)">
        {/* Sun Rays */}
        <g stroke="#FACC15" strokeWidth="2" strokeLinecap="round">
          {[...Array(12)].map((_, i) => (
            <line
              key={i}
              x1="0" y1="-32" x2="0" y2="-40"
              transform={`rotate(${i * 30})`}
            />
          ))}
        </g>

        {/* Red Sun */}
        <circle r="26" fill="#DC2626" />

        {/* Stylized Flag/Element (Simplified representation of the hand/flag) */}
        {/* Green shape representing the flag element */}
        <path
          d="M-5 15 L20 -25 L28 -20 L8 25 Z"
          fill="#15803D"
          stroke="white"
          strokeWidth="1"
        />
        <circle cx="20" cy="-18" r="4" fill="#DC2626" /> {/* Small red circle in flag */}
      </g>

      {/* Text Group (Right) */}
      <g transform="translate(100, 20)">
        {/* Small Top Text */}
        <text
          x="10"
          y="15"
          fontFamily="Hind Siliguri, sans-serif"
          fontSize="16"
          fontWeight="600"
          fill="currentColor"
          className="text-[var(--np-text-primary)]"
        >
          দৈনিক
        </text>

        {/* Main Text */}
        <text
          x="0"
          y="55"
          fontFamily="Hind Siliguri, sans-serif"
          fontSize="48"
          fontWeight="700"
          fill="currentColor"
          filter="url(#shadow)"
          className="text-[var(--np-text-primary)]"
        >
          মুক্তির কণ্ঠ
        </text>

        {/* Slogan Text */}
        <text
          x="80"
          y="80"
          fontFamily="Hind Siliguri, sans-serif"
          fontSize="14"
          fontWeight="500"
          fill="#DC2626"
          letterSpacing="1"
        >
          সত্যের পথে অবিচল
        </text>
      </g>
    </svg>
  );
}

export function SiteLogoLight({ className = "", width = 280, height = 80 }: { className?: string; width?: number; height?: number }) {
  return (
    <SiteLogo className={className} width={width} height={height} />
  );
}

export function SiteLogoDark({ className = "", width = 280, height = 80 }: { className?: string; width?: number; height?: number }) {
  // Use the same structure but force white/bright colors for dark mode text where needed
  // handled via currentColor class in main component for main text, but slogan is hardcoded red.
  // In dark mode, standard red is fine, or maybe lighter red.
  return (
    <SiteLogo className={className} width={width} height={height} />
  );
}

// Keep Icon and Favicon simple/derived
export function SiteIcon({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="32" r="30" fill="#DC2626" />
      {[...Array(12)].map((_, i) => (
        <line key={i} x1="32" y1="2" x2="32" y2="8" stroke="#FACC15" strokeWidth="2" transform={`rotate(${i * 30} 32 32)`} />
      ))}
      <path d="M20 40 L40 10 L48 14 L28 50 Z" fill="#15803D" stroke="white" strokeWidth="1" />
    </svg>
  );
}

export function SiteFavicon({ className = "", size = 32 }: { className?: string; size?: number }) {
  return <SiteIcon className={className} size={size} />;
}
