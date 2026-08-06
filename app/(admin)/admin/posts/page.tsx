import Link from "next/link";
import { PostStatus } from "@prisma/client";
import { PenSquare, FileText, CheckCircle2, Clock, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPostPath } from "@/lib/post-url";
import { bnNumber, bnCount } from "@/lib/bn-number";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatTile } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { PostsBrowser, type PostRow } from "./posts-browser";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const [posts, categories] = await Promise.all([
    // Projected to exactly the columns `PostRow` needs. A bare `include` here
    // returned whole documents — every article's full markdown `content`, for
    // every post in the collection — to build a table that never shows the body.
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        imageUrl: true,
        status: true,
        featured: true,
        categoryId: true,
        viewCount: true,
        updatedAt: true,
        category: { select: { name: true } },
        district: { select: { name: true } },
        upazila: { select: { name: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const publishedCount = posts.filter((p) => p.status === PostStatus.published).length;
  const draftCount = posts.length - publishedCount;
  const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);

  // Dates cross the server/client boundary as ISO strings.
  const rows: PostRow[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.excerpt.length > 90 ? `${post.excerpt.slice(0, 90)}…` : post.excerpt,
    imageUrl: post.imageUrl,
    status: post.status === PostStatus.published ? "published" : "draft",
    featured: post.featured,
    category: post.category?.name ?? "—",
    categoryId: post.categoryId,
    district: post.district?.name ?? "—",
    upazila: post.upazila?.name ?? null,
    viewCount: post.viewCount,
    updatedAt: post.updatedAt.toISOString(),
    publicPath: getPostPath(post),
  }));

  return (
    <AdminShell
      kicker="নিউজরুম"
      title="পোস্ট ব্যবস্থাপনা"
      description="সব সংবাদ এক জায়গায় — খুঁজুন, সম্পাদনা করুন, প্রকাশ করুন।"
      actions={
        <Button asChild>
          <Link href="/admin/posts/create">
            <PenSquare className="h-4 w-4" />
            নতুন পোস্ট
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="মোট পোস্ট" value={bnNumber(posts.length)} icon={FileText} />
        <StatTile
          label="প্রকাশিত"
          value={bnNumber(publishedCount)}
          tone="success"
          icon={CheckCircle2}
        />
        <StatTile
          label="খসড়া"
          value={bnNumber(draftCount)}
          tone="warning"
          icon={Clock}
        />
        <StatTile label="মোট পাঠ" value={bnCount(totalViews)} tone="info" icon={Eye} />
      </div>

      <PostsBrowser
        posts={rows}
        categories={categories}
      />
    </AdminShell>
  );
}
