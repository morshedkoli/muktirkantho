import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

function makeBaseSlug(title, id) {
  const titleSlug = slugify(title ?? "", {
    lower: true,
    strict: true,
    trim: true,
  });

  if (titleSlug) {
    return titleSlug;
  }

  return `post-${String(id).slice(-6).toLowerCase()}`;
}

function nextUniqueSlug(base, usedSlugs) {
  if (!usedSlugs.has(base)) {
    return base;
  }

  let suffix = 2;
  while (usedSlugs.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: "asc" },
  });

  const usedSlugs = new Set(
    posts
      .map((post) => post.slug?.trim())
      .filter((slug) => Boolean(slug)),
  );

  const targets = posts.filter((post) => !post.slug || !post.slug.trim());

  if (!targets.length) {
    console.log("No empty post slugs found.");
    return;
  }

  let updated = 0;
  for (const post of targets) {
    const base = makeBaseSlug(post.title, post.id);
    const slug = nextUniqueSlug(base, usedSlugs);

    await prisma.post.update({
      where: { id: post.id },
      data: { slug },
    });

    usedSlugs.add(slug);
    updated += 1;
    console.log(`Updated ${post.id} -> ${slug}`);
  }

  console.log(`Done. Updated ${updated} post slug(s).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
