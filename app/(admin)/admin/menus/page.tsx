import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { MenusClient } from "./menus-client";

export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  const [items, categories] = await Promise.all([
    prisma.menuItem.findMany({ orderBy: { order: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AdminShell
      title="মেনু ম্যানেজার"
      description="পাবলিক সাইটের নেভিগেশন মেনু তৈরি ও পরিচালনা করুন।"
    >
      <MenusClient initial={items} categories={categories} />
    </AdminShell>
  );
}
