import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";
import { requireAdmin } from "@/lib/route-auth";
import { deleteImage } from "@/lib/cloudinary";
import { isObjectId } from "@/lib/object-id";
import { parsePostBody } from "@/lib/post-payload";
import { getAuthUser } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Drafts are only visible to a signed-in admin; everyone else gets a 404 so
  // the endpoint doesn't confirm that an unpublished post exists.
  if (post.status !== PostStatus.published && !(await getAuthUser())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: Context) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!isObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = await parsePostBody(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  try {
    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...payload,
        slug: makeSlug(payload.title),
        excerpt: payload.excerpt ?? payload.metaDescription,
        imageUrl: payload.imageUrl || null,
        imagePublicId: payload.imagePublicId || null,
        upazilaId: payload.upazilaId || null,
        youtubeUrl: payload.youtubeUrl || null,
        publishedAt: payload.status === PostStatus.published ? new Date() : null,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/posts/:id] DB update failed:", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!isObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let post;
  try {
    post = await prisma.post.delete({ where: { id } });
  } catch (err) {
    console.error("[DELETE /api/posts/:id] DB delete failed:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }

  // Image cleanup is best-effort: log failure but don't surface it to the caller
  // since the DB record is already gone.
  if (post.imagePublicId) {
    try {
      await deleteImage(post.imagePublicId);
    } catch (err) {
      console.error("[DELETE /api/posts/:id] Cloudinary cleanup failed for", post.imagePublicId, err);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Context) {
  const formData = await request.formData();
  if (formData.get("_method") !== "DELETE") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 405 });
  }

  // `request` is forwarded only for its method/headers — DELETE reads no body.
  const result = await DELETE(request, { params });
  // If deletion failed, surface the error rather than blindly redirecting
  if (result.status !== 200) return result;
  return NextResponse.redirect(new URL("/admin/posts", request.url));
}
