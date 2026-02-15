"use server";

import { PostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteImage } from "@/lib/cloudinary";
import { clearAuthCookie, getAuthUser, setAuthCookie, signAdminToken } from "@/lib/auth";
import { AD_PLACEMENTS } from "@/lib/ads";
import { createAd, removeAd, setAdStatus } from "@/lib/ads";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import { hashPassword, verifyPassword } from "@/lib/password";
import { makeSlug } from "@/lib/utils";
import { loginSchema, postSchema, taxonomySchema } from "@/lib/validators";

export type AdminActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

async function requireActionAdmin() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/admin/login");
  }
}

function normalizePostPayload(formData: FormData) {
  const tags = (formData.get("tags")?.toString() ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  const content = formData.get("content")?.toString() ?? "";

  // Generate excerpt from content: take first 160 chars or up to first period if shorter
  let excerpt = formData.get("excerpt")?.toString() ?? "";
  if (!excerpt && content) {
    const plainText = content.replace(/[#*`]/g, ""); // Simple markdown strip
    excerpt = plainText.substring(0, 160).trim();
    if (excerpt.length < 20) {
      // Pad if too short to satisfy validator
      excerpt = plainText.substring(0, 50).padEnd(20, ".");
    }
  }

  return {
    title: formData.get("title")?.toString() ?? "",
    excerpt,
    content,
    imageUrl: formData.get("imageUrl")?.toString() ?? "",
    imagePublicId: formData.get("imagePublicId")?.toString() ?? "",
    categoryId: formData.get("categoryId")?.toString() ?? "",
    districtId: formData.get("districtId")?.toString() ?? "",
    upazilaId: formData.get("upazilaId")?.toString() ?? undefined,
    tags,
    author: formData.get("author")?.toString() ?? "",
    metaTitle: formData.get("metaTitle")?.toString() ?? "",
    metaDescription: formData.get("metaDescription")?.toString() ?? "",
    featured: formData.get("featured") === "on",
    status: (formData.get("status")?.toString() ?? "draft") as "draft" | "published",
  };
}

async function resolveUniquePostSlug(title: string, excludePostId?: string) {
  const baseSlug = makeSlug(title) || "post";

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.post.findFirst({
      where: {
        slug: candidate,
        ...(excludePostId ? { id: { not: excludePostId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function loginAdminAction(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email and password." };
  }

  const { email, password } = parsed.data;

  const settings = await getSiteSettings();
  const configuredEmail = settings?.adminEmail?.trim().toLowerCase();
  const configuredPasswordHash = settings?.adminPasswordHash?.trim();

  if (configuredEmail && configuredPasswordHash) {
    const matches = email.toLowerCase() === configuredEmail && verifyPassword(password, configuredPasswordHash);
    if (!matches) {
      return { status: "error", message: "Invalid credentials." };
    }
  } else {
    if (email !== env.ADMIN_EMAIL || password !== env.ADMIN_PASSWORD) {
      return { status: "error", message: "Invalid credentials." };
    }
  }

  const token = await signAdminToken({ email, role: "admin" });
  await setAuthCookie(token);
  redirect("/admin/dashboard?notice=Signed%20in&type=success");
}

export async function logoutAdminAction() {
  await clearAuthCookie();
  redirect("/admin/login?notice=Signed%20out&type=success");
}

export async function createPostAction(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireActionAdmin();

  const payload = normalizePostPayload(formData);
  const parsed = postSchema.safeParse(payload);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the post fields and try again." };
  }

  const safe = parsed.data;
  const slug = await resolveUniquePostSlug(safe.title);
  const post = await prisma.post.create({
    data: {
      ...safe,
      slug,
      upazilaId: safe.upazilaId || null,
      publishedAt: safe.status === PostStatus.published ? new Date() : null,
    },
    include: {
      category: true,
      district: true,
    },
  });

  // Auto-share to Facebook if enabled and post is published
  if (safe.status === PostStatus.published) {
    try {
      const settings = await getSiteSettings();
      if (settings?.facebookConnected && settings.facebookAutoPost && settings.facebookPageAccessToken) {
        const { formatFacebookPost, postToFacebookPage } = await import("@/lib/facebook");
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        const postUrl = `${siteUrl}/news/${slug}`;

        const message = formatFacebookPost(
          safe.title,
          safe.excerpt,
          post.category?.name ?? "News",
          postUrl,
          post.district?.name
        );

        await postToFacebookPage(
          settings.facebookPageId!,
          settings.facebookPageAccessToken,
          message,
          postUrl,
          safe.imageUrl
        );
      }
    } catch (error) {
      // Log error but don't fail the post creation
      console.error("Failed to auto-share to Facebook:", error);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?notice=Post%20created&type=success");
}

export async function updatePostAction(
  postId: string,
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const payload = normalizePostPayload(formData);
  const parsed = postSchema.safeParse(payload);
  if (!parsed.success) {
    return { status: "error", message: "Please fix the post fields and try again." };
  }

  const safe = parsed.data;
  const slug = await resolveUniquePostSlug(safe.title, postId);
  await prisma.post.update({
    where: { id: postId },
    data: {
      ...safe,
      slug,
      upazilaId: safe.upazilaId || null,
      publishedAt: safe.status === PostStatus.published ? new Date() : null,
    },
  });

  revalidatePath(`/news/${slug}`);
  revalidatePath("/admin/posts");
  redirect("/admin/posts?notice=Post%20updated&type=success");
}

export async function deletePostAction(postId: string) {
  await requireActionAdmin();

  const post = await prisma.post.delete({ where: { id: postId } });
  if (post.imagePublicId) {
    await deleteImage(post.imagePublicId);
  }

  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?notice=Post%20deleted&type=success");
}

export async function createCategoryAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const parsed = taxonomySchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
  });
  if (!parsed.success) return { status: "error", message: "Category name is not valid." };

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug ? makeSlug(parsed.data.slug) : makeSlug(parsed.data.name)
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?notice=Category%20added&type=success");
}

export async function deleteCategoryAction(id: string) {
  await requireActionAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  redirect("/admin/categories?notice=Category%20deleted&type=success");
}

export async function createDistrictAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const parsed = taxonomySchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
  });
  if (!parsed.success) return { status: "error", message: "District name is not valid." };

  await prisma.district.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug ? makeSlug(parsed.data.slug) : makeSlug(parsed.data.name),
      divisionId: formData.get("divisionId")?.toString() || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/districts");
  redirect("/admin/districts?notice=District%20added&type=success");
}

export async function createDivisionAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const parsed = taxonomySchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
  });
  if (!parsed.success) return { status: "error", message: "Division name is not valid." };

  await prisma.division.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug ? makeSlug(parsed.data.slug) : makeSlug(parsed.data.name)
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/divisions");
  redirect("/admin/divisions?notice=Division%20added&type=success");
}

export async function deleteDivisionAction(id: string) {
  await requireActionAdmin();

  const division = await prisma.division.findUnique({
    where: { id },
    include: { _count: { select: { districts: true } } }
  });

  if (division && division._count.districts > 0) {
    redirect(`/admin/divisions?notice=Cannot delete: Division has ${division._count.districts} districts&type=error`);
  }

  await prisma.division.delete({ where: { id } });
  revalidatePath("/admin/divisions");
  redirect("/admin/divisions?notice=Division%20deleted&type=success");
}

export async function deleteDistrictAction(id: string) {
  await requireActionAdmin();

  const district = await prisma.district.findUnique({
    where: { id },
    include: { _count: { select: { posts: true, upazilas: true } } }
  });

  if (district) {
    if (district._count.posts > 0) {
      redirect(`/admin/districts?notice=Cannot delete: District has ${district._count.posts} posts&type=error`);
    }
    if (district._count.upazilas > 0) {
      redirect(`/admin/districts?notice=Cannot delete: District has ${district._count.upazilas} upazilas&type=error`);
    }
  }

  await prisma.district.delete({ where: { id } });
  revalidatePath("/admin/districts");
  redirect("/admin/districts?notice=District%20deleted&type=success");
}

export async function createUpazilaAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const parsed = taxonomySchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    districtId: formData.get("districtId")?.toString() ?? "",
  });

  if (!parsed.success || !parsed.data.districtId) {
    return { status: "error", message: "Upazila name and district are required." };
  }

  await prisma.upazila.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug ? makeSlug(parsed.data.slug) : makeSlug(parsed.data.name),
      districtId: parsed.data.districtId,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/upazilas");
  redirect("/admin/upazilas?notice=Upazila%20added&type=success");
}

export async function deleteUpazilaAction(id: string) {
  await requireActionAdmin();

  const upazila = await prisma.upazila.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } }
  });

  if (upazila && upazila._count.posts > 0) {
    redirect(`/admin/upazilas?notice=Cannot delete: Upazila has ${upazila._count.posts} posts&type=error`);
  }

  await prisma.upazila.delete({ where: { id } });
  revalidatePath("/admin/upazilas");
  redirect("/admin/upazilas?notice=Upazila%20deleted&type=success");
}

export async function saveSiteSettingsAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const contactAddress = formData.get("contactAddress")?.toString().trim() ?? "";
  const contactPhone = formData.get("contactPhone")?.toString().trim() ?? "";
  const contactEmail = formData.get("contactEmail")?.toString().trim() ?? "";

  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { status: "error", message: "Contact email is not valid." };
  }

  await saveSiteSettings({
    contactAddress: contactAddress || null,
    contactPhone: contactPhone || null,
    contactEmail: contactEmail || null,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?notice=Settings%20saved&type=success");
}

export async function saveBrandingSettingsAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const logoUrl = formData.get("logoUrl")?.toString().trim() ?? "";
  const logoPublicId = formData.get("logoPublicId")?.toString().trim() ?? "";
  const iconUrl = formData.get("iconUrl")?.toString().trim() ?? "";
  const iconPublicId = formData.get("iconPublicId")?.toString().trim() ?? "";
  const faviconUrl = formData.get("faviconUrl")?.toString().trim() ?? "";
  const faviconPublicId = formData.get("faviconPublicId")?.toString().trim() ?? "";

  const current = await getSiteSettings();

  await saveSiteSettings({
    logoUrl: logoUrl || null,
    logoPublicId: logoPublicId || null,
    iconUrl: iconUrl || null,
    iconPublicId: iconPublicId || null,
    faviconUrl: faviconUrl || null,
    faviconPublicId: faviconPublicId || null,
  });

  if (current?.logoPublicId && current.logoPublicId !== logoPublicId) {
    await deleteImage(current.logoPublicId);
  }
  if (current?.iconPublicId && current.iconPublicId !== iconPublicId) {
    await deleteImage(current.iconPublicId);
  }
  if (current?.faviconPublicId && current.faviconPublicId !== faviconPublicId) {
    await deleteImage(current.faviconPublicId);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/branding");
  redirect("/admin/branding?notice=Branding%20saved&type=success");
}

export async function saveAdminProfileAction(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const adminName = formData.get("adminName")?.toString().trim() ?? "";
  const adminEmail = formData.get("adminEmail")?.toString().trim().toLowerCase() ?? "";
  const adminPhone = formData.get("adminPhone")?.toString().trim() ?? "";
  const currentPassword = formData.get("currentPassword")?.toString() ?? "";
  const newPassword = formData.get("newPassword")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    return { status: "error", message: "Admin email is not valid." };
  }

  const current = await getSiteSettings();
  let adminPasswordHash = current?.adminPasswordHash ?? undefined;

  if (newPassword || confirmPassword || currentPassword) {
    if (newPassword.length < 8) {
      return { status: "error", message: "New password must be at least 8 characters." };
    }
    if (newPassword !== confirmPassword) {
      return { status: "error", message: "New password and confirm password do not match." };
    }

    const hasSavedPassword = Boolean(current?.adminPasswordHash);
    const passwordValid = hasSavedPassword
      ? verifyPassword(currentPassword, current?.adminPasswordHash ?? "")
      : currentPassword === env.ADMIN_PASSWORD;

    if (!passwordValid) {
      return { status: "error", message: "Current password is incorrect." };
    }

    adminPasswordHash = hashPassword(newPassword);
  }

  const resolvedAdminEmail = adminEmail || current?.adminEmail || env.ADMIN_EMAIL;

  await saveSiteSettings({
    adminName: adminName || null,
    adminEmail: resolvedAdminEmail,
    adminPhone: adminPhone || null,
    adminPasswordHash,
  });

  revalidatePath("/admin/user");
  revalidatePath("/admin", "layout");
  redirect("/admin/user?notice=User%20settings%20saved&type=success");
}

export async function createAdAction(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireActionAdmin();

  const title = formData.get("title")?.toString().trim() ?? "";
  const placement = formData.get("placement")?.toString().trim() ?? "";
  const imageUrl = formData.get("imageUrl")?.toString().trim() ?? "";
  const imagePublicId = formData.get("imagePublicId")?.toString().trim() ?? "";
  const targetUrl = formData.get("targetUrl")?.toString().trim() ?? "";
  const isActive = formData.get("isActive") === "on";

  if (!title || title.length < 2) {
    return { status: "error", message: "Ad title is required." };
  }
  if (!Object.values(AD_PLACEMENTS).includes(placement as (typeof AD_PLACEMENTS)[keyof typeof AD_PLACEMENTS])) {
    return { status: "error", message: "Invalid ad placement." };
  }
  if (!imageUrl || !imagePublicId) {
    return { status: "error", message: "Upload an ad image first." };
  }
  if (targetUrl && !/^https?:\/\//i.test(targetUrl)) {
    return { status: "error", message: "Target URL must start with http:// or https://" };
  }

  const created = await createAd({
    title,
    placement,
    imageUrl,
    imagePublicId,
    targetUrl: targetUrl || null,
    isActive,
  });
  if (!created) {
    return { status: "error", message: "Ads model is not ready. Run prisma push and restart server." };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ads");
  redirect("/admin/ads?notice=Ad%20created&type=success");
}

export async function toggleAdsGlobalAction() {
  await requireActionAdmin();
  const settings = await getSiteSettings();
  const nextEnabled = !(settings?.adsEnabled ?? true);

  await saveSiteSettings({ adsEnabled: nextEnabled });

  revalidatePath("/", "layout");
  revalidatePath("/admin/ads");
  redirect("/admin/ads?notice=Ads%20" + (nextEnabled ? "enabled" : "disabled") + "&type=success");
}

export async function toggleAdStatusAction(adId: string, nextActive: boolean) {
  await requireActionAdmin();
  const updated = await setAdStatus(adId, nextActive);
  if (!updated) {
    redirect("/admin/ads?notice=Ads%20model%20not%20ready&type=error");
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/ads");
  redirect(`/admin/ads?notice=Ad%20${nextActive ? "activated" : "paused"}&type=success`);
}

export async function deleteAdAction(adId: string) {
  await requireActionAdmin();
  const ad = await removeAd(adId);
  if (!ad) {
    redirect("/admin/ads?notice=Ads%20model%20not%20ready&type=error");
  }
  if (ad.imagePublicId) {
    await deleteImage(ad.imagePublicId);
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/ads");
  redirect("/admin/ads?notice=Ad%20deleted&type=success");
}

// Facebook Integration Actions
export async function saveFacebookCredentialsAction(
  _: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireActionAdmin();

  const facebookAppId = formData.get("facebookAppId")?.toString().trim() ?? "";
  const facebookAppSecret = formData.get("facebookAppSecret")?.toString().trim() ?? "";

  if (!facebookAppId || !facebookAppSecret) {
    return { status: "error", message: "Both App ID and App Secret are required" };
  }

  // Basic validation for App ID (should be numeric)
  if (!/^\d+$/.test(facebookAppId)) {
    return { status: "error", message: "App ID should contain only numbers" };
  }

  await saveSiteSettings({
    facebookAppId,
    facebookAppSecret,
  });

  revalidatePath("/admin/facebook");
  return { status: "success", message: "Facebook credentials saved successfully" };
}

export async function disconnectFacebookAction() {
  await requireActionAdmin();

  const settings = await getSiteSettings();
  if (settings?.facebookPageAccessToken) {
    // Try to revoke permissions (optional, may fail silently)
    try {
      await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${settings.facebookPageAccessToken}`, {
        method: "DELETE",
      });
    } catch {
      // Ignore errors during disconnect
    }
  }

  await saveSiteSettings({
    facebookPageId: null,
    facebookPageAccessToken: null,
    facebookPageName: null,
    facebookConnected: false,
    facebookAutoPost: false,
    facebookConnectedAt: null,
  });

  revalidatePath("/admin/facebook");
  redirect("/admin/facebook?notice=Facebook%20disconnected&type=success");
}

export async function toggleFacebookAutoPostAction() {
  await requireActionAdmin();

  const settings = await getSiteSettings();
  const newValue = !settings?.facebookAutoPost;

  await saveSiteSettings({
    facebookAutoPost: newValue,
  });

  revalidatePath("/admin/facebook");
  redirect(`/admin/facebook?notice=Auto-post%20${newValue ? "enabled" : "disabled"}&type=success`);
}

// Action to manually share a post to Facebook
export async function shareToFacebookAction(postId: string) {
  await requireActionAdmin();

  const settings = await getSiteSettings();
  if (!settings?.facebookConnected || !settings.facebookPageAccessToken) {
    return { status: "error" as const, message: "Facebook not connected" };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { category: true, district: true },
  });

  if (!post) {
    return { status: "error" as const, message: "Post not found" };
  }

  try {
    const { formatFacebookPost, postToFacebookPage } = await import("@/lib/facebook");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const postUrl = `${siteUrl}/news/${post.slug}`;

    const message = formatFacebookPost(
      post.title,
      post.excerpt,
      post.category.name,
      postUrl,
      post.district?.name
    );

    await postToFacebookPage(
      settings.facebookPageId!,
      settings.facebookPageAccessToken,
      message,
      postUrl,
      post.imageUrl
    );

    return { status: "success" as const, message: "Shared to Facebook successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to share to Facebook";
    return { status: "error" as const, message };
  }
}
