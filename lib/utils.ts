import slugify from "slugify";

export function makeSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function toInt(value: string | null | undefined, fallback = 1) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

/**
 * Escape regular-expression metacharacters so a user-supplied string is matched
 * literally. Prisma's `contains` filter compiles to `$regex` on MongoDB, so an
 * unescaped query like `(a+)+$` would be evaluated as a pattern and can be used
 * to stall the database (ReDoS).
 */
export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
