import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./site-logo";

export async function Masthead() {
  const settings = await getSiteSettings();
  const today = new Date();

  const banglaDate = new Intl.DateTimeFormat("bn-BD", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(today);

  const englishDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(today);

  const lightLogoUrl = settings?.logoUrl ?? null;
  const darkLogoUrl = settings?.iconUrl ?? null;   // iconUrl is the dark-mode logo
  const hasBothLogos = Boolean(lightLogoUrl && darkLogoUrl);
  const hasAnyLogo = Boolean(lightLogoUrl || darkLogoUrl);

  return (
    <div className="border-b-4 border-double border-[var(--np-primary)] bg-[var(--np-card)] py-3 sm:py-4">
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">

          {/* Logo — CSS switches which image is visible based on data-theme */}
          <Link href="/" className="group shrink-0">
            {hasAnyLogo ? (
              <>
                {/* Light-mode logo: visible by default, hidden when [data-theme=dark] */}
                {lightLogoUrl && (
                  <div className={hasBothLogos ? "logo-light w-[150px] sm:w-[220px]" : "w-[150px] sm:w-[220px]"}>
                    <Image
                      src={lightLogoUrl}
                      alt="Muktir Kantho"
                      width={220}
                      height={56}
                      className="h-auto w-full object-contain"
                      priority
                    />
                  </div>
                )}
                {/* Dark-mode logo: hidden by default, shown when [data-theme=dark] */}
                {hasBothLogos && darkLogoUrl && (
                  <div className="logo-dark w-[150px] sm:w-[220px]">
                    <Image
                      src={darkLogoUrl}
                      alt="Muktir Kantho"
                      width={220}
                      height={56}
                      className="h-auto w-full object-contain"
                      priority
                    />
                  </div>
                )}
                {/* Only dark logo uploaded, no light logo */}
                {!lightLogoUrl && darkLogoUrl && (
                  <div className="w-[150px] sm:w-[220px]">
                    <Image
                      src={darkLogoUrl}
                      alt="Muktir Kantho"
                      width={220}
                      height={56}
                      className="h-auto w-full object-contain"
                      priority
                    />
                  </div>
                )}
              </>
            ) : (
              <SiteLogo width={180} height={48} className="w-[150px] sm:w-[220px] h-auto" />
            )}
          </Link>

          {/* Date strip */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs sm:text-sm text-[var(--np-text-secondary)]">
            <span className="font-medium">{englishDate}</span>
            <span className="hidden sm:inline text-[var(--np-border)]">|</span>
            <span className="font-medium text-[var(--np-primary)]">{banglaDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
