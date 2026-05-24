import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const postSchema = z.object({
  title: z.string().min(5).max(180),
  excerpt: z.string().min(20).max(500).optional(),
  content: z.string().min(50),
  imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  imagePublicId: z.string().optional(),
  categoryId: z.string().min(1),
  districtId: z.string().min(1),
  upazilaId: z.string().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10),
  author: z.string().min(2).max(80),
  youtubeUrl: z.string().url().optional(),
  metaTitle: z.string().min(10).max(160),
  metaDescription: z.string().min(20).max(200),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]),
});

export const taxonomySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().optional(),
  districtId: z.string().optional(),
  divisionId: z.string().optional(),
});
