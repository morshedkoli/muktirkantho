import { Footer } from "@/components/public/footer";
import { Header } from "@/components/public/header";
import { Masthead } from "@/components/public/masthead";
import { ThemeProvider } from "@/components/theme-provider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ThemeProvider>
        <Masthead />
        <Header />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </ThemeProvider>
    </div>
  );
}
