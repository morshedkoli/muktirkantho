import { getSiteSettings } from "@/lib/site-settings";
import { LoginForm } from "./login-form";

/**
 * Admin Login page — Server Component wrapper.
 *
 * Fetches site settings (logo URL + height) server-side so the
 * uploaded logo renders on first paint without a client-side fetch.
 * The interactive form is in LoginForm ("use client").
 */
export default async function AdminLoginPage() {
  let logoUrl: string | null = null;
  let logoHeight: number | null = null;

  try {
    const settings = await getSiteSettings();
    // Prefer the light-mode logo for the login page (neutral background).
    // Fall back to the icon (dark-mode logo) if no light logo is set.
    logoUrl = settings?.logoUrl ?? settings?.iconUrl ?? null;
    logoHeight = settings?.logoHeight ?? null;
  } catch {
    // If DB is unavailable, fall through to text-only branding.
  }

  return <LoginForm logoUrl={logoUrl} logoHeight={logoHeight} />;
}
