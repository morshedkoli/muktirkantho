import { z } from "zod";

// Article bodies are long-form but not unbounded — a hard ceiling keeps a single
// request from pushing a multi-megabyte document through markdown + sanitiser.
const MAX_CONTENT_LENGTH = 100_000;

/**
 * `z.url()` accepts any scheme, including `javascript:`. These values end up in
 * `href`/`src` attributes, so restrict them to real web URLs.
 */
const webUrl = z.url().refine(
  (value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  },
  { message: "URL must start with http:// or https://" },
);

/**
 * MongoDB ObjectId — validated here so a malformed id is a 400, not a 500.
 * `min(1)` comes first so an empty selection still reports as "is required"
 * rather than a format error.
 */
const objectId = z.string().min(1).regex(/^[a-fA-F0-9]{24}$/, "Invalid id");

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});

export const postSchema = z.object({
  title: z.string().min(5).max(180),
  excerpt: z.string().min(20).max(500).optional(),
  content: z.string().min(50).max(MAX_CONTENT_LENGTH),
  imageUrl: z.union([webUrl, z.literal("")]).optional(),
  imagePublicId: z.string().max(255).optional(),
  categoryId: objectId,
  districtId: objectId,
  upazilaId: z.union([objectId, z.literal("")]).optional(),
  tags: z.array(z.string().min(1).max(30)).max(10),
  author: z.string().min(2).max(80),
  youtubeUrl: webUrl.optional(),
  metaTitle: z.string().min(10).max(160),
  metaDescription: z.string().min(20).max(200),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]),
});

export const taxonomySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().max(120).optional(),
  districtId: z.union([objectId, z.literal("")]).optional(),
  divisionId: z.union([objectId, z.literal("")]).optional(),
});
