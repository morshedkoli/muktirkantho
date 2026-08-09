/**
 * Merge divisions and districts that share a name.
 *
 * `slug` is unique on both models but `name` is not, and the geo seed upserts
 * by slug — so seeding চট্টগ্রাম once as `chittagong` and again as `chattogram`
 * produced two divisions with the same name, three duplicated districts split
 * across them, and a location filter that lists each twice.
 * `createDistrictAction` can produce the same thing by hand.
 *
 * Divisions are merged first so that districts land under a single parent
 * before they are compared. In both phases the children are moved to the
 * survivor and only then is the empty row deleted — nothing is deleted while
 * it still owns content.
 *
 * The seed was realigned to the surviving slugs, so re-running it will not
 * recreate what this removes.
 *
 *   node scripts/fix-duplicate-districts.mjs           # report only
 *   node scripts/fix-duplicate-districts.mjs --apply   # perform the merge
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

/**
 * Which row to keep.
 *
 * Posts decide it. A district that already has published articles owns a URL
 * that has been linked and indexed, and keeping the other row would break it
 * to preserve a slug nothing points at. Upazila count breaks a tie between two
 * post-less rows, then age.
 */
function pickSurvivor(rows) {
  return [...rows].sort(
    (a, b) =>
      b._count.posts - a._count.posts ||
      b._count.upazilas - a._count.upazilas ||
      a.createdAt.getTime() - b.createdAt.getTime(),
  )[0];
}

/** Group rows by trimmed name, keeping only the names that occur more than once. */
function duplicateGroups(rows) {
  const byName = new Map();
  for (const row of rows) {
    const key = row.name.trim();
    byName.set(key, [...(byName.get(key) ?? []), row]);
  }
  return [...byName.entries()].filter(([, group]) => group.length > 1);
}

/**
 * Collapse divisions sharing a name.
 *
 * No public route renders a division — the slug is invisible to readers — so
 * the survivor is simply the one already holding the most districts, which is
 * also the one the seed creates. Fewest rows to move, and a re-seed won't
 * mint a third.
 */
async function mergeDivisions() {
  const divisions = await prisma.division.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      _count: { select: { districts: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const duplicates = duplicateGroups(divisions);
  console.log(`${divisions.length} divisions, ${duplicates.length} duplicated by name.\n`);

  for (const [name, rows] of duplicates) {
    const survivor = [...rows].sort(
      (a, b) =>
        b._count.districts - a._count.districts ||
        a.createdAt.getTime() - b.createdAt.getTime(),
    )[0];

    console.log(`${name} (division) — ${rows.length} rows`);
    console.log(`  keep   ${survivor.slug} (${survivor._count.districts} districts)`);

    for (const loser of rows.filter((r) => r.id !== survivor.id)) {
      console.log(`  merge  ${loser.slug} (${loser._count.districts} districts)`);
      if (APPLY) {
        await prisma.district.updateMany({
          where: { divisionId: loser.id },
          data: { divisionId: survivor.id },
        });
        const left = await prisma.division.findUnique({
          where: { id: loser.id },
          select: { _count: { select: { districts: true } } },
        });
        if (left && left._count.districts > 0) {
          console.log(`      SKIPPED delete — still holds ${left._count.districts} districts`);
          continue;
        }
        await prisma.division.delete({ where: { id: loser.id } });
      }
      console.log(`      delete division ${loser.slug}`);
    }
    console.log("");
  }
}

async function mergeUpazilas(loser, survivor) {
  const survivorSlugs = new Map(
    (
      await prisma.upazila.findMany({
        where: { districtId: survivor.id },
        select: { id: true, slug: true },
      })
    ).map((u) => [u.slug, u.id]),
  );

  const upazilas = await prisma.upazila.findMany({
    where: { districtId: loser.id },
    select: { id: true, slug: true, name: true },
  });

  for (const upazila of upazilas) {
    const twin = survivorSlugs.get(upazila.slug);

    if (!twin) {
      // Free to move: the survivor has no upazila with this slug, so the
      // [districtId, slug] unique constraint is satisfied.
      console.log(`      move upazila ${upazila.name} (${upazila.slug})`);
      if (APPLY) {
        await prisma.upazila.update({
          where: { id: upazila.id },
          data: { districtId: survivor.id },
        });
      }
      continue;
    }

    console.log(`      merge upazila ${upazila.name} (${upazila.slug}) into the survivor's`);
    if (APPLY) {
      await prisma.post.updateMany({
        where: { upazilaId: upazila.id },
        data: { upazilaId: twin },
      });
      await prisma.upazila.delete({ where: { id: upazila.id } });
    }
  }
}

async function main() {
  await mergeDivisions();

  const districts = await prisma.district.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      divisionId: true,
      createdAt: true,
      _count: { select: { posts: true, upazilas: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const duplicates = duplicateGroups(districts);

  console.log(`${districts.length} districts, ${duplicates.length} duplicated by name.\n`);

  for (const [name, rows] of duplicates) {
    const survivor = pickSurvivor(rows);
    const losers = rows.filter((r) => r.id !== survivor.id);

    console.log(`${name} — ${rows.length} rows`);
    console.log(
      `  keep   ${survivor.slug} (${survivor._count.posts} posts, ${survivor._count.upazilas} upazilas)`,
    );

    for (const loser of losers) {
      console.log(
        `  merge  ${loser.slug} (${loser._count.posts} posts, ${loser._count.upazilas} upazilas)`,
      );

      await mergeUpazilas(loser, survivor);

      if (loser._count.posts > 0) {
        console.log(`      move ${loser._count.posts} post(s)`);
        if (APPLY) {
          await prisma.post.updateMany({
            where: { districtId: loser.id },
            data: { districtId: survivor.id },
          });
        }
      }

      // Re-read rather than trust the counts above: the moves just made are
      // what makes this safe, so confirm the row is actually empty first.
      if (APPLY) {
        const left = await prisma.district.findUnique({
          where: { id: loser.id },
          select: { _count: { select: { posts: true, upazilas: true } } },
        });
        if (!left) continue;
        if (left._count.posts > 0 || left._count.upazilas > 0) {
          console.log(
            `      SKIPPED delete — still holds ${left._count.posts} posts / ${left._count.upazilas} upazilas`,
          );
          continue;
        }
        await prisma.district.delete({ where: { id: loser.id } });
      }
      console.log(`      delete district ${loser.slug}`);
    }
    console.log("");
  }

  console.log(
    APPLY ? "Merge applied." : "Dry run — nothing was written. Re-run with --apply to perform it.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
