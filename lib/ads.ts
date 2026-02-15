import { prisma } from "@/lib/prisma";

export const AD_PLACEMENTS = {
  SIDEBAR_PRIMARY: "sidebar_primary",
  HOMEPAGE_BANNER: "homepage_banner",
  ARTICLE_INLINE: "article_inline",
  FOOTER_STRIP: "footer_strip",
} as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[keyof typeof AD_PLACEMENTS];

export const AD_PLACEMENT_OPTIONS: Array<{ value: AdPlacement; label: string }> = [
  { value: AD_PLACEMENTS.SIDEBAR_PRIMARY, label: "Sidebar (300x250)" },
  { value: AD_PLACEMENTS.HOMEPAGE_BANNER, label: "Homepage Banner" },
  { value: AD_PLACEMENTS.ARTICLE_INLINE, label: "Article Inline" },
  { value: AD_PLACEMENTS.FOOTER_STRIP, label: "Footer Strip" },
];

export function getAdPlacementLabel(placement: string) {
  return AD_PLACEMENT_OPTIONS.find((item) => item.value === placement)?.label ?? placement;
}

type AdRecord = {
  id: string;
  title: string;
  placement: string;
  imageUrl: string;
  imagePublicId: string;
  targetUrl: string | null;
  isActive: boolean;
  createdAt: Date;
};

type AdDelegate = {
  findMany: (args: { where?: { placement?: string; isActive?: boolean }; orderBy: { createdAt: "desc" } }) => Promise<AdRecord[]>;
  findFirst: (args: { where: { placement: string; isActive: boolean }; orderBy: { createdAt: "desc" } }) => Promise<AdRecord | null>;
  create: (args: {
    data: {
      title: string;
      placement: string;
      imageUrl: string;
      imagePublicId: string;
      targetUrl: string | null;
      isActive: boolean;
    };
  }) => Promise<AdRecord>;
  update: (args: { where: { id: string }; data: { isActive: boolean } }) => Promise<AdRecord>;
  delete: (args: { where: { id: string } }) => Promise<AdRecord>;
};

function getAdDelegate(): AdDelegate | null {
  const delegate = (prisma as unknown as { ad?: AdDelegate }).ad;
  return delegate ?? null;
}

export function hasAdModel() {
  return Boolean(getAdDelegate());
}

export async function getAllAds() {
  const delegate = getAdDelegate();
  if (!delegate) return [];
  return delegate.findMany({ where: {}, orderBy: { createdAt: "desc" } });
}

export async function getActiveAd(placement: AdPlacement) {
  const delegate = getAdDelegate();
  if (!delegate) return null;

  return delegate.findFirst({
    where: { placement, isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveAdsByPlacement(placement: AdPlacement) {
  const delegate = getAdDelegate();
  if (!delegate) return [];

  return delegate.findMany({
    where: { placement, isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAd(input: {
  title: string;
  placement: string;
  imageUrl: string;
  imagePublicId: string;
  targetUrl: string | null;
  isActive: boolean;
}) {
  const delegate = getAdDelegate();
  if (!delegate) return null;
  return delegate.create({ data: input });
}

export async function setAdStatus(adId: string, isActive: boolean) {
  const delegate = getAdDelegate();
  if (!delegate) return null;
  return delegate.update({ where: { id: adId }, data: { isActive } });
}

export async function removeAd(adId: string) {
  const delegate = getAdDelegate();
  if (!delegate) return null;
  return delegate.delete({ where: { id: adId } });
}
