/**
 * URL slugs generated from titles, in whatever script the title is written in.
 *
 * The previous implementation ran `slugify(title, { strict: true })`, whose
 * charmap covers Latin and little else — every Bangla title reduced to an empty
 * string, fell back to the literal "post", and got deduplicated into `post-2`,
 * `post-3`, … `post-37`. This keeps the title's own characters, which is both
 * readable to the audience and the convention among Bangla news sites.
 */

/** Long enough for a headline, short enough to stay readable in a search result. */
const MAX_SLUG_LENGTH = 80;

/**
 * Zero-width, bidi and line/paragraph separators. They are invisible, so
 * leaving them in would allow two slugs that look identical but are different
 * strings — one of which 404s when someone retypes it.
 *
 * Built from a string rather than written as a regex literal: U+2028 and U+2029
 * are line terminators, and a literal one inside a character class ends the
 * expression mid-pattern.
 */
const INVISIBLE = new RegExp("[\\u200B-\\u200F\\u2028\\u2029\\uFEFF]", "g");

/**
 * Everything that is not a letter, a number, or a combining mark becomes a
 * separator.
 *
 * `\p{M}` is not optional: Bangla vowel signs and the hasant are combining
 * marks, not letters. Without it "চট্টগ্রামে" is stripped to its consonant
 * skeleton, which is not a word.
 */
const NON_WORD = /[^\p{L}\p{N}\p{M}]+/gu;

/**
 * Cut at a word boundary. Slicing mid-word could separate a combining mark from
 * the letter it belongs to and leave a broken cluster, so a slug with no hyphen
 * to cut at is left whole rather than damaged.
 */
function truncateAtWord(slug: string, max: number): string {
  if (slug.length <= max) return slug;
  const cut = slug.slice(0, max);
  const lastHyphen = cut.lastIndexOf("-");
  return lastHyphen > 0 ? cut.slice(0, lastHyphen) : slug;
}

export function makeSlug(value: string): string {
  const slug = (value ?? "")
    // NFC first: the same Bangla word can be typed as different code point
    // sequences, and only a normalized form compares (and dedupes) reliably.
    .normalize("NFC")
    .replace(INVISIBLE, "")
    .toLowerCase()
    .replace(NON_WORD, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return truncateAtWord(slug, MAX_SLUG_LENGTH);
}

/**
 * Fallback for a title that yields no slug at all — punctuation or emoji only.
 * Dated rather than sequential so it never collides with another such post.
 */
export function fallbackSlug(now = new Date()): string {
  const stamp = now.toISOString().slice(0, 10);
  const random = Math.random().toString(36).slice(2, 7);
  return `post-${stamp}-${random}`;
}

/** True for the slugs the old generator produced: "post", "post-2", "post-37". */
export function isGeneratedPlaceholderSlug(slug: string): boolean {
  return /^post(-\d+)?$/.test(slug.trim().toLowerCase());
}
