import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { MediaClient } from "./media-client";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const [posts, ads, settings] = await Promise.all([
    prisma.post.findMany({
      select: { id: true, title: true, imageUrl: true, imagePublicId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ad.findMany({
      select: { id: true, title: true, imageUrl: true, imagePublicId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findFirst({
      select: { logoUrl: true, iconUrl: true, faviconUrl: true },
    }),
  ]);

  const mediaItems = [
    ...posts.map((p) => ({ id: p.id, title: p.title, url: p.imageUrl, publicId: p.imagePublicId, source: "পোস্ট" as const, createdAt: p.createdAt })),
    ...ads.map((a) => ({ id: a.id, title: a.title, url: a.imageUrl, publicId: a.imagePublicId, source: "বিজ্ঞাপন" as const, createdAt: a.createdAt })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const siteImages = [
    settings?.logoUrl,
    settings?.iconUrl,
    settings?.faviconUrl,
  ].filter(Boolean) as string[];

  return (
    <AdminShell
      title="মিডিয়া"
      description="পোস্ট ও বিজ্ঞাপনে ব্যবহৃত সকল ছবির তালিকা।"
    >
      <MediaClient
        items={mediaItems}
        siteImages={siteImages}
        totalPosts={posts.length}
        totalAds={ads.length}
      />
    </AdminShell>
  );
}
