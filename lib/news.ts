import { PostStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toInt } from "@/lib/utils";

export const POST_INCLUDE = {
  category: true,
  district: true,
  upazila: true,
} satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof POST_INCLUDE }>;

type SearchResult = {
  page: number;
  pages: number;
  total: number;
  items: PostWithRelations[];
  query: string;
};

export async function getHomeData() {
  const where = { status: PostStatus.published } as const;

  const [breaking, featured, latest, categories, divisions] = await Promise.all([
    prisma.post.findMany({
      where,
      include: POST_INCLUDE,
      take: 8,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.post.findMany({
      where: { ...where, featured: true },
      include: POST_INCLUDE,
      take: 6,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.post.findMany({
      where,
      include: POST_INCLUDE,
      take: 12,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.category.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
    prisma.division.findMany({
      orderBy: { name: "asc" },
      include: {
        districts: {
          orderBy: { name: "asc" },
          include: {
            upazilas: {
              orderBy: { name: "asc" },
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    }),
  ]);

  const tags = await prisma.post.findMany({
    where,
    select: { tags: true },
    take: 50,
    orderBy: { publishedAt: "desc" },
  });

  const trendingTags = [...new Set(tags.flatMap((item) => item.tags))].slice(0, 16);

  return { breaking, featured, latest, categories, divisions, trendingTags };
}

export async function getSidebarData() {
  const [categories, divisions] = await Promise.all([
    prisma.category.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
    prisma.division.findMany({
      orderBy: { name: "asc" },
      include: {
        districts: {
          orderBy: { name: "asc" },
          include: {
            upazilas: {
              orderBy: { name: "asc" },
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    }),
  ]);

  return { categories, divisions };
}

export async function getPublishedByCategory(categorySlug: string, page = 1, pageSize = 10) {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return null;

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where: { categoryId: category.id, status: PostStatus.published },
      include: POST_INCLUDE,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where: { categoryId: category.id, status: PostStatus.published } }),
  ]);

  return { category, items, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getLatestNews(page = 1, pageSize = 12) {
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: PostStatus.published },
      include: POST_INCLUDE,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where: { status: PostStatus.published } }),
  ]);

  return { items, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getPublishedByTag(tag: string, page = 1, pageSize = 10) {
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where: { tags: { has: tag }, status: PostStatus.published },
      include: POST_INCLUDE,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where: { tags: { has: tag }, status: PostStatus.published } }),
  ]);

  return { tag, items, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getPublishedByDistrict(districtSlug: string, page = 1, pageSize = 10) {
  const district = await prisma.district.findUnique({ where: { slug: districtSlug } });
  if (!district) return null;

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where: { districtId: district.id, status: PostStatus.published },
      include: POST_INCLUDE,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where: { districtId: district.id, status: PostStatus.published } }),
  ]);

  return { district, items, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getPublishedByUpazila(
  districtSlug: string,
  upazilaSlug: string,
  page = 1,
  pageSize = 10,
) {
  const district = await prisma.district.findUnique({ where: { slug: districtSlug } });
  if (!district) return null;

  const upazila = await prisma.upazila.findFirst({
    where: { districtId: district.id, slug: upazilaSlug },
  });
  if (!upazila) return null;

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where: { districtId: district.id, upazilaId: upazila.id, status: PostStatus.published },
      include: POST_INCLUDE,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({
      where: { districtId: district.id, upazilaId: upazila.id, status: PostStatus.published },
    }),
  ]);

  return {
    district,
    upazila,
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getSearchResults(query: string, pageParam: string | null): Promise<SearchResult> {
  const page = toInt(pageParam, 1);
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  const trimmed = query.trim();

  if (!trimmed) {
    return { page, pages: 1, total: 0, items: [], query: "" };
  }

  try {
    const [rawItems, rawCount] = await Promise.all([
      prisma.$runCommandRaw({
        aggregate: "Post",
        pipeline: [
          { $match: { $text: { $search: trimmed }, status: PostStatus.published } },
          { $addFields: { score: { $meta: "textScore" } } },
          { $sort: { score: -1, publishedAt: -1 } },
          { $skip: skip },
          { $limit: pageSize },
          { $project: { id: { $toString: "$_id" } } },
        ],
        cursor: {},
      }),
      prisma.$runCommandRaw({
        count: "Post",
        query: { $text: { $search: trimmed }, status: PostStatus.published },
      }),
    ]);

    const parsedItems = rawItems as { cursor?: { firstBatch?: Array<{ id: string }> } };
    const parsedCount = rawCount as { n?: number };
    const orderedIds = (parsedItems.cursor?.firstBatch ?? []).map((item) => item.id);
    const itemsRaw = orderedIds.length
      ? await prisma.post.findMany({
          where: { id: { in: orderedIds } },
          include: POST_INCLUDE,
        })
      : [];
    const itemMap = new Map(itemsRaw.map((item) => [item.id, item]));
    const items = orderedIds
      .map((id) => itemMap.get(id))
      .filter((item): item is PostWithRelations => Boolean(item));
    const total = Number(parsedCount.n ?? 0);

    return {
      page,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      total,
      items,
      query: trimmed,
    };
  } catch {
    // Falls back if text index has not been created yet.
  }

  const where: Prisma.PostWhereInput = {
    status: PostStatus.published,
    OR: [
      { title: { contains: trimmed, mode: "insensitive" } },
      { excerpt: { contains: trimmed, mode: "insensitive" } },
      { content: { contains: trimmed, mode: "insensitive" } },
      { tags: { has: trimmed.toLowerCase() } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: POST_INCLUDE,
      orderBy: { publishedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return { page, pages: Math.max(1, Math.ceil(total / pageSize)), total, items, query: trimmed };
}
