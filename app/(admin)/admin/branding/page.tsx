import { getSiteSettings } from "@/lib/site-settings";
import BrandingPageClient from "./page-client";

export const metadata = {
  title: "Branding & Logo",
  description: "Manage your site branding and logo",
};

export default async function BrandingPage() {
  const settings = await getSiteSettings();

  return <BrandingPageClient settings={settings || {}} />;
}
