import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const AD_PLACEMENTS = {
  SIDEBAR_PRIMARY: "sidebar_primary",
  HOMEPAGE_BANNER: "homepage_banner",
  ARTICLE_INLINE: "article_inline",
  FOOTER_STRIP: "footer_strip",
  BILLBOARD: "billboard",
  SIDEBAR_STICKY: "sidebar_sticky",
  INFEED_NATIVE: "infeed_native",
  MOBILE_ANCHOR: "mobile_anchor",
} as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[keyof typeof AD_PLACEMENTS];

export const AD_PLACEMENT_OPTIONS: Array<{ value: AdPlacement; label: string }> = [
  { value: AD_PLACEMENTS.SIDEBAR_PRIMARY, label: "Sidebar (300x250)" },
  { value: AD_PLACEMENTS.HOMEPAGE_BANNER, label: "Homepage Banner (728x90)" },
  { value: AD_PLACEMENTS.ARTICLE_INLINE, label: "Article Inline (970x250)" },
  { value: AD_PLACEMENTS.FOOTER_STRIP, label: "Footer Strip (728x90)" },
  { value: AD_PLACEMENTS.BILLBOARD, label: "Billboard (970x250)" },
  { value: AD_PLACEMENTS.SIDEBAR_STICKY, label: "Sticky Sidebar (300x600)" },
  { value: AD_PLACEMENTS.INFEED_NATIVE, label: "In-feed Native" },
  { value: AD_PLACEMENTS.MOBILE_ANCHOR, label: "Mobile Anchor (320x50)" },
];

export function getAdPlacementLabel(placement: string) {
  return AD_PLACEMENT_OPTIONS.find((item) => item.value === placement)?.label ?? placement;
}

export interface AdPlacementMeta {
  key: string;
  label: string;
  dimensions: string;
  description: string;
  aspectClass: string;
}

export function getAdPlacementMeta(placement: string): AdPlacementMeta {
  const map: Record<string, AdPlacementMeta> = {
    [AD_PLACEMENTS.HOMEPAGE_BANNER]: {
      key: AD_PLACEMENTS.HOMEPAGE_BANNER,
      label: "হোমপেজ ব্যানার",
      dimensions: "728×90",
      description: "হোমপেজের শীর্ষে বড় ব্যানার বিজ্ঞাপন",
      aspectClass: "h-[90px]",
    },
    [AD_PLACEMENTS.SIDEBAR_PRIMARY]: {
      key: AD_PLACEMENTS.SIDEBAR_PRIMARY,
      label: "সাইডবার (প্রাথমিক)",
      dimensions: "300×250",
      description: "সাইডবারের মধ্যবর্তী বিজ্ঞাপন",
      aspectClass: "h-[250px]",
    },
    [AD_PLACEMENTS.ARTICLE_INLINE]: {
      key: AD_PLACEMENTS.ARTICLE_INLINE,
      label: "নিবন্ধ (ইনলাইন)",
      dimensions: "970×250",
      description: "নিবন্ধের মাঝখানে বিজ্ঞাপন",
      aspectClass: "h-[120px]",
    },
    [AD_PLACEMENTS.FOOTER_STRIP]: {
      key: AD_PLACEMENTS.FOOTER_STRIP,
      label: "ফুটার স্ট্রিপ",
      dimensions: "728×90",
      description: "ফুটারের উপরে বিজ্ঞাপন",
      aspectClass: "h-[90px]",
    },
    [AD_PLACEMENTS.BILLBOARD]: {
      key: AD_PLACEMENTS.BILLBOARD,
      label: "বিলবোর্ড",
      dimensions: "970×250",
      description: "বড় বিলবোর্ড বিজ্ঞাপন",
      aspectClass: "h-[120px]",
    },
    [AD_PLACEMENTS.SIDEBAR_STICKY]: {
      key: AD_PLACEMENTS.SIDEBAR_STICKY,
      label: "সাইডবার (স্টিকি)",
      dimensions: "300×600",
      description: "লম্বা স্টিকি সাইডবার বিজ্ঞাপন",
      aspectClass: "h-[300px]",
    },
    [AD_PLACEMENTS.INFEED_NATIVE]: {
      key: AD_PLACEMENTS.INFEED_NATIVE,
      label: "ইনফিড নেটিভ",
      dimensions: "Native",
      description: "কন্টেন্টের মধ্যে নেটিভ বিজ্ঞাপন",
      aspectClass: "h-[120px]",
    },
    [AD_PLACEMENTS.MOBILE_ANCHOR]: {
      key: AD_PLACEMENTS.MOBILE_ANCHOR,
      label: "মোবাইল অ্যাঙ্কর",
      dimensions: "320×50",
      description: "মোবাইলে নিচে ভাসমান বিজ্ঞাপন",
      aspectClass: "h-[50px]",
    },
  };
  return map[placement] ?? {
    key: placement,
    label: placement,
    dimensions: "—",
    description: "",
    aspectClass: "h-[90px]",
  };
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

// cache() deduplicates calls with the same placement key within a single render pass.
export const getActiveAdsByPlacement = cache(async function getActiveAdsByPlacement(
  placement: AdPlacement
) {
  const delegate = getAdDelegate();
  if (!delegate) return [];

  return delegate.findMany({
    where: { placement, isActive: true },
    orderBy: { createdAt: "desc" },
  });
});

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
