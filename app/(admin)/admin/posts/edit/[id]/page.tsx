import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";
import { updatePostAction } from "@/app/(admin)/admin/actions";
import { isObjectId } from "@/lib/object-id";
import { getSiteSettings } from "@/lib/site-settings";

const initialState = { status: "idle" as const };
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditPostPage({ params }: Props) {
  const { id } = await params;
  if (!isObjectId(id)) {
    notFound();
  }

  const [post, categories, divisions, districts, upazilas, settings] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
    prisma.upazila.findMany({ orderBy: { name: "asc" } }),
    getSiteSettings(),
  ]);

  const socialPlatforms = [];
  if (settings?.facebookConnected) {
    socialPlatforms.push({
      id: "facebook",
      label: settings.facebookPageName ? `Facebook · ${settings.facebookPageName}` : "Facebook",
      defaultEnabled: false, // default to off on re-edit to avoid accidental re-share
    });
  }

  if (!post) notFound();

  const action = updatePostAction.bind(null, id);

  return (
    <AdminShell title="Edit Post">
      <PostEditor
        mode="edit"
        categories={categories}
        divisions={divisions}
        districts={districts}
        upazilas={upazilas}
        socialPlatforms={socialPlatforms}
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
          youtubeUrl: post.youtubeUrl ?? "",
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
