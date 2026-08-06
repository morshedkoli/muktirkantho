import { Hash, FileText, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bnNumber } from "@/lib/bn-number";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatTile } from "@/components/admin/ui";
import { TagsClient, type TagItem } from "./tags-client";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const posts = await prisma.post.findMany({ select: { tags: true } });

  /* Tags are stored verbatim on the post and the public /tag route matches on
     that exact string, so they are counted as-is — title-casing them here
     produced links that resolved to nothing. */
  const counts = new Map<string, number>();
  let tagged = 0;

  for (const post of posts) {
    const unique = new Set(
      (post.tags ?? []).map((tag) => tag.trim()).filter(Boolean)
    );
    if (unique.size > 0) tagged += 1;
    for (const tag of unique) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const tags: TagItem[] = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const averagePerPost = tagged > 0
    ? Math.round(tags.reduce((sum, t) => sum + t.count, 0) / tagged)
    : 0;

  return (
    <AdminShell
      kicker="নিউজরুম"
      title="ট্যাগ"
      description="পোস্টে ব্যবহৃত সব ট্যাগ ও তাদের প্রয়োগ। ট্যাগ পোস্ট সম্পাদনার সময় যোগ হয়।"
    >
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <StatTile label="মোট ট্যাগ" value={bnNumber(tags.length)} icon={Hash} />
        <StatTile
          label="ট্যাগযুক্ত পোস্ট"
          value={bnNumber(tagged)}
          hint={`মোট ${bnNumber(posts.length)}টির মধ্যে`}
          tone="info"
          icon={FileText}
        />
        <StatTile
          label="গড় ট্যাগ"
          value={bnNumber(averagePerPost)}
          hint="প্রতি পোস্টে"
          icon={Layers}
        />
      </div>

      <TagsClient tags={tags} />
    </AdminShell>
  );
}
