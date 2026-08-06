import { getAuthUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { generatePostSeo, getPlainTextFromContent } from "@/lib/seo";
import { getSiteSettings } from "@/lib/site-settings";
import { postSchema } from "@/lib/validators";

const EXCERPT_MAX_LENGTH = 280;
const EXCERPT_MIN_LENGTH = 20;

/**
 * Display name to attribute a post to when the client didn't send one.
 * Prefers the name configured in site settings, then the signed-in admin.
 */
export async function resolveCurrentAuthor(): Promise<string> {
  const [authUser, settings] = await Promise.all([getAuthUser(), getSiteSettings()]);
  return (
    settings?.adminName?.trim() ||
    settings?.adminEmail?.trim() ||
    authUser?.email?.trim() ||
    env.ADMIN_EMAIL ||
    "Admin"
  );
}

/**
 * Excerpts are never trusted from the client verbatim — they're derived from the
 * cleaned plain-text body, falling back to the title so the validator's minimum
 * length still holds for very short posts.
 */
export function deriveExcerpt(rawExcerpt: string, title: string, content: string): string {
  const trimmed = rawExcerpt.trim();
  if (trimmed) return trimmed;
  if (!content) return "";

  const plain = getPlainTextFromContent(content);
  const excerpt = plain.slice(0, EXCERPT_MAX_LENGTH).trim();
  if (excerpt.length >= EXCERPT_MIN_LENGTH) return excerpt;

  return `${title} ${plain}`.trim().slice(0, EXCERPT_MAX_LENGTH);
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Normalize and validate a JSON post body from the admin API.
 *
 * Server-controlled fields (excerpt, SEO metadata, author fallback) are always
 * recomputed here so a crafted request can't inject its own values.
 */
export async function parsePostBody(body: unknown) {
  const raw = (body ?? {}) as Record<string, unknown>;
  const title = asTrimmedString(raw.title);
  const content = typeof raw.content === "string" ? raw.content : "";
  const seo = generatePostSeo(title, content);
  const fallbackAuthor = await resolveCurrentAuthor();

  return postSchema.safeParse({
    ...raw,
    title,
    content,
    excerpt: deriveExcerpt(asTrimmedString(raw.excerpt), title, content) || undefined,
    imageUrl: asTrimmedString(raw.imageUrl) || undefined,
    imagePublicId: asTrimmedString(raw.imagePublicId) || undefined,
    author: asTrimmedString(raw.author) || fallbackAuthor,
    youtubeUrl: asTrimmedString(raw.youtubeUrl) || undefined,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
  });
}
