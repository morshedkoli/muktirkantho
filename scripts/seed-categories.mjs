import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "জাতীয়",        slug: "national" },
  { name: "আন্তর্জাতিক",   slug: "international" },
  { name: "রাজনীতি",       slug: "politics" },
  { name: "অর্থনীতি",      slug: "economy" },
  { name: "সারাদেশ",       slug: "saraderh" },
  { name: "অপরাধ",         slug: "crime" },
  { name: "খেলাধুলা",      slug: "sports" },
  { name: "বিনোদন",        slug: "entertainment" },
  { name: "তথ্যপ্রযুক্তি", slug: "technology" },
  { name: "শিক্ষা",        slug: "education" },
  { name: "স্বাস্থ্য",      slug: "health" },
  { name: "মতামত",         slug: "opinion" },
  { name: "প্রবাস",         slug: "probash" },
  { name: "ধর্ম",          slug: "religion" },
  { name: "চাকরি",         slug: "jobs" },
  { name: "পরিবেশ",        slug: "environment" },
  { name: "বিজ্ঞান",       slug: "science" },
  { name: "লাইফস্টাইল",    slug: "lifestyle" },
];

async function main() {
  console.log("Seeding categories...");
  let created = 0;
  let skipped = 0;

  for (const cat of CATEGORIES) {
    try {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
      console.log(`  ✓ ${cat.name} (${cat.slug})`);
      created++;
    } catch (e) {
      console.log(`  ✗ ${cat.name}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\nDone. ${created} categories upserted, ${skipped} failed.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
