import { AdminShell } from "@/components/admin/admin-shell";
import { MenuManager } from "@/components/admin/menu-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MenusPage() {
  const [items, categories] = await Promise.all([
    prisma.menuItem
      .findMany({ orderBy: [{ location: "asc" }, { order: "asc" }] })
      .catch(() => []),
    prisma.category
      .findMany({ orderBy: { name: "asc" } })
      .catch(() => []),
  ]);

  return (
    <AdminShell title="Menu Manager">
      <MenuManager initialItems={items} categories={categories} />
    </AdminShell>
  );
}
