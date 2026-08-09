import type { MetadataRoute } from "next";
import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getEncodedPostPath } from "@/lib/post-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [posts, categories, districts] = await Promise.all([
    prisma.post.findMany({ where: { status: PostStatus.published }, select: { id: true, slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.district.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.6 },
    ...posts.map((post) => ({
      // Percent-encoded: a sitemap carries raw URL strings, and Bangla slugs
      // have to be escaped to be valid ones.
      url: `${base}${getEncodedPostPath(post)}`,
      lastModified: post.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...districts.map((district) => ({
      url: `${base}/district/${district.slug}`,
      lastModified: district.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
