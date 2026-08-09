/**
 * Turn a raw dynamic route param into the string the database stores.
 *
 * Next hands over the segment **still percent-encoded** for anything outside
 * the ASCII range. It normalizes short ASCII escapes in the pathname before
 * routing — `%6F` arrives as `o` — which makes the encoding easy to miss until
 * a Bangla slug shows up as a 238-character `%E0%A6%…` string and matches
 * nothing in the database.
 *
 * Every route whose slug can hold non-Latin characters has to run its param
 * through this: articles, tags, upazilas, and any category or district an
 * editor names in Bangla.
 *
 * The NFC pass is belt-and-braces: slugs are stored normalized, and a client is
 * free to send the decomposed spelling of the same word.
 */
export function decodePathSegment(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // Malformed escape sequence. Keep the raw value — it simply matches
    // nothing, which is the right answer for a URL that cannot be decoded.
  }
  return decoded.normalize("NFC");
}
