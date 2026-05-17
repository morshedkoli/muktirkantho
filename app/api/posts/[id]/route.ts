import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { makeSlug } from "@/lib/utils";
import { requireAdmin } from "@/lib/route-auth";
import { deleteImage } from "@/lib/cloudinary";
import { isObjectId } from "@/lib/object-id";
import { generatePostSeo } from "@/lib/seo";
import { getAuthUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { env } from "@/lib/env";

type Context = { params: Promise<{ id: string }> };

async function resolveCurrentAuthor() {
  const [authUser, settings] = await Promise.all([getAuthUser(), getSiteSettings()]);
  return (
    settings?.adminName?.trim() ||
    settings?.adminEmail?.trim() ||
    authUser?.email?.trim() ||
    env.ADMIN_EMAIL ||
    "Admin"
  );
}

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  if (!isObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: Context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!isObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const author = await resolveCurrentAuthor();
  const seo = generatePostSeo(body?.title ?? "", body?.content ?? "");
  const parsed = postSchema.safeParse({
    ...body,
    author: (body?.author ?? "").toString().trim() || author,
    youtubeUrl: (body?.youtubeUrl ?? "").toString().trim() || undefined,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...payload,
      slug: makeSlug(payload.title),
      upazilaId: payload.upazilaId || null,
      youtubeUrl: payload.youtubeUrl || null,
      publishedAt: payload.status === PostStatus.published ? new Date() : null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Context) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  const method = formData.get("_method");
  if (method === "DELETE") {
    const result = await DELETE(request, { params });
    // If deletion failed, surface the error rather than blindly redirecting
    if (result.status !== 200) return result;
    return NextResponse.redirect(new URL("/admin/posts", request.url));
  }
  return NextResponse.json({ error: "Unsupported action" }, { status: 405 });
}
