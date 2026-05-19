import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { TagsClient } from "./tags-client";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  // Fetch all posts and aggregate tags server-side
  const posts = await prisma.post.findMany({ select: { tags: true } });

  const countMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const t = tag.trim();
      if (t) countMap.set(t, (countMap.get(t) ?? 0) + 1);
    }
  }

  const tags = Array.from(countMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <AdminShell
      title="ট্যাগ"
      description="পোস্টের ট্যাগসমূহ পর্যালোচনা করুন।"
    >
      <TagsClient tags={tags} totalPosts={posts.length} />
    </AdminShell>
  );
}
