import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { MenusClient } from "./menus-client";

export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  const items = await prisma.menuItem.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminShell
      title="মেনু ম্যানেজার"
      description="পাবলিক সাইটের নেভিগেশন মেনু তৈরি ও পরিচালনা করুন। ক্রম পরিবর্তন করুন, সক্রিয়/নিষ্ক্রিয় করুন।"
    >
      <MenusClient initial={items} />
    </AdminShell>
  );
}
