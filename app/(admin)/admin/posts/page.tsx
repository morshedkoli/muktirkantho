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

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: { category: true, district: true, upazila: true },
    orderBy: { updatedAt: "desc" },
  });

  const publishedCount = posts.filter(p => p.status === PostStatus.published).length;
  const draftCount = posts.filter(p => p.status === PostStatus.draft).length;

  return (
    <AdminShell
      title="Manage Posts"
      description="Create, edit, and manage your news articles"
      actions={
        <Link
          href="/admin/posts/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--ad-primary)]/20 hover:bg-[var(--ad-primary-hover)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Post
        </Link>
      }
    >
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-[var(--ad-card)] p-5 shadow-[var(--ad-shadow)] border border-[var(--ad-border)]">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--ad-primary)] rounded-lg p-2.5 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-[var(--ad-text-secondary)]">Total Posts</p>
              <p className="text-2xl font-bold text-[var(--ad-text-primary)]">{posts.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-[var(--ad-card)] p-5 shadow-[var(--ad-shadow)] border border-[var(--ad-border)]">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--ad-success)] rounded-lg p-2.5 text-white">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-[var(--ad-text-secondary)]">Published</p>
              <p className="text-2xl font-bold text-[var(--ad-text-primary)]">{publishedCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-[var(--ad-card)] p-5 shadow-[var(--ad-shadow)] border border-[var(--ad-border)]">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--ad-warning)] rounded-lg p-2.5 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-[var(--ad-text-secondary)]">Drafts</p>
              <p className="text-2xl font-bold text-[var(--ad-text-primary)]">{draftCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ad-text-secondary)]" />
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] pl-10 pr-4 py-2.5 text-sm text-[var(--ad-text-primary)] outline-none focus:border-[var(--ad-primary)] focus:ring-2 focus:ring-[var(--ad-primary)]/20 transition-all placeholder:text-[var(--ad-text-secondary)]"
          />
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--ad-border)] bg-[var(--ad-card)] px-4 py-2.5 text-sm font-medium text-[var(--ad-text-primary)] hover:bg-[var(--ad-background)] transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Posts - Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {posts.length === 0 ? (
          <div className="rounded-xl bg-[var(--ad-card)] p-8 shadow-[var(--ad-shadow)] border border-[var(--ad-border)] text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-[var(--ad-background)] rounded-full p-4">
                <FileText className="h-8 w-8 text-[var(--ad-text-secondary)]" />
              </div>
              <div>
                <p className="text-[var(--ad-text-primary)] font-medium">No posts yet</p>
                <p className="text-[var(--ad-text-secondary)] text-sm mt-1">Get started by creating your first post</p>
              </div>
              <Link
                href="/admin/posts/create"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </Link>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
              <div className="flex gap-3 p-3">
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
                  <p className="font-semibold text-sm text-[var(--ad-text-primary)] line-clamp-2 leading-tight">
                    {post.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-[var(--ad-accent)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--ad-accent)]">
                      {post.category.name}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${post.status === "published"
                      ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)]"
                      : "bg-[var(--ad-warning)]/10 text-[var(--ad-warning)]"
                      }`}>
                      <span className={`h-1 w-1 rounded-full ${post.status === "published" ? "bg-[var(--ad-success)]" : "bg-[var(--ad-warning)]"}`} />
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-[var(--ad-text-secondary)]">
                    {post.district.name} · {format(post.updatedAt, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center justify-end gap-1 border-t border-[var(--ad-border)] bg-[var(--ad-background)] px-3 py-2">
                <Link
                  href={getPostPath(post)}
                  target="_blank"
                  className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-primary)] hover:bg-[var(--ad-primary)]/10 rounded-lg transition-all text-xs flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </Link>
                <Link
                  href={`/admin/posts/edit/${post.id}`}
                  className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-primary)] hover:bg-[var(--ad-primary)]/10 rounded-lg transition-all text-xs flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Link>
                <DeletePostButton postId={post.id} postTitle={post.title} />
              </div>
            </div>
          ))
        )}
        {/* Mobile post count */}
        {posts.length > 0 && (
          <p className="text-center text-xs text-[var(--ad-text-secondary)] py-2">
            Showing <span className="font-medium text-[var(--ad-text-primary)]">{posts.length}</span> posts
          </p>
        )}
      </div>

      {/* Posts - Desktop Table View */}
      <div className="hidden lg:block rounded-xl bg-[var(--ad-card)] shadow-[var(--ad-shadow)] border border-[var(--ad-border)] overflow-hidden">
        <div>
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-[var(--ad-background)] border-b border-[var(--ad-border)]">
              <tr>
                <th className="w-[34%] px-4 py-4 font-semibold text-[var(--ad-text-primary)] xl:px-6">Post</th>
                <th className="w-[14%] px-4 py-4 font-semibold text-[var(--ad-text-primary)] xl:px-6">Category</th>
                <th className="w-[16%] px-4 py-4 font-semibold text-[var(--ad-text-primary)] xl:px-6">Location</th>
                <th className="w-[12%] px-4 py-4 font-semibold text-[var(--ad-text-primary)] xl:px-6">Status</th>
                <th className="w-[12%] px-4 py-4 font-semibold text-[var(--ad-text-primary)] xl:px-6">Date</th>
                <th className="w-[12%] px-4 py-4 text-right font-semibold text-[var(--ad-text-primary)] xl:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ad-border)]">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-[var(--ad-background)] rounded-full p-4">
                        <FileText className="h-8 w-8 text-[var(--ad-text-secondary)]" />
                      </div>
                      <div>
                        <p className="text-[var(--ad-text-primary)] font-medium">No posts yet</p>
                        <p className="text-[var(--ad-text-secondary)] text-sm mt-1">Get started by creating your first post</p>
                      </div>
                      <Link
                        href="/admin/posts/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--ad-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ad-primary-hover)] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Create Post
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[var(--ad-background)] transition-colors group">
                    <td className="px-4 py-4 xl:px-6">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-16 rounded-lg bg-[var(--ad-background)] overflow-hidden shrink-0 border border-[var(--ad-border)]">
                          {post.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <FileText className="h-5 w-5 text-[var(--ad-text-secondary)]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--ad-text-primary)] truncate max-w-xs group-hover:text-[var(--ad-primary)] transition-colors">
                            {post.title}
                          </p>
                          <p className="text-xs text-[var(--ad-text-secondary)] mt-1 truncate max-w-xs">
                            {post.excerpt.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 xl:px-6">
                      <span className="inline-flex items-center rounded-full bg-[var(--ad-accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--ad-accent)]">
                        {post.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 xl:px-6">
                      <div className="text-sm text-[var(--ad-text-secondary)]">
                        <p>{post.district.name}</p>
                        {post.upazila && (
                          <p className="text-xs text-[var(--ad-text-secondary)] mt-0.5">{post.upazila.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 xl:px-6">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${post.status === "published"
                        ? "bg-[var(--ad-success)]/10 text-[var(--ad-success)]"
                        : "bg-[var(--ad-warning)]/10 text-[var(--ad-warning)]"
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${post.status === "published" ? "bg-[var(--ad-success)]" : "bg-[var(--ad-warning)]"
                          }`} />
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[var(--ad-text-secondary)] xl:px-6">
                      {format(post.updatedAt, "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-4 xl:px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={getPostPath(post)}
                          target="_blank"
                          className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-primary)] hover:bg-[var(--ad-primary)]/10 rounded-lg transition-all"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/posts/edit/${post.id}`}
                          className="p-2 text-[var(--ad-text-secondary)] hover:text-[var(--ad-primary)] hover:bg-[var(--ad-primary)]/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <DeletePostButton
                          postId={post.id}
                          postTitle={post.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {posts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[var(--ad-border)] bg-[var(--ad-background)]">
            <p className="text-sm text-[var(--ad-text-secondary)]">
              Showing <span className="font-medium text-[var(--ad-text-primary)]">{posts.length}</span> posts
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1.5 text-sm font-medium text-[var(--ad-text-secondary)] border border-[var(--ad-border)] rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled
                className="px-3 py-1.5 text-sm font-medium text-[var(--ad-text-secondary)] border border-[var(--ad-border)] rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
