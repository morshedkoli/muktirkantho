import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";
import { updatePostAction } from "@/app/(admin)/admin/actions";
import { isObjectId } from "@/lib/object-id";

const initialState = { status: "idle" as const };
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditPostPage({ params }: Props) {
  const { id } = await params;
  if (!isObjectId(id)) {
    notFound();
  }

  const [post, categories, districts, upazilas] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
    prisma.upazila.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  const action = updatePostAction.bind(null, id);

  return (
    <AdminShell title="Edit Post">
      <PostEditor
        mode="edit"
        categories={categories}
        districts={districts}
        upazilas={upazilas}
        initial={{
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          imageUrl: post.imageUrl,
          imagePublicId: post.imagePublicId,
          categoryId: post.categoryId,
          districtId: post.districtId,
          upazilaId: post.upazilaId ?? "",
          tags: post.tags.join(", "),
          author: post.author,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          featured: post.featured,
          status: post.status,
        }}
        action={action}
        initialState={initialState}
      />
    </AdminShell>
  );
}
