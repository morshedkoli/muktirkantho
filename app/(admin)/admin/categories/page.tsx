import { AdminShell } from "@/components/admin/admin-shell";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/(admin)/admin/actions";

const initialState = { status: "idle" as const };
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <AdminShell title="Categories">
      <TaxonomyManager
        title="Category"
        items={categories}
        createAction={createCategoryAction}
        deleteAction={deleteCategoryAction}
        initialState={initialState}
      />
    </AdminShell>
  );
}
