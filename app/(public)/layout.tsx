import { Footer } from "@/components/public/footer";
import { Header } from "@/components/public/header";
import { Masthead } from "@/components/public/masthead";
import { MobileAnchorAd } from "@/components/public/mobile-anchor-ad";
import { AdSlot } from "@/components/public/ad-slot";
import { ThemeProvider } from "@/components/theme-provider";
import { BreakingTickerServer } from "@/components/public/breaking-ticker";
import { AD_PLACEMENTS } from "@/lib/ads";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <ThemeProvider>
        {/* Top identity bar: date | logo | social */}
        <Masthead />

        {/* Sticky navigation header */}
        <Header />

        {/* Breaking news ticker — shown on all public pages */}
        <BreakingTickerServer />

        {/* Page content */}
        <div className="flex-1 pb-[60px] lg:pb-0">
          {children}
        </div>

        <Footer />
        <MobileAnchorAd>
          <AdSlot placement={AD_PLACEMENTS.MOBILE_ANCHOR} showPlaceholder={false} />
        </MobileAnchorAd>
      </ThemeProvider>
    </div>
  );
}
