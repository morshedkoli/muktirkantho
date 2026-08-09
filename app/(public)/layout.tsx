import { Footer } from "@/components/public/footer";
import { Header } from "@/components/public/header";
import { Masthead } from "@/components/public/masthead";
import { MobileAnchorAd } from "@/components/public/mobile-anchor-ad";
import { BreakingTickerServer } from "@/components/public/breaking-ticker";
import { ViewTracker } from "@/components/public/view-tracker";

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

      {/* Site-wide visit counting. Article pages mount their own tracker with
          the post id, which records the read as well as the page view — this
          one is skipped there so a single page load is not counted twice. */}
      <ViewTracker />
    </div>
  );
}
