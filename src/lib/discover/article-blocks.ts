export type ArticleBlockType =
  | "paragraph"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "blockquote";

export type ArticleBlock = {
  id: string;
  type: ArticleBlockType;
  /** Plain text for headings; HTML allowed for paragraph/blockquote/list items. */
  content: string;
};

const BLOCK_TAG_PATTERN =
  /<(h1|h2|h3|h4|h5|h6|p|ul|ol|blockquote)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

export function titlesMatch(a: string, b: string): boolean {
  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ");
  return normalize(a) === normalize(b);
}

/** Strip unsafe markup and unwrap block-level tags from inline/rich-text fields. */
export function sanitizeInlineHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<\/?(h[1-6]|p|div|blockquote|ul|ol|li|script|iframe|object|embed|form|input|button|style)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function removeEmptyBlocks(html: string): string {
  return html
    .replace(/<(p|h2|h3|blockquote)(?:\s[^>]*)?>\s*<\/\1>/gi, "")
    .replace(/<(ul|ol)(?:\s[^>]*)?>\s*<\/\1>/gi, "")
    .trim();
}

/** Enforce H3-only-after-H2 and disallow consecutive H3 blocks. */
export function normalizeArticleBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  let hasSeenH2 = false;
  let lastBlockWasH3 = false;
  const normalized: ArticleBlock[] = [];

  for (const block of blocks) {
    const content = block.content.trim();
    if (!content) continue;

    if (block.type === "h2") {
      hasSeenH2 = true;
      lastBlockWasH3 = false;
      normalized.push({ ...block, content: stripTags(content) });
      continue;
    }

    if (block.type === "h3") {
      const text = stripTags(content);
      if (!hasSeenH2 || lastBlockWasH3) {
        normalized.push(createBlock("paragraph", text));
        lastBlockWasH3 = false;
        continue;
      }
      normalized.push({ ...block, content: text });
      lastBlockWasH3 = true;
      continue;
    }

    lastBlockWasH3 = false;
    normalized.push(block);
  }

  return normalized.length > 0 ? normalized : [createBlock("paragraph")];
}

function listItemsFromHtml(innerHtml: string): string[] {
  const items: string[] = [];
  const itemPattern = /<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemPattern.exec(innerHtml)) !== null) {
    const item = sanitizeInlineHtml(match[1].trim());
    if (item) items.push(item);
  }

  if (items.length === 0) {
    const fallback = stripTags(innerHtml);
    if (fallback) items.push(fallback);
  }

  return items;
}

function pushParsedBlock(
  blocks: ArticleBlock[],
  tag: string,
  inner: string,
  articleTitle?: string | null
) {
  const text = stripTags(inner);

  if (tag === "h1") {
    if (articleTitle && titlesMatch(text, articleTitle)) return;
    blocks.push(createBlock("h2", text));
    return;
  }

  if (tag === "h2") {
    blocks.push(createBlock("h2", text));
    return;
  }

  if (tag === "h3") {
    blocks.push(createBlock("h3", text));
    return;
  }

  if (tag === "h4" || tag === "h5" || tag === "h6") {
    if (text) blocks.push(createBlock("paragraph", text));
    return;
  }

  if (tag === "ul" || tag === "ol") {
    const items = listItemsFromHtml(inner);
    if (items.length > 0) {
      blocks.push({
        id: createBlockId(),
        type: tag,
        content: items.join("\n"),
      });
    }
    return;
  }

  if (tag === "p") {
    const sanitized = sanitizeInlineHtml(inner);
    if (sanitized) {
      blocks.push(createBlock("paragraph", sanitized));
    }
    return;
  }

  if (tag === "blockquote") {
    const sanitized = sanitizeInlineHtml(inner);
    if (sanitized) {
      blocks.push(createBlock("blockquote", sanitized));
    }
  }
}

/** Parse article HTML (including legacy/disallowed tags) into normalized blocks. */
export function parseHtmlToBlocks(
  html: string,
  articleTitle?: string | null
): ArticleBlock[] {
  const trimmed = html.trim();
  if (!trimmed) return [createBlock("paragraph")];

  const blocks: ArticleBlock[] = [];
  const pattern = new RegExp(BLOCK_TAG_PATTERN.source, "gi");
  let match: RegExpExecArray | null;
  let found = false;

  while ((match = pattern.exec(trimmed)) !== null) {
    found = true;
    pushParsedBlock(blocks, match[1].toLowerCase(), match[2].trim(), articleTitle);
  }

  if (!found) {
    return plainTextToBlocks(trimmed);
  }

  return normalizeArticleBlocks(blocks);
}

/**
 * Final normalization for saved/rendered article bodies.
 * Legacy plain-text bodies are returned unchanged by callers.
 */
export function normalizeArticleBodyHtml(
  html: string,
  articleTitle?: string | null
): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  if (!/<(p|h[1-6]|ul|ol|blockquote)\b/i.test(trimmed)) {
    return trimmed;
  }

  return blocksToHtml(parseHtmlToBlocks(trimmed, articleTitle));
}

/** @deprecated Use normalizeArticleBodyHtml — kept as alias for existing imports. */
export function sanitizeArticleBodyHtml(html: string): string {
  return normalizeArticleBodyHtml(html);
}

export function createBlockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createBlock(
  type: ArticleBlockType,
  content = ""
): ArticleBlock {
  return { id: createBlockId(), type, content };
}

/** Parse stored article HTML into editable blocks. */
export function htmlToBlocks(
  html: string,
  articleTitle?: string | null
): ArticleBlock[] {
  return parseHtmlToBlocks(html, articleTitle);
}

/** Convert plain text (legacy articles) into paragraph blocks. */
export function plainTextToBlocks(text: string): ArticleBlock[] {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return [createBlock("paragraph")];
    return lines.map((line) => createBlock("paragraph", line));
  }

  return paragraphs.map((paragraph) => createBlock("paragraph", paragraph));
}

/** Serialize blocks to semantic HTML for storage and publishing. */
export function blocksToHtml(blocks: ArticleBlock[]): string {
  const normalized = normalizeArticleBlocks(blocks);
  const parts: string[] = [];

  for (const block of normalized) {
    const content = block.content.trim();
    if (!content) continue;

    switch (block.type) {
      case "h2":
        parts.push(`<h2>${escapeHtml(stripTags(content))}</h2>`);
        break;
      case "h3":
        parts.push(`<h3>${escapeHtml(stripTags(content))}</h3>`);
        break;
      case "paragraph":
        parts.push(`<p>${sanitizeInlineHtml(content)}</p>`);
        break;
      case "blockquote":
        parts.push(`<blockquote>${sanitizeInlineHtml(content)}</blockquote>`);
        break;
      case "ul":
      case "ol": {
        const items = content
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean);
        if (items.length === 0) break;
        const tag = block.type;
        parts.push(
          `<${tag}>${items
            .map((item) => `<li>${sanitizeInlineHtml(item)}</li>`)
            .join("")}</${tag}>`
        );
        break;
      }
      default:
        break;
    }
  }

  return removeEmptyBlocks(parts.join(""));
}

/** Load body from DB into blocks for the editor. */
export function bodyToBlocks(
  body: string | null | undefined,
  articleTitle?: string | null
): ArticleBlock[] {
  if (!body?.trim()) return [createBlock("paragraph")];

  const trimmed = body.trim();
  if (/<(p|h[1-6]|ul|ol|blockquote)\b/i.test(trimmed)) {
    return htmlToBlocks(trimmed, articleTitle);
  }

  return plainTextToBlocks(trimmed);
}

export function blocksToPlainText(blocks: ArticleBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "ul" || block.type === "ol") {
        return block.content
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => `- ${stripTags(item)}`)
          .join("\n");
      }
      return stripTags(block.content);
    })
    .filter(Boolean)
    .join("\n\n");
}
