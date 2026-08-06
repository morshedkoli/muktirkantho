import { getSiteSettings } from "@/lib/site-settings";
import BrandingPageClient from "./page-client";

export const metadata = {
  title: "Branding & Logo",
  description: "Manage your site branding and logo",
};

/** Reads live site settings — prerendering would freeze the saved logo. */
export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const settings = await getSiteSettings();

  return <BrandingPageClient settings={settings || {}} />;
}
