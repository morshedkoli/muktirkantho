/**
 * Add the new DailyStat counters to rows written before they existed.
 *
 * MongoDB has no schema, so adding a required field to the Prisma model does
 * not add it to documents already in the collection — and Prisma refuses to
 * deserialize a document that is missing a required field. Without this, the
 * analytics page would fail to read the very days it is meant to report on.
 *
 * `$set` with `$exists: false` on each field, so the script is idempotent and
 * never overwrites a counter that has already been counting.
 *
 *   node scripts/backfill-daily-stats.mjs           # report only
 *   node scripts/backfill-daily-stats.mjs --apply   # write the zeros
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const NEW_FIELDS = ["newVisitors", "mobileViews", "tabletViews", "desktopViews"];

async function main() {
  const missingFilter = { $or: NEW_FIELDS.map((field) => ({ [field]: { $exists: false } })) };

  const counted = await prisma.$runCommandRaw({
    count: "DailyStat",
    query: missingFilter,
  });
  const outstanding = Number(counted?.n ?? 0);

  console.log(`${outstanding} DailyStat row(s) missing the new counters.`);

  if (outstanding === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log("Re-run with --apply to write them.");
    return;
  }

  const result = await prisma.$runCommandRaw({
    update: "DailyStat",
    updates: [
      {
        q: missingFilter,
        // Only the absent fields are set; `$exists: false` per field would need
        // one pass each, and setting a field that is already there to zero
        // would erase real counts.
        u: NEW_FIELDS.map((field) => ({
          $set: { [field]: { $ifNull: [`$${field}`, 0] } },
        })),
        multi: true,
      },
    ],
  });

  console.log(`Updated ${Number(result?.nModified ?? 0)} row(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
