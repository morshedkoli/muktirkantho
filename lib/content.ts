import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Sanitiser config for rendered article bodies.
 *
 * Hoisted to module scope so the object isn't rebuilt on every render, and kept
 * as an allow-list: anything not named here (script, iframe, style, event
 * handlers, `javascript:` URLs) is stripped.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "h3",
    "blockquote",
    "pre",
  ]),
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class"],
  },
  // Explicit rather than inherited: blocks `javascript:`, `data:` and `vbscript:`
  // URLs in both links and image sources.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  transformTags: {
    // Any link that opens a new tab gets `noopener noreferrer`, so the opened
    // page can't reach back through `window.opener`.
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target ? { ...attribs, rel: "noopener noreferrer" } : attribs,
    }),
  },
};

export async function renderContent(markdown: string) {
  const html = await marked.parse(markdown);
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
