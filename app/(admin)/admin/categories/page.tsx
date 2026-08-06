import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryManager } from "@/components/admin/category-manager";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/(admin)/admin/actions";

export const dynamic = "force-dynamic";

const initialState = { status: "idle" as const };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <AdminShell
      kicker="নিউজরুম"
      title="ক্যাটাগরি"
      description="সংবাদের বিভাগ তৈরি ও পরিচালনা করুন। প্রতিটি পোস্ট একটি ক্যাটাগরিতে থাকে।"
    >
      <CategoryManager
        categories={categories}
        createAction={createCategoryAction}
        deleteAction={deleteCategoryAction}
        initialState={initialState}
      />
    </AdminShell>
  );
}
