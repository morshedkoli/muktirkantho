/**
 * Serialize a value for embedding inside a `<script>` tag.
 *
 * `JSON.stringify` leaves `<` untouched, so a title containing `</script>` would
 * close the block early and let the rest of the string run as markup. Escaping
 * the three characters the HTML parser reacts to keeps the payload inert while
 * staying valid JSON.
 */
export function toInlineJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

function truncateAtWord(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 0 ? sliced.slice(0, lastSpace) : sliced).trim();
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function getPlainTextFromContent(content: string) {
  return normalizeText(
    content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[>#*_~\-|]/g, " "),
  );
}

export function generatePostSeo(title: string, content: string) {
  const safeTitle = normalizeText(title);
  const plainContent = getPlainTextFromContent(content);

  const metaTitleBase = safeTitle || plainContent || "Latest News Update";
  let metaTitle = truncateAtWord(metaTitleBase, 160);
  if (metaTitle.length < 10) {
    metaTitle = truncateAtWord(`${metaTitleBase} - Latest News`, 160);
  }

  const metaDescriptionBase = plainContent || safeTitle || "Latest news and updates.";
  let metaDescription = truncateAtWord(metaDescriptionBase, 200);
  if (metaDescription.length < 20) {
    metaDescription = truncateAtWord(`${safeTitle} - ${metaDescriptionBase} Read the full news update.`, 200);
  }

  return { metaTitle, metaDescription };
}
