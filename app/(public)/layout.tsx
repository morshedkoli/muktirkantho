import { Footer } from "@/components/public/footer";
import { Header } from "@/components/public/header";
import { Masthead } from "@/components/public/masthead";
import { MobileAnchorAd } from "@/components/public/mobile-anchor-ad";
import { BreakingTickerServer } from "@/components/public/breaking-ticker";

// `ThemeProvider` already wraps the whole tree in the root layout — mounting a
// second one here just nested a duplicate context with no behavioural effect.

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top identity bar: date | logo | social */}
      <Masthead />

      {/* Sticky navigation header */}
      <Header />

      {/* Breaking news ticker — shown on all public pages */}
      <BreakingTickerServer />

      {/* Page content */}
      <div className="flex-1">{children}</div>

      <Footer />

      {/* Renders nothing (and reserves no space) unless an anchor ad exists. */}
      <MobileAnchorAd />
    </div>
  );
}
