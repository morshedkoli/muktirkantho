import { Footer } from "@/components/public/footer";
import { Header } from "@/components/public/header";
import { Masthead } from "@/components/public/masthead";
import { MobileAnchorAd } from "@/components/public/mobile-anchor-ad";
import { ThemeProvider } from "@/components/theme-provider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ThemeProvider>
        <Masthead />
        <Header />
        <div className="flex-1 pb-[60px] lg:pb-0">
          {children}
        </div>
        <Footer />
        <MobileAnchorAd />
      </ThemeProvider>
    </div>
  );
}
