import type { Metadata } from "next";
import { Hind_Siliguri, Lora, Work_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteSettings } from "@/lib/site-settings";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  // Default SVG favicon as data URI
  const defaultFavicon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%231E3A8A'/%3E%3Crect x='13' y='8' width='6' height='11' rx='3' fill='white'/%3E%3Cpath d='M10 16C10 19.3137 12.6863 22 16 22C19.3137 22 22 19.3137 22 16' stroke='white' stroke-width='1.5' fill='none'/%3E%3Cline x1='16' y1='22' x2='16' y2='25' stroke='white' stroke-width='1.5'/%3E%3Cline x1='13' y1='25' x2='19' y2='25' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E`;
  
  const favicon = settings?.faviconUrl || defaultFavicon;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: "Muktir Kantho | মুক্তির কণ্ঠ",
      template: "%s | Muktir Kantho",
    },
    description: "Voice of Freedom - Regional newspaper with district and upazila coverage.",
    alternates: { canonical: "/" },
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      type: "website",
      title: "Muktir Kantho",
      description: "Regional newspaper with district and upazila coverage.",
      url: "/",
      siteName: "Muktir Kantho",
    },
    twitter: {
      card: "summary_large_image",
      title: "Muktir Kantho",
      description: "Regional newspaper with district and upazila coverage.",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${workSans.variable} ${lora.variable} ${hindSiliguri.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
