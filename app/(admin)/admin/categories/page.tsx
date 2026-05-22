import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryManager } from "@/components/admin/category-manager";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/(admin)/admin/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const initialState = { status: "idle" as const };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <AdminShell title="Categories">
      <CategoryManager
        categories={categories}
        createAction={createCategoryAction}
        deleteAction={deleteCategoryAction}
        initialState={initialState}
      />
    </AdminShell>
  );
}
