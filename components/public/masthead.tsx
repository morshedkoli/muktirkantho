import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./site-logo";

export async function Masthead() {
  const settings = await getSiteSettings();
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  
  const banglaDate = new Intl.DateTimeFormat("bn-BD", dateOptions).format(today);
  const englishDate = new Intl.DateTimeFormat("en-US", dateOptions).format(today);

  return (
    <div className="border-b-4 border-double border-[var(--np-primary)] bg-[var(--np-card)] py-4">
      <div className="mx-auto max-w-7xl px-4">
        {/* Top bar with branding on left and date on right */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo on the left - slightly bigger */}
          <Link href="/" className="group">
            {settings?.logoUrl ? (
              <div className="w-[180px] sm:w-[220px]">
                <Image
                  src={settings.logoUrl}
                  alt="Muktir Kantho"
                  width={220}
                  height={56}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            ) : (
              <SiteLogo width={180} height={48} className="w-[180px] sm:w-[220px] h-auto" />
            )}
          </Link>

          {/* Date on the right */}
          <div className="flex items-center gap-3 text-sm text-[var(--np-text-secondary)]">
            <span className="font-medium">{englishDate}</span>
            <span className="hidden sm:inline text-[var(--np-border)]">|</span>
            <span className="font-medium text-[var(--np-primary)]">{banglaDate}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
