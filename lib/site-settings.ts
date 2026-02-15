import { prisma } from "@/lib/prisma";

const GLOBAL_KEY = "global";

export type SiteSettingsInput = {
  logoUrl?: string | null;
  logoPublicId?: string | null;
  iconUrl?: string | null;
  iconPublicId?: string | null;
  faviconUrl?: string | null;
  faviconPublicId?: string | null;
  contactAddress?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  adminName?: string | null;
  adminEmail?: string | null;
  adminPhone?: string | null;
  adminPasswordHash?: string | null;
  // Ads Global Setting
  adsEnabled?: boolean;
  // Facebook App Credentials
  facebookAppId?: string | null;
  facebookAppSecret?: string | null;
  // Facebook Integration
  facebookPageId?: string | null;
  facebookPageAccessToken?: string | null;
  facebookPageName?: string | null;
  facebookAutoPost?: boolean;
  facebookConnected?: boolean;
  facebookConnectedAt?: Date | null;
};

type SiteSettingsRecord = {
  logoUrl: string | null;
  logoPublicId: string | null;
  iconUrl: string | null;
  iconPublicId: string | null;
  faviconUrl: string | null;
  faviconPublicId: string | null;
  contactAddress: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  adminName: string | null;
  adminEmail: string | null;
  adminPhone: string | null;
  adminPasswordHash: string | null;
  // Ads Global Setting
  adsEnabled: boolean;
  // Facebook App Credentials
  facebookAppId: string | null;
  facebookAppSecret: string | null;
  // Facebook Integration
  facebookPageId: string | null;
  facebookPageAccessToken: string | null;
  facebookPageName: string | null;
  facebookAutoPost: boolean;
  facebookConnected: boolean;
  facebookConnectedAt: Date | null;
};

type SiteSettingDelegate = {
  findUnique: (args: { where: { key: string } }) => Promise<SiteSettingsRecord | null>;
  upsert: (args: {
    where: { key: string };
    update: SiteSettingsInput;
    create: { key: string } & SiteSettingsInput;
  }) => Promise<unknown>;
};

function getDelegate(): SiteSettingDelegate | null {
  const delegate = (prisma as unknown as { siteSetting?: SiteSettingDelegate }).siteSetting;
  return delegate ?? null;
}

export async function getSiteSettings() {
  const delegate = getDelegate();
  if (!delegate) return null;
  return delegate.findUnique({ where: { key: GLOBAL_KEY } });
}

export async function saveSiteSettings(input: SiteSettingsInput) {
  const delegate = getDelegate();
  if (!delegate) {
    throw new Error("SiteSetting model is unavailable. Run prisma generate after schema updates.");
  }

  return delegate.upsert({
    where: { key: GLOBAL_KEY },
    update: input,
    create: { key: GLOBAL_KEY, ...input },
  });
}
