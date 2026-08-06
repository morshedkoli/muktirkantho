/**
 * Pure markdown transforms backing the post editor toolbar.
 *
 * Kept free of React and DOM types so the behaviour is unit-testable: every
 * command takes the textarea's value plus its selection range and returns the
 * next value with the selection to restore. The caller owns the textarea.
 *
 * The vocabulary here is deliberately limited to what `renderContent`
 * (lib/content.ts) actually survives — `marked` with GFM, then a sanitiser
 * allow-list. Anything the sanitiser strips has no business being on a toolbar.
 */

export type MarkdownCommand =
  | "bold"
  | "italic"
  | "h1"
  | "h2"
  | "quote"
  | "bullet"
  | "ordered"
  | "link"
  | "image"
  | "code";

export type MarkdownEdit = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

/**
 * Any block-level prefix this toolbar can produce.
 *
 * Applying a new prefix strips the existing one first, so H1 → H2 replaces the
 * marker instead of stacking it into `## # Heading`.
 */
const ANY_BLOCK_PREFIX = /^(?:#{1,6}[ \t]+|>[ \t]+|[-*+][ \t]+|\d+\.[ \t]+)/;

type BlockCommand = "h1" | "h2" | "quote" | "bullet" | "ordered";

const BLOCK_RULES: Record<BlockCommand, { prefix: (index: number) => string; match: RegExp }> = {
  h1: { prefix: () => "# ", match: /^#[ \t]+/ },
  h2: { prefix: () => "## ", match: /^##[ \t]+/ },
  quote: { prefix: () => "> ", match: /^>[ \t]+/ },
  bullet: { prefix: () => "- ", match: /^[-*+][ \t]+/ },
  ordered: { prefix: (index) => `${index + 1}. `, match: /^\d+\.[ \t]+/ },
};

/**
 * Italic uses `_` rather than `*` so it never collides with bold's `**` — with
 * `*` on both, toggling italic over `**bold**` would eat the bold markers.
 */
const INLINE_RULES = {
  bold: { marker: "**", placeholder: "bold text" },
  italic: { marker: "_", placeholder: "italic text" },
} as const;

const CODE_FENCE = "```";

/** Expand a selection to cover every whole line it touches. */
function expandToLines(value: string, start: number, end: number) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;

  // A selection ending exactly on a newline shouldn't drag in the next line,
  // which is what a plain `indexOf` from `end` would do.
  const searchFrom = end > start && value[end - 1] === "\n" ? end - 1 : end;
  const newlineAt = value.indexOf("\n", searchFrom);
  const lineEnd = newlineAt === -1 ? value.length : newlineAt;

  return { lineStart, lineEnd };
}

function replaceRange(
  value: string,
  from: number,
  to: number,
  insert: string,
  selectionStart: number,
  selectionEnd: number,
): MarkdownEdit {
  return {
    value: value.slice(0, from) + insert + value.slice(to),
    selectionStart,
    selectionEnd,
  };
}

function applyBlock(value: string, start: number, end: number, command: BlockCommand): MarkdownEdit {
  const { prefix, match } = BLOCK_RULES[command];
  const { lineStart, lineEnd } = expandToLines(value, start, end);
  const lines = value.slice(lineStart, lineEnd).split("\n");

  // Blank lines are ignored when deciding whether the block is already styled,
  // otherwise a trailing empty line would keep the toggle permanently "off".
  const meaningful = lines.filter((line) => line.trim().length > 0);
  const isActive = meaningful.length > 0 && meaningful.every((line) => match.test(line));

  let counter = 0;
  const next = lines.map((line) => {
    if (isActive) return line.replace(match, "");
    if (lines.length > 1 && line.trim().length === 0) return line;
    return prefix(counter++) + line.replace(ANY_BLOCK_PREFIX, "");
  });

  const block = next.join("\n");
  return replaceRange(value, lineStart, lineEnd, block, lineStart, lineStart + block.length);
}

function applyInline(
  value: string,
  start: number,
  end: number,
  command: "bold" | "italic",
): MarkdownEdit {
  const { marker, placeholder } = INLINE_RULES[command];
  const selected = value.slice(start, end);
  const width = marker.length;

  // Markers inside the selection: `**text**` selected whole.
  if (selected.length >= width * 2 && selected.startsWith(marker) && selected.endsWith(marker)) {
    const inner = selected.slice(width, -width);
    return replaceRange(value, start, end, inner, start, start + inner.length);
  }

  // Markers just outside the selection: `**` + `text` selected + `**`.
  if (
    start >= width &&
    value.slice(start - width, start) === marker &&
    value.slice(end, end + width) === marker
  ) {
    return replaceRange(value, start - width, end + width, selected, start - width, end - width);
  }

  const text = selected || placeholder;
  return replaceRange(
    value,
    start,
    end,
    `${marker}${text}${marker}`,
    start + width,
    start + width + text.length,
  );
}

function applyCode(value: string, start: number, end: number): MarkdownEdit {
  const { lineStart, lineEnd } = expandToLines(value, start, end);
  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");

  if (lines.length >= 2 && lines[0].trim() === CODE_FENCE && lines[lines.length - 1].trim() === CODE_FENCE) {
    const inner = lines.slice(1, -1).join("\n");
    return replaceRange(value, lineStart, lineEnd, inner, lineStart, lineStart + inner.length);
  }

  const fenced = `${CODE_FENCE}\n${block}\n${CODE_FENCE}`;
  // Select the body between the fences so typing replaces it.
  const bodyStart = lineStart + CODE_FENCE.length + 1;
  return replaceRange(value, lineStart, lineEnd, fenced, bodyStart, bodyStart + block.length);
}

function applyLinkLike(
  value: string,
  start: number,
  end: number,
  command: "link" | "image",
): MarkdownEdit {
  const selected = value.slice(start, end);
  const bang = command === "image" ? "!" : "";
  const label = selected || (command === "image" ? "alt text" : "link text");
  const url = "https://";
  const snippet = `${bang}[${label}](${url})`;

  // With text already selected the label is settled, so put the caret on the
  // URL. With nothing selected the label is a placeholder worth replacing.
  const labelStart = start + bang.length + 1;
  if (selected) {
    const urlStart = labelStart + label.length + 2;
    return replaceRange(value, start, end, snippet, urlStart, urlStart + url.length);
  }

  return replaceRange(value, start, end, snippet, labelStart, labelStart + label.length);
}

export function applyMarkdown(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  command: MarkdownCommand,
): MarkdownEdit {
  const start = Math.min(selectionStart, selectionEnd);
  const end = Math.max(selectionStart, selectionEnd);

  switch (command) {
    case "bold":
    case "italic":
      return applyInline(value, start, end, command);
    case "h1":
    case "h2":
    case "quote":
    case "bullet":
    case "ordered":
      return applyBlock(value, start, end, command);
    case "link":
    case "image":
      return applyLinkLike(value, start, end, command);
    case "code":
      return applyCode(value, start, end);
  }
}

/**
 * Whether a command should render as active for the current selection.
 *
 * Only block commands report state — inline markers would need real inline
 * parsing to detect reliably, and a wrong "on" badge is worse than none.
 */
export function isBlockCommandActive(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  command: MarkdownCommand,
): boolean {
  if (!(command in BLOCK_RULES)) return false;

  const start = Math.min(selectionStart, selectionEnd);
  const end = Math.max(selectionStart, selectionEnd);
  const { lineStart, lineEnd } = expandToLines(value, start, end);
  const lines = value.slice(lineStart, lineEnd).split("\n").filter((line) => line.trim().length > 0);

  const { match } = BLOCK_RULES[command as BlockCommand];
  return lines.length > 0 && lines.every((line) => match.test(line));
}
