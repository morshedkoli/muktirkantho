import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validators";
import { makeSlug } from "@/lib/utils";
import { requireAdmin } from "@/lib/route-auth";
import { generatePostSeo } from "@/lib/seo";
import { getAuthUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { env } from "@/lib/env";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const district = searchParams.get("district");
  const upazila = searchParams.get("upazila");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status");
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "20", 10), 50);

  const where = {
    ...(category ? { category: { slug: category } } : {}),
    ...(district ? { district: { slug: district } } : {}),
    ...(upazila ? { upazila: { slug: upazila } } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(status ? { status: status as PostStatus } : {}),
  };

  const items = await prisma.post.findMany({
    where,
    include: { category: true, district: true, upazila: true },
    orderBy: { publishedAt: "desc" },
    skip: (Math.max(page, 1) - 1) * limit,
    take: limit,
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  const slug = makeSlug(payload.title);

  const created = await prisma.post.create({
    data: {
      ...payload,
      slug,
      upazilaId: payload.upazilaId || null,
      youtubeUrl: payload.youtubeUrl || null,
      publishedAt: payload.status === PostStatus.published ? new Date() : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
