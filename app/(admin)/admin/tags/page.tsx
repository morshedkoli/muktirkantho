import { AdminShell } from "@/components/admin/admin-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { prisma } from "@/lib/prisma";
import { TagsClient } from "./tags-client";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const posts = await prisma.post.findMany({
    select: { tags: true },
  });

  const tagCounts: Record<string, number> = {};
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed) {
          const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
          tagCounts[formatted] = (tagCounts[formatted] || 0) + 1;
        }
      });
    }
  });

  const tags = Object.entries(tagCounts)
    .map(([name, count]) => ({
      name,
      count,
      trend: "+0%",
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <AdminShell
          title="Tags"
          description="Manage and analyze news tags. Tags are automatically generated from your articles."
        >
          <TagsClient initialTags={tags} />
        </AdminShell>
      </div>
    </TooltipProvider>
  );
}
