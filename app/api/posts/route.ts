import { NextResponse } from "next/server";
import { PostStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { makeSlug } from "@/lib/utils";
import { limitPublicRequest, requireAdmin } from "@/lib/route-auth";
import { parsePostBody } from "@/lib/post-payload";
import { getAuthUser } from "@/lib/auth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function toPositiveInt(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export async function GET(request: Request) {
  // Basic IP-based rate limiting to prevent scraping/enumeration
  const limited = limitPublicRequest(request, "api:posts");
  if (limited) return limited;

  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const district = searchParams.get("district");
  const upazila = searchParams.get("upazila");
  const tag = searchParams.get("tag");
  const page = toPositiveInt(searchParams.get("page"), 1);
  const limit = toPositiveInt(searchParams.get("limit"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

  // Drafts are admin-only. Anonymous callers are pinned to published posts no
  // matter what `status` they ask for, so this endpoint can't leak unpublished
  // work. An authenticated admin may filter by any valid status.
  const requestedStatus = searchParams.get("status");
  const isAdmin = Boolean(await getAuthUser());
  let status: PostStatus | undefined = PostStatus.published;
  if (isAdmin) {
    status =
      requestedStatus && requestedStatus in PostStatus
        ? (requestedStatus as PostStatus)
        : undefined;
  }

  const where: Prisma.PostWhereInput = {
    ...(category ? { category: { slug: category } } : {}),
    ...(district ? { district: { slug: district } } : {}),
    ...(upazila ? { upazila: { slug: upazila } } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(status ? { status } : {}),
  };

  try {
    const items = await prisma.post.findMany({
      where,
      include: { category: true, district: true, upazila: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("[GET /api/posts] DB query failed:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

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
    const created = await prisma.post.create({
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
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("[POST /api/posts] DB create failed:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
