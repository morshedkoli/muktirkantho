import { AdminShell } from "@/components/admin/admin-shell";
import { PostEditor } from "@/components/admin/post-editor";
import { createPostAction } from "@/app/(admin)/admin/actions";
import { getSiteSettings } from "@/lib/site-settings";

const initialState = { status: "idle" as const };
import { prisma } from "@/lib/prisma";

export default async function AdminCreatePostPage() {
  const [categories, divisions, districts, upazilas, settings] = await Promise.all([
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
      defaultEnabled: settings.facebookAutoPost ?? false,
    });
  }

  return (
    <AdminShell title="Create Post">
      <PostEditor
        mode="create"
        categories={categories}
        divisions={divisions}
        districts={districts}
        upazilas={upazilas}
        socialPlatforms={socialPlatforms}
        action={createPostAction}
        initialState={initialState}
      />
    </AdminShell>
  );
}
