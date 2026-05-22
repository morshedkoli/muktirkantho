import Link from "next/link";
import { PostStatus } from "@prisma/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { getPostPath } from "@/lib/post-url";
import { prisma } from "@/lib/prisma";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Eye,
  CheckCircle,
  Clock,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: { category: true, district: true, upazila: true },
    orderBy: { updatedAt: "desc" },
  });

  const publishedCount = posts.filter(p => p.status === PostStatus.published).length;
  const draftCount = posts.filter(p => p.status === PostStatus.draft).length;

  return (
    <TooltipProvider>
      <AdminShell
        title="Manage Posts"
        description="Create, edit, publish and analyze all your articles."
        actions={
          <Button asChild variant="default" size="sm">
            <Link href="/admin/posts/create">
              <Plus className="h-4 w-4" />
              Create Post
            </Link>
          </Button>
        }
      >
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[
            { label: "Total Posts", value: posts.length, Icon: FileText, bg: "bg-[var(--ad-breaking)]/10", fg: "text-[var(--ad-breaking)]", bar: "bg-[var(--ad-breaking)]" },
            { label: "Published Articles", value: publishedCount, Icon: CheckCircle, bg: "bg-[var(--ad-success)]/10", fg: "text-[var(--ad-success)]", bar: "bg-[var(--ad-success)]" },
            { label: "Draft Publications", value: draftCount, Icon: Clock, bg: "bg-[var(--ad-border)]/45", fg: "text-[var(--ad-text-secondary)]", bar: "bg-[var(--ad-text-muted)]" },
          ].map((c) => {
            const Icon = c.Icon;
            return (
              <Card key={c.label} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${c.bar}`} />
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.fg} border border-transparent`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-[var(--ad-text-muted)] font-mono">{c.label}</p>
                    <p className="text-2xl font-black text-[var(--ad-text-primary)] leading-none mt-1.5 tracking-tight">{c.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-muted)] pointer-events-none" />
            <Input
              type="text"
              placeholder="Search posts by title or author..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-10 text-xs font-mono font-bold uppercase tracking-wider text-[var(--ad-text-secondary)]">
              <Filter className="h-3.5 w-3.5 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Posts - Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {posts.length === 0 ? (
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-[var(--ad-background)] rounded-full p-4">
                    <FileText className="h-8 w-8 text-[var(--ad-text-secondary)]" />
                  </div>
                  <div>
                    <p className="text-[var(--ad-text-primary)] font-bold">No posts found</p>
                    <p className="text-[var(--ad-text-secondary)] text-xs mt-1">Get started by creating your first post</p>
                  </div>
                  <Button asChild variant="default" size="sm">
                    <Link href="/admin/posts/create">
                      <Plus className="h-4 w-4" />
                      Create Post
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => {
              const live = post.status === PostStatus.published;
              return (
                <Card key={post.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-3.5 p-4">
                      {/* Thumbnail */}
                      <div className="h-16 w-20 rounded-lg bg-[var(--ad-background)] overflow-hidden shrink-0 border border-[var(--ad-border)]">
                        {post.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <FileText className="h-5 w-5 text-[var(--ad-text-secondary)]" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-bangla font-bold text-sm text-[var(--ad-text-primary)] line-clamp-2 leading-snug">
                          {post.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="success">
                            {post.category.name}
                          </Badge>
                          <Badge variant={live ? "success" : "warning"}>
                            <span className={`w-1 h-1 rounded-full mr-1 ${live ? "bg-[var(--ad-green)] animate-pulse" : "bg-[var(--ad-amber)]"}`} />
                            {live ? "Live" : "Draft"}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-[10px] text-[var(--ad-text-muted)] font-semibold uppercase tracking-wider">
                          {post.district.name} · {format(post.updatedAt, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5 border-t border-[var(--ad-border)] bg-[var(--ad-background)]/50 px-3.5 py-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                            <Link href={getPostPath(post)} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
                            <Link href={`/admin/posts/edit/${post.id}`}>
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>
                      <DeletePostButton postId={post.id} postTitle={post.title} />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
          {/* Mobile post count */}
          {posts.length > 0 && (
            <p className="text-center text-[10.5px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)] py-3 font-mono">
              Showing <span className="text-[var(--ad-text-primary)] font-extrabold">{posts.length}</span> posts
            </p>
          )}
        </div>

        {/* Posts - Desktop Table View */}
        <Card className="hidden lg:block overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[38%] pl-6">Article</TableHead>
                  <TableHead className="w-[14%]">Category</TableHead>
                  <TableHead className="w-[16%]">Location</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[10%]">Updated Date</TableHead>
                  <TableHead className="w-[10%] pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-[var(--ad-background)] rounded-full p-4">
                          <FileText className="h-8 w-8 text-[var(--ad-text-secondary)]" />
                        </div>
                        <div>
                          <p className="text-[var(--ad-text-primary)] font-bold">No posts found</p>
                          <p className="text-[var(--ad-text-secondary)] text-xs mt-1">Get started by creating your first post</p>
                        </div>
                        <Button asChild variant="default" size="sm">
                          <Link href="/admin/posts/create">
                            <Plus className="h-4 w-4" />
                            Create Post
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => {
                    const live = post.status === PostStatus.published;
                    return (
                      <TableRow key={post.id} className="group">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3.5">
                            <div className="h-10 w-14 rounded-lg bg-[var(--ad-background)] overflow-hidden shrink-0 border border-[var(--ad-border)] shadow-sm">
                              {post.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={post.imageUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-[var(--ad-text-secondary)]" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bangla font-bold text-[13px] text-[var(--ad-text-primary)] truncate max-w-sm group-hover:text-[var(--ad-primary)] transition-colors leading-normal">
                                {post.title}
                              </p>
                              <p className="text-[11.5px] text-[var(--ad-text-secondary)] mt-0.5 truncate max-w-xs leading-normal">
                                {post.excerpt.substring(0, 50)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">
                            {post.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-[12.5px] text-[var(--ad-text-secondary)] font-medium">
                            <p className="font-bold text-[var(--ad-text-primary)] font-bangla">{post.district.name}</p>
                            {post.upazila && (
                              <p className="text-[11px] text-[var(--ad-text-muted)] mt-0.5 font-bangla">{post.upazila.name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={live ? "success" : "warning"}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${live ? "bg-[var(--ad-green)] animate-pulse" : "bg-[var(--ad-amber)]"}`} />
                            {live ? "Live" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-[11px] font-bold text-[var(--ad-text-muted)]">
                          {format(post.updatedAt, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild variant="icon" size="icon" className="h-8 w-8 rounded-lg">
                                  <Link href={getPostPath(post)} target="_blank">
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild variant="icon" size="icon" className="h-8 w-8 rounded-lg">
                                  <Link href={`/admin/posts/edit/${post.id}`}>
                                    <Edit2 className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <DeletePostButton
                                    postId={post.id}
                                    postTitle={post.title}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>

          {/* Table Footer */}
          {posts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[var(--ad-border)] bg-[var(--ad-background)]/50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ad-text-muted)] font-mono">
                Showing <span className="text-[var(--ad-text-primary)] font-extrabold">{posts.length}</span> posts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-40 cursor-not-allowed bg-[var(--ad-card)]"
                >
                  Previous
                </Button>
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-40 cursor-not-allowed bg-[var(--ad-card)]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </AdminShell>
    </TooltipProvider>
  );
}

