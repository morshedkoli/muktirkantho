/**
 * Regenerate slugs for posts still carrying a placeholder.
 *
 * The old generator dropped every non-Latin title, so Bangla posts fell back to
 * the literal "post" and were deduplicated into `post-2` … `post-37`. This
 * rebuilds those slugs from their titles and records the placeholder in
 * `slugHistory`, so the URLs already out in the world keep resolving — they
 * 308 to the new address instead of breaking.
 *
 *   node scripts/backfill-post-slugs.mjs           # report only
 *   node scripts/backfill-post-slugs.mjs --apply   # write the new slugs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const MAX_SLUG_LENGTH = 80;
const INVISIBLE = new RegExp("[\\u200B-\\u200F\\u2028\\u2029\\uFEFF]", "g");
const NON_WORD = /[^\p{L}\p{N}\p{M}]+/gu;

// A copy of lib/slug.ts, because a plain .mjs script cannot import the
// TypeScript module. It is a one-shot backfill, but if the real generator is
// ever changed, change it here too or the two will produce different slugs.
function truncateAtWord(slug, max) {
  if (slug.length <= max) return slug;
  const cut = slug.slice(0, max);
  const lastHyphen = cut.lastIndexOf("-");
  return lastHyphen > 0 ? cut.slice(0, lastHyphen) : slug;
}

function makeSlug(value) {
  const slug = (value ?? "")
    .normalize("NFC")
    .replace(INVISIBLE, "")
    .toLowerCase()
    .replace(NON_WORD, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return truncateAtWord(slug, MAX_SLUG_LENGTH);
}

function fallbackSlug(now = new Date()) {
  return `post-${now.toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 7)}`;
}

const isPlaceholder = (slug) => /^post(-\d+)?$/.test((slug ?? "").trim().toLowerCase());

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, slug: true, slugHistory: true },
    orderBy: { createdAt: "asc" },
  });

  // Every slug and every historical slug in play, so a regenerated slug cannot
  // collide with a live URL or with another post's redirect.
  const taken = new Set();
  for (const post of posts) {
    if (post.slug) taken.add(post.slug);
    for (const old of post.slugHistory ?? []) taken.add(old);
  }

  const targets = posts.filter((post) => isPlaceholder(post.slug) || !post.slug?.trim());
  console.log(`${posts.length} posts, ${targets.length} on placeholder slugs.\n`);

  if (targets.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  let changed = 0;
  for (const post of targets) {
    const base = makeSlug(post.title) || fallbackSlug();

    let candidate = base;
    let suffix = 2;
    while (taken.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    // The placeholder stays reachable: it is the address the article has been
    // published under until now.
    const history = [...new Set([...(post.slugHistory ?? []), post.slug].filter(Boolean))].filter(
      (entry) => entry !== candidate,
    );

    console.log(`${post.slug}`);
    console.log(`  ${post.title.slice(0, 64)}`);
    console.log(`  -> ${candidate}`);

    if (APPLY) {
      await prisma.post.update({
        where: { id: post.id },
        data: { slug: candidate, slugHistory: history },
      });
    }

    taken.delete(post.slug);
    taken.add(candidate);
    changed += 1;
  }

  console.log(
    `\n${changed} slug(s) ${APPLY ? "rewritten" : "would be rewritten"}.` +
      (APPLY ? "" : " Re-run with --apply to write them."),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
