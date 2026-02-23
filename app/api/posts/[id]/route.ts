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

  const post = await prisma.post.delete({ where: { id } });
  if (post.imagePublicId) {
    await deleteImage(post.imagePublicId);
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Context) {
  const formData = await request.formData();
  const method = formData.get("_method");
  if (method === "DELETE") {
    await DELETE(request, { params });
    return NextResponse.redirect(new URL("/admin/posts", request.url));
  }
  return NextResponse.json({ error: "Unsupported action" }, { status: 405 });
}
