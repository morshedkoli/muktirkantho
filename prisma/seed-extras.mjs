import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding extra database models...");

  // Seed Comments
  const existingCommentsCount = await prisma.comment.count();
  if (existingCommentsCount === 0) {
    console.log("Seeding comments...");
    await prisma.comment.createMany({
      data: [
        {
          author: "Rahman Khan",
          content: "Great article! Very informative and well-researched. Keep up the good work.",
          status: "pending",
          article: "Budget Analysis 2026: What It Means for the Middle Class",
          sentiment: "positive",
          createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
        },
        {
          author: "Fatima Begum",
          content: "I disagree with some points. The data seems outdated.",
          status: "pending",
          article: "Local Election Results: Full Coverage of Dhaka North",
          sentiment: "negative",
          createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 min ago
        },
        {
          author: "John Doe",
          content: "Check out my website for more news about sports and finance...",
          status: "spam",
          article: "Cyclone Warning: Coastal Areas on High Alert",
          sentiment: "spam",
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
        },
        {
          author: "Aisha Parvin",
          content: "This is exactly what I needed. Thanks for sharing!",
          status: "approved",
          article: "Interview: Education Minister on National Curriculum Reform",
          sentiment: "positive",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        },
        {
          author: "Mohammad Ali",
          content: "When will the next update be published?",
          status: "pending",
          article: "Budget Analysis 2026: What It Means for the Middle Class",
          sentiment: "neutral",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h ago
        },
      ],
    });
    console.log("Seeded comments successfully.");
  } else {
    console.log("Comments table already has entries. Skipping seeding.");
  }

  // Seed Users
  const existingUsersCount = await prisma.user.count();
  if (existingUsersCount === 0) {
    console.log("Seeding team members...");
    await prisma.user.createMany({
      data: [
        {
          name: "Shahidul Islam",
          email: "shahidul@muktirkantho.com",
          role: "Super Admin",
          status: "active",
          articles: 342,
          lastActive: "2 min ago",
          avatar: "SI",
        },
        {
          name: "Fatima Rahman",
          email: "fatima@muktirkantho.com",
          role: "Editor",
          status: "active",
          articles: 198,
          lastActive: "15 min ago",
          avatar: "FR",
        },
        {
          name: "Kabir Hossain",
          email: "kabir@muktirkantho.com",
          role: "Reporter",
          status: "active",
          articles: 156,
          lastActive: "1 hr ago",
          avatar: "KH",
        },
        {
          name: "Nusrat Jahan",
          email: "nusrat@muktirkantho.com",
          role: "Reporter",
          status: "active",
          articles: 134,
          lastActive: "3 hrs ago",
          avatar: "NJ",
        },
        {
          name: "Rafiq Ahmed",
          email: "rafiq@muktirkantho.com",
          role: "Contributor",
          status: "active",
          articles: 45,
          lastActive: "1 day ago",
          avatar: "RA",
        },
        {
          name: "Ayesha Begum",
          email: "ayesha@muktirkantho.com",
          role: "Contributor",
          status: "inactive",
          articles: 12,
          lastActive: "2 weeks ago",
          avatar: "AB",
        },
      ],
    });
    console.log("Seeded team members successfully.");
  } else {
    console.log("Users table already has entries. Skipping seeding.");
  }

  // Seed dynamic views for posts
  console.log("Updating posts with realistic viewCounts...");
  const posts = await prisma.post.findMany();
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    // Generate a views figure (e.g. higher views for featured or published)
    const baseViews = post.status === "published" ? 3000 + (i * 1247) % 8000 : 50 + (i * 23) % 400;
    await prisma.post.update({
      where: { id: post.id },
      data: {
        viewCount: baseViews,
      },
    });
  }
  console.log(`Updated ${posts.length} posts with view counts successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
