/**
 * The publication's name, as typeset.
 *
 * Kept in its own import-free module so client components can use it without
 * pulling in `lib/branding` — which reaches `lib/site-settings` and therefore
 * Prisma, and would drag the database client into the browser bundle.
 */
export const SITE_NAME = "মুক্তির কণ্ঠ";
