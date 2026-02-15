/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { title: true, slug: true, status: true },
  });
  console.log(JSON.stringify(posts, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => prisma.$disconnect());
