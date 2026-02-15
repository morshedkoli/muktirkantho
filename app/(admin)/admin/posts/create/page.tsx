import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";
import { createPostAction } from "@/app/(admin)/admin/actions";

const initialState = { status: "idle" as const };
import { prisma } from "@/lib/prisma";

export default async function AdminCreatePostPage() {
  const [categories, districts, upazilas] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
    prisma.upazila.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AdminShell title="Create Post">
      <PostEditor
        mode="create"
        categories={categories}
        districts={districts}
        upazilas={upazilas}
        action={createPostAction}
        initialState={initialState}
      />
    </AdminShell>
  );
}
