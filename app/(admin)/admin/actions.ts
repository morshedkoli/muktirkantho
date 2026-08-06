"use server";

import { randomUUID } from "node:crypto";
import { PostStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { deleteImage } from "@/lib/cloudinary";
import { clearAuthCookie, getAuthUser, setAuthCookie, signAdminToken } from "@/lib/auth";
import { AD_PLACEMENTS } from "@/lib/ads";
import { createAd, removeAd, setAdStatus } from "@/lib/ads";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";
import { hashPassword, safeEqual, verifyPassword } from "@/lib/password";
import { generatePostSeo } from "@/lib/seo";
import { deriveExcerpt, resolveCurrentAuthor } from "@/lib/post-payload";
import { makeSlug } from "@/lib/utils";
import { loginSchema, postSchema, taxonomySchema } from "@/lib/validators";
import { verifyCsrf } from "@/lib/csrf";
import {
  FACEBOOK_OAUTH_DIALOG_URL,
  FACEBOOK_OAUTH_SCOPE,
  FACEBOOK_OAUTH_STATE_COOKIE,
} from "@/lib/facebook";
import { autoShareOnPublish, sharePostToFacebook, shouldAutoShare } from "@/lib/social-share";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

export type AdminActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

const LOGIN_ATTEMPT_LIMIT = 5;

async function requireActionAdmin() {
  await verifyCsrf();
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
  const title = formData.get("title")?.toString() ?? "";
  const seo = generatePostSeo(title, content);

  // Excerpt isn't a form field — always derive it server-side from the cleaned
  // plain text (see `deriveExcerpt`), so the client can't set it directly.
  const excerpt = deriveExcerpt("", title, content);

  const imageUrl = formData.get("imageUrl")?.toString().trim() ?? "";
  const imagePublicId = formData.get("imagePublicId")?.toString().trim() ?? "";

  return {
    title,
    excerpt: excerpt || undefined,
    content,
    imageUrl: imageUrl || undefined,
    imagePublicId: imagePublicId || undefined,
    categoryId: formData.get("categoryId")?.toString() ?? "",
    districtId: formData.get("districtId")?.toString() ?? "",
    upazilaId: formData.get("upazilaId")?.toString() ?? undefined,
    tags,
    author: formData.get("author")?.toString() ?? "",
    youtubeUrl: formData.get("youtubeUrl")?.toString().trim() || undefined,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    featured: formData.get("featured") === "on",
    status: (formData.get("status")?.toString() ?? "draft") as "draft" | "published",
  };
}

const POST_FIELD_LABELS: Record<string, string> = {
  title: "Title",
  content: "Content",
  excerpt: "Excerpt",
  imageUrl: "Featured Image URL",
  imagePublicId: "Featured Image",
  categoryId: "Category",
  districtId: "District",
  upazilaId: "Upazila",
  tags: "Tags",
  author: "Author",
  youtubeUrl: "YouTube URL",
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  featured: "Featured",
  status: "Status",
};

function describeZodIssue(issue: z.core.$ZodIssue): string {
  switch (issue.code) {
    case "too_small": {
      const min = Number(issue.minimum);
      if (issue.origin === "string") {
        return min <= 1 ? "is required" : `must be at least ${min} characters long`;
      }
      if (issue.origin === "array") {
        return `must have at least ${min} item${min === 1 ? "" : "s"}`;
      }
      return `must be at least ${min}`;
    }
    case "too_big": {
      const max = Number(issue.maximum);
      if (issue.origin === "string") return `must be at most ${max} characters long`;
      if (issue.origin === "array") return `must have at most ${max} item${max === 1 ? "" : "s"}`;
      return `must be at most ${max}`;
    }
    case "invalid_type":
      // Zod 4 doesn't expose `received` directly; the message includes "received undefined" for missing fields.
      return /received undefined|received null/i.test(issue.message)
        ? "is required"
        : `must be a ${issue.expected}`;
    case "invalid_format":
      if (issue.format === "url") return "must be a valid URL (https://...)";
      if (issue.format === "email") return "must be a valid email address";
      return "is not in a valid format";
    case "invalid_value":
      return `must be one of: ${(issue.values ?? []).map((v) => String(v)).join(", ")}`;
    case "invalid_union":
      return "is not in a valid format";
    default:
      return issue.message || "is invalid";
  }
}

function formatPostValidationError(error: z.ZodError): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const issue of error.issues) {
    const field = issue.path[0]?.toString() ?? "";
    if (seen.has(field)) continue;
    seen.add(field);
    const label = POST_FIELD_LABELS[field] ?? (field || "Form");
    parts.push(`${label} ${describeZodIssue(issue)}`);
  }
  if (parts.length === 0) {
    return "Some fields are invalid. Please review the form.";
  }
  const prefix = parts.length === 1 ? "Please fix this field:" : "Please fix these fields:";
  return `${prefix} ${parts.join(" · ")}`;
}

/**
 * Read the per-post Facebook checkbox out of the submitted form.
 *
 * Returns `undefined` when the editor never showed the control (no page
 * connected), which `shouldAutoShare` treats as "no opinion — defer to the
 * global switch". An unchecked box submits nothing, so its absence alongside a
 * present marker field is a deliberate "no".
 */
function readShareToggle(formData: FormData): boolean | undefined {
  if (formData.get("shareFacebookPresent") !== "1") return undefined;
  return formData.get("shareFacebook") === "on";
}

/**
 * Auto-share a just-saved post, without letting the network fail the save.
 *
 * The decision is `shouldAutoShare`; the posting, idempotency and recording all
 * live in lib/social-share.ts. Nothing here awaits a Facebook round trip for
 * its own sake — the outcome is written to the SocialShare row, which is what
 * the queue screen reads.
 */
async function maybeAutoShare(postId: string, status: PostStatus, formData: FormData) {
  const settings = await getSiteSettings();
  const wanted = shouldAutoShare({
    isPublished: status === PostStatus.published,
    globalAutoPost: settings?.facebookAutoPost ?? false,
    perPostToggle: readShareToggle(formData),
  });
  if (!wanted) return;
  await autoShareOnPublish(postId);
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
  // A cross-site login CSRF would sign the victim into the attacker's account,
  // so the same-origin check applies here too — before any credential work.
  try {
    await verifyCsrf();
  } catch {
    return { status: "error", message: "অনুরোধটি যাচাই করা যায়নি। পৃষ্ঠাটি রিলোড করে আবার চেষ্টা করুন।" };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: "সঠিক ইমেইল ও পাসওয়ার্ড দিন।" };
  }

  const { email, password } = parsed.data;
  const emailKey = email.toLowerCase();

  // Two buckets: per-account (stops targeting one admin) and per-IP (stops the
  // same client working through a list of candidate emails).
  const clientIp = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  for (const key of [`login:email:${emailKey}`, `login:ip:${clientIp}`]) {
    const rl = checkRateLimit(key, { limit: LOGIN_ATTEMPT_LIMIT });
    if (!rl.allowed) {
      return { status: "error", message: `অনেকবার চেষ্টা করা হয়েছে। ${rl.retryAfterSeconds} সেকেন্ড পর আবার চেষ্টা করুন।` };
    }
  }

  const settings = await getSiteSettings();
  const configuredEmail = settings?.adminEmail?.trim().toLowerCase();
  const configuredPasswordHash = settings?.adminPasswordHash?.trim();

  if (configuredEmail && configuredPasswordHash) {
    const matches = emailKey === configuredEmail && verifyPassword(password, configuredPasswordHash);
    if (!matches) {
      return { status: "error", message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।" };
    }
  } else {
    if (!safeEqual(email, env.ADMIN_EMAIL) || !safeEqual(password, env.ADMIN_PASSWORD)) {
      return { status: "error", message: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।" };
    }
    // First login with env credentials — hash and store password so it is no longer plaintext
    await saveSiteSettings({
      adminEmail: env.ADMIN_EMAIL,
      adminPasswordHash: hashPassword(password),
    });
  }

  resetRateLimit(`login:email:${emailKey}`);
  resetRateLimit(`login:ip:${clientIp}`);
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
  const author = await resolveCurrentAuthor();
  const payloadWithAuthor = { ...payload, author };
  const parsed = postSchema.safeParse(payloadWithAuthor);
  if (!parsed.success) {
    return { status: "error", message: formatPostValidationError(parsed.error) };
  }

  const safe = parsed.data;
  const slug = await resolveUniquePostSlug(safe.title);
  const post = await prisma.post.create({
    data: {
      ...safe,
      slug,
      excerpt: safe.excerpt ?? safe.metaDescription,
      imageUrl: safe.imageUrl || null,
      imagePublicId: safe.imagePublicId || null,
      upazilaId: safe.upazilaId || null,
      youtubeUrl: safe.youtubeUrl || null,
      publishedAt: safe.status === PostStatus.published ? new Date() : null,
    },
    include: {
      category: true,
      district: true,
    },
  });

  await maybeAutoShare(post.id, safe.status, formData);

  revalidateTag("posts", {});
  revalidatePath("/");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/social/queue");
  redirect("/admin/posts?notice=Post%20created&type=success");
}

export async function updatePostAction(
  postId: string,
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireActionAdmin();

  const payload = normalizePostPayload(formData);
  const author = await resolveCurrentAuthor();
  const payloadWithAuthor = {
    ...payload,
    author: payload.author.trim() || author,
  };
  const parsed = postSchema.safeParse(payloadWithAuthor);
  if (!parsed.success) {
    return { status: "error", message: formatPostValidationError(parsed.error) };
  }

  const safe = parsed.data;
  const existing = await prisma.post.findUnique({ where: { id: postId }, select: { publishedAt: true } });
  const slug = await resolveUniquePostSlug(safe.title, postId);
  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      ...safe,
      slug,
      excerpt: safe.excerpt ?? safe.metaDescription,
      imageUrl: safe.imageUrl || null,
      imagePublicId: safe.imagePublicId || null,
      upazilaId: safe.upazilaId || null,
      youtubeUrl: safe.youtubeUrl || null,
      publishedAt: safe.status === PostStatus.published ? (existing?.publishedAt ?? new Date()) : null,
    },
    include: { category: true, district: true },
  });

  await maybeAutoShare(updated.id, safe.status, formData);

  revalidateTag("posts", {});
  revalidatePath("/");
  revalidatePath(`/news/${slug}`);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/social/queue");
  redirect("/admin/posts?notice=Post%20updated&type=success");
}

export async function deletePostAction(postId: string) {
  await requireActionAdmin();

  const post = await prisma.post.delete({ where: { id: postId } });
  if (post.imagePublicId) {
    await deleteImage(post.imagePublicId);
  }

  revalidateTag("posts", {});
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

  revalidateTag("categories", {});
  revalidatePath("/");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?notice=Category%20added&type=success");
}

export async function deleteCategoryAction(id: string) {
  await requireActionAdmin();
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } }
  });
  if (category && category._count.posts > 0) {
    redirect(`/admin/categories?notice=Cannot delete: Category has ${category._count.posts} posts&type=error`);
  }

  await prisma.category.delete({ where: { id } });
  revalidateTag("categories", {});
  revalidatePath("/");
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
  // Clamp logo height to [24, 120] px to prevent ridiculous values
  const rawHeight = Number(formData.get("logoHeight"));
  const logoHeight = Number.isFinite(rawHeight) && rawHeight > 0
    ? Math.max(24, Math.min(120, Math.round(rawHeight)))
    : null;

  const current = await getSiteSettings();

  await saveSiteSettings({
    logoUrl: logoUrl || null,
    logoPublicId: logoPublicId || null,
    iconUrl: iconUrl || null,
    iconPublicId: iconPublicId || null,
    faviconUrl: faviconUrl || null,
    faviconPublicId: faviconPublicId || null,
    logoHeight,
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

const FACEBOOK_OAUTH_STATE_TTL_SECONDS = 10 * 60;

/**
 * Build the Facebook OAuth URL and arm the CSRF `state` parameter.
 *
 * The state is a cryptographically random value stored in an httpOnly cookie so
 * the callback can prove the redirect it receives belongs to a flow this admin
 * actually started. The redirect URI is derived from the request host rather
 * than accepted from the client, so it can't be pointed at another origin.
 */
export async function beginFacebookConnectAction(): Promise<{ url: string } | AdminActionState> {
  await requireActionAdmin();

  const settings = await getSiteSettings();
  const appId = settings?.facebookAppId?.trim();
  if (!appId) {
    return { status: "error", message: "Save your Facebook App ID first." };
  }

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  if (!host) {
    return { status: "error", message: "Could not determine the site URL." };
  }

  const state = randomUUID();
  (await cookies()).set(FACEBOOK_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/facebook",
    maxAge: FACEBOOK_OAUTH_STATE_TTL_SECONDS,
  });

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${proto}://${host}/admin/facebook/callback`,
    scope: FACEBOOK_OAUTH_SCOPE,
    response_type: "code",
    state,
  });

  return { url: `${FACEBOOK_OAUTH_DIALOG_URL}?${params.toString()}` };
}

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

/**
 * Share one post to Facebook on demand.
 *
 * Routed through the same pipeline as auto-post, so a manual share is recorded,
 * de-duplicated and reported exactly like an automatic one — the only
 * difference is the `trigger` written to the row.
 */
export async function shareToFacebookAction(postId: string): Promise<AdminActionState> {
  await requireActionAdmin();

  const outcome = await sharePostToFacebook(postId, "manual");
  revalidatePath("/admin/social/queue");

  return outcome.ok
    ? { status: "success", message: outcome.message }
    : { status: "error", message: outcome.message };
}

/** Retry a previously failed share. Same pipeline, recorded as a retry. */
export async function retryShareAction(shareId: string): Promise<AdminActionState> {
  await requireActionAdmin();

  const share = await prisma.socialShare.findUnique({
    where: { id: shareId },
    select: { postId: true },
  });
  if (!share) {
    return { status: "error", message: "Share record not found." };
  }

  const outcome = await sharePostToFacebook(share.postId, "retry");
  revalidatePath("/admin/social/queue");

  return outcome.ok
    ? { status: "success", message: outcome.message }
    : { status: "error", message: outcome.message };
}

/**
 * Check the stored page token against the Graph API.
 *
 * A connection can be dead while still looking connected — the flag in the
 * database says nothing about whether Facebook still honours the token.
 */
export async function verifyFacebookConnectionAction(): Promise<AdminActionState> {
  await requireActionAdmin();

  const settings = await getSiteSettings();
  if (!settings?.facebookConnected || !settings.facebookPageAccessToken || !settings.facebookPageId) {
    return { status: "error", message: "No Facebook page is connected." };
  }

  const { verifyPageToken } = await import("@/lib/facebook");
  const result = await verifyPageToken(settings.facebookPageId, settings.facebookPageAccessToken);

  if (result.ok) {
    return {
      status: "success",
      message: `Connection to ${settings.facebookPageName ?? "the page"} is healthy.`,
    };
  }

  // Mark it disconnected so the UI stops implying auto-post is working.
  if (result.needsReconnect) {
    await saveSiteSettings({ facebookConnected: false });
    revalidatePath("/admin/facebook");
  }

  return {
    status: "error",
    message: result.needsReconnect
      ? `Facebook rejected the stored token (${result.reason}). Reconnect the page.`
      : `Could not verify the connection: ${result.reason}`,
  };
}

// ─── Menu Manager ────────────────────────────────────────────────────────────

export async function saveMenuItemAction(
  _: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireActionAdmin();

  const id = formData.get("_itemId")?.toString().trim() ?? "";
  const label = formData.get("label")?.toString().trim() ?? "";
  const location = formData.get("location")?.toString().trim() ?? "";
  const order = parseInt(formData.get("order")?.toString() ?? "0") || 0;
  const isActive = formData.get("isActive") === "true";
  const openInNewTab = formData.get("openInNewTab") === "true";
  const icon = formData.get("icon")?.toString().trim() || null;

  // Category-based locations derive the URL from the selected slug.
  // Social / footer_bottom submit a raw url field instead.
  const categorySlug = formData.get("categorySlug");
  const url =
    categorySlug !== null
      ? (categorySlug as string).trim()
        ? `/category/${(categorySlug as string).trim()}`
        : "/"
      : (formData.get("url")?.toString().trim() ?? "");

  if (!label) return { status: "error", message: "Label is required." };
  if (!url) return { status: "error", message: "Please select a category or enter a URL." };
  if (!location) return { status: "error", message: "Location is required." };

  if (id) {
    await prisma.menuItem.update({
      where: { id },
      data: { label, url, location, order, isActive, openInNewTab, icon },
    });
  } else {
    await prisma.menuItem.create({
      data: { label, url, location, order, isActive, openInNewTab, icon },
    });
  }

  revalidateTag("menu-items", {});
  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
  return { status: "success" };
}

export async function deleteMenuItemAction(id: string): Promise<void> {
  await requireActionAdmin();
  await prisma.menuItem.delete({ where: { id } });
  revalidateTag("menu-items", {});
  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
}

export async function approveCommentAction(commentId: string) {
  await requireActionAdmin();
  await prisma.comment.update({
    where: { id: commentId },
    data: { status: "approved" },
  });
  revalidatePath("/admin/comments");
}

export async function deleteCommentAction(commentId: string) {
  await requireActionAdmin();
  await prisma.comment.delete({
    where: { id: commentId },
  });
  revalidatePath("/admin/comments");
}

export async function approveAllCommentsAction() {
  await requireActionAdmin();
  await prisma.comment.updateMany({
    where: { status: "pending" },
    data: { status: "approved" },
  });
  revalidatePath("/admin/comments");
}

export async function inviteUserAction(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireActionAdmin();
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const role = formData.get("role")?.toString().trim() ?? "Reporter";

  if (!name || !email) {
    return { status: "error", message: "Name and Email are required." };
  }

  // Create user
  const avatar = name.split(" ").map(p => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "US";
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role,
        status: "active",
        articles: 0,
        lastActive: "Just now",
        avatar,
      }
    });
  } catch {
    return { status: "error", message: "User with this email already exists." };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?notice=User%20invited&type=success");
}

export async function toggleUserStatusAction(userId: string) {
  await requireActionAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    await prisma.user.update({
      where: { id: userId },
      data: { status: nextStatus },
    });
  }
  revalidatePath("/admin/users");
}

export async function removeUserAction(userId: string) {
  await requireActionAdmin();
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
