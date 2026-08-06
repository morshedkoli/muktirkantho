import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export type InboxItem = {
  id: string;
  kind: "comments" | "drafts" | "spam";
  count: number;
  href: string;
};

/**
 * What actually needs an editor's attention right now.
 *
 * The header badge is driven by this and nothing else — a notification bell
 * that invents its own items is worse than no bell, because people learn to
 * ignore it. Every entry here maps to a real queue with a real destination.
 */
export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const [pendingComments, spamComments, drafts] = await Promise.all([
      prisma.comment.count({ where: { status: "pending" } }).catch(() => 0),
      prisma.comment.count({ where: { status: "spam" } }).catch(() => 0),
      prisma.post.count({ where: { status: PostStatus.draft } }).catch(() => 0),
    ]);

    const candidates: InboxItem[] = [
      { id: "comments", kind: "comments", count: pendingComments, href: "/admin/comments" },
      { id: "spam", kind: "spam", count: spamComments, href: "/admin/comments" },
      { id: "drafts", kind: "drafts", count: drafts, href: "/admin/posts" },
    ];
    const items = candidates.filter((item) => item.count > 0);

    return NextResponse.json({ items });
  } catch {
    // A degraded bell is fine; a 500 in the shell is not.
    return NextResponse.json({ items: [] });
  }
}
