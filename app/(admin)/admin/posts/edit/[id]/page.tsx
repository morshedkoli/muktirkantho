import { notFound } from "next/navigation";
import { ShareStatus, SocialPlatform } from "@prisma/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";
import { updatePostAction } from "@/app/(admin)/admin/actions";
import { isObjectId } from "@/lib/object-id";
import { getSiteSettings } from "@/lib/site-settings";

const initialState = { status: "idle" as const };
import { prisma } from "@/lib/prisma";

/** Per-request by definition — it edits one live post. */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditPostPage({ params }: Props) {
  const { id } = await params;
  if (!isObjectId(id)) {
    notFound();
  }

  const [post, categories, divisions, districts, upazilas, settings, facebookShare] =
    await Promise.all([
      prisma.post.findUnique({ where: { id } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.division.findMany({ orderBy: { name: "asc" } }),
      prisma.district.findMany({ orderBy: { name: "asc" } }),
      prisma.upazila.findMany({ orderBy: { name: "asc" } }),
      getSiteSettings(),
      prisma.socialShare.findUnique({
        where: { postId_platform: { postId: id, platform: SocialPlatform.facebook } },
        select: { status: true },
      }),
    ]);

  const socialPlatforms = [];
  if (settings?.facebookConnected) {
    // The switch is an override in both directions, so a hardcoded `false` here
    // suppressed the global auto-post setting — publishing a draft from this
    // screen never reached Facebook. Follow the global setting instead, and
    // only force it off for a post that already went out, where the honest
    // state of the control is "nothing left to share".
    const alreadyShared = facebookShare?.status === ShareStatus.shared;
    socialPlatforms.push({
      id: "facebook",
      label: settings.facebookPageName ? `Facebook · ${settings.facebookPageName}` : "Facebook",
      defaultEnabled: alreadyShared ? false : (settings.facebookAutoPost ?? false),
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
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          imageUrl: post.imageUrl ?? "",
          imagePublicId: post.imagePublicId ?? "",
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
