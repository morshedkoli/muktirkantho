import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [posts, categories, districts] = await Promise.all([
    prisma.post.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.district.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.6 },
    ...posts.map((post) => ({
      url: `${base}/news/${post.slug}`,
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
