import { Image as ImageIcon, FileImage, Megaphone, Palette } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bnNumber } from "@/lib/bn-number";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatTile } from "@/components/admin/ui";
import { MediaClient, type MediaItem } from "./media-client";

export const dynamic = "force-dynamic";

function hasImage(url?: string | null): url is string {
  return typeof url === "string" && url.trim() !== "";
}

export default async function MediaPage() {
  const [posts, ads, settings] = await Promise.all([
    prisma.post.findMany({
      select: { id: true, imageUrl: true, imagePublicId: true, title: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ad
      .findMany({
        select: { id: true, imageUrl: true, imagePublicId: true, title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => []),
    prisma.siteSetting.findFirst().catch(() => null),
  ]);

  const items: MediaItem[] = [];

  for (const post of posts) {
    if (!hasImage(post.imageUrl)) continue;
    items.push({
      id: `post-${post.id}`,
      url: post.imageUrl,
      publicId: post.imagePublicId || "—",
      title: post.title,
      source: "post",
      createdAt: post.createdAt.toISOString(),
    });
  }

  for (const ad of ads) {
    if (!hasImage(ad.imageUrl)) continue;
    items.push({
      id: `ad-${ad.id}`,
      url: ad.imageUrl,
      publicId: ad.imagePublicId || "—",
      title: ad.title,
      source: "ad",
      createdAt: ad.createdAt.toISOString(),
    });
  }

  if (settings) {
    const brandAssets: { url?: string | null; publicId?: string | null; title: string }[] = [
      { url: settings.logoUrl, publicId: settings.logoPublicId, title: "সাইট লোগো" },
      { url: settings.iconUrl, publicId: settings.iconPublicId, title: "স্কয়ার আইকন" },
      { url: settings.faviconUrl, publicId: settings.faviconPublicId, title: "ফেভিকন" },
    ];
    for (const asset of brandAssets) {
      if (!hasImage(asset.url)) continue;
      items.push({
        id: `brand-${asset.title}`,
        url: asset.url,
        publicId: asset.publicId || "—",
        title: asset.title,
        source: "branding",
        createdAt: settings.updatedAt.toISOString(),
      });
    }
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const postCount = items.filter((i) => i.source === "post").length;
  const adCount = items.filter((i) => i.source === "ad").length;
  const brandCount = items.filter((i) => i.source === "branding").length;

  return (
    <AdminShell
      kicker="নিউজরুম"
      title="মিডিয়া লাইব্রেরি"
      description="পোস্ট, বিজ্ঞাপন ও ব্র্যান্ডিং থেকে আসা সব ছবি এক তালিকায়।"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="মোট ছবি" value={bnNumber(items.length)} icon={ImageIcon} />
        <StatTile
          label="সংবাদ ছবি"
          value={bnNumber(postCount)}
          tone="info"
          icon={FileImage}
        />
        <StatTile
          label="বিজ্ঞাপন ছবি"
          value={bnNumber(adCount)}
          tone="warning"
          icon={Megaphone}
        />
        <StatTile
          label="ব্র্যান্ড অ্যাসেট"
          value={bnNumber(brandCount)}
          tone="accent"
          icon={Palette}
        />
      </div>

      <MediaClient items={items} />
    </AdminShell>
  );
}
