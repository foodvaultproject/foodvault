import {
  blocksToHtml,
  createBlock,
  titlesMatch,
  type ArticleBlock,
  type ArticleBlockType,
} from "@/lib/discover/article-blocks";
import {
  markdownLinksToHtml,
  unescapeArticleEntities,
} from "@/lib/discover/article-inline";

type ParsedLine = {
  type: ArticleBlockType;
  text: string;
  explicitMarkdown: boolean;
};

function normalizeInput(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/?(p|div|h1|h2|h3|h4|h5|h6|li|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;amp;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseMarkdownLine(line: string): ParsedLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const h4PlusMatch = trimmed.match(/^#{4,6}\s+(.+)$/);
  if (h4PlusMatch) {
    return {
      type: "paragraph",
      text: h4PlusMatch[1].trim(),
      explicitMarkdown: true,
    };
  }

  const h3Match = trimmed.match(/^###\s+(.+)$/);
  if (h3Match) {
    return { type: "h3", text: h3Match[1].trim(), explicitMarkdown: true };
  }

  const h2Match = trimmed.match(/^##\s+(.+)$/);
  if (h2Match) {
    return { type: "h2", text: h2Match[1].trim(), explicitMarkdown: true };
  }

  const h1Match = trimmed.match(/^#\s+(.+)$/);
  if (h1Match) {
    return { type: "h2", text: h1Match[1].trim(), explicitMarkdown: true };
  }

  const blockquoteMatch = trimmed.match(/^>\s*(.+)$/);
  if (blockquoteMatch) {
    return {
      type: "blockquote",
      text: blockquoteMatch[1].trim(),
      explicitMarkdown: false,
    };
  }

  const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
  if (bulletMatch) {
    return { type: "ul", text: bulletMatch[1].trim(), explicitMarkdown: false };
  }

  const numberedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
  if (numberedMatch) {
    return { type: "ol", text: numberedMatch[1].trim(), explicitMarkdown: false };
  }

  return { type: "paragraph", text: trimmed, explicitMarkdown: false };
}

function isLikelyHeading(line: string, nextLine: string | null): boolean {
  const text = line.trim();
  if (!text) return false;
  if (/^#{1,6}\s+/.test(text)) return false;

  const words = text.split(/\s+/).length;
  if (words > 14) return false;
  if (text.length > 110) return false;

  const endsWithSentencePunctuation = /[.!,;:]$/.test(text);
  if (endsWithSentencePunctuation && text.length > 60) return false;

  const next = nextLine?.trim() ?? "";
  const nextIsLongerParagraph =
    next.length > text.length + 20 ||
    (next.length > 80 && !isLikelyHeading(next, null));

  if (!next) {
    return words <= 10 && text.length <= 80 && !endsWithSentencePunctuation;
  }

  return (
    words <= 12 &&
    text.length <= 100 &&
    (!endsWithSentencePunctuation || text.length <= 45) &&
    nextIsLongerParagraph
  );
}

function flushList(
  blocks: ArticleBlock[],
  listType: "ul" | "ol" | null,
  items: string[]
) {
  if (!listType || items.length === 0) return;
  blocks.push(createBlock(listType, items.join("\n")));
}

/**
 * Analyse pasted or plain article text and infer semantic heading hierarchy.
 * Returns sanitized HTML suitable for the article body (no H1).
 */
export function formatArticleBodyContent(
  input: string,
  articleTitle?: string | null
): string {
  const normalized = normalizeInput(input);
  if (!normalized) return "";

  const rawLines = normalized.split("\n");
  const blocks: ArticleBlock[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  let hasSeenH2 = false;
  let lastBlockWasH3 = false;
  let paragraphsSinceLastHeading = 0;

  const withInlineLinks = (text: string) =>
    markdownLinksToHtml(unescapeArticleEntities(text.trim()));

  const pushParagraph = (text: string) => {
    if (!text.trim()) return;
    if (articleTitle && titlesMatch(text, articleTitle)) return;
    blocks.push(createBlock("paragraph", withInlineLinks(text)));
    lastBlockWasH3 = false;
    paragraphsSinceLastHeading += 1;
  };

  const pushExplicitH2 = (text: string) => {
    blocks.push(createBlock("h2", text.trim()));
    hasSeenH2 = true;
    lastBlockWasH3 = false;
    paragraphsSinceLastHeading = 0;
  };

  const pushExplicitH3 = (text: string) => {
    if (!hasSeenH2) {
      pushExplicitH2(text);
      return;
    }
    if (lastBlockWasH3) {
      pushParagraph(text);
      return;
    }
    blocks.push(createBlock("h3", text.trim()));
    lastBlockWasH3 = true;
    paragraphsSinceLastHeading = 0;
  };

  const pushHeuristicHeading = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const isSubsectionCandidate =
      hasSeenH2 &&
      !lastBlockWasH3 &&
      paragraphsSinceLastHeading > 0 &&
      words <= 4 &&
      text.trim().length <= 55;

    if (isSubsectionCandidate) {
      pushExplicitH3(text);
      return;
    }

    pushExplicitH2(text);
  };

  for (let index = 0; index < rawLines.length; index += 1) {
    const line = rawLines[index].trim();
    if (!line) {
      flushList(blocks, listType, listItems);
      listType = null;
      listItems = [];
      continue;
    }

    const parsed = parseMarkdownLine(line);
    if (!parsed) continue;

    if (articleTitle && titlesMatch(parsed.text, articleTitle)) {
      continue;
    }

    if (parsed.type === "ul" || parsed.type === "ol") {
      if (listType && listType !== parsed.type) {
        flushList(blocks, listType, listItems);
        listItems = [];
      }
      listType = parsed.type;
      listItems.push(withInlineLinks(parsed.text));
      lastBlockWasH3 = false;
      continue;
    }

    flushList(blocks, listType, listItems);
    listType = null;
    listItems = [];

    if (parsed.explicitMarkdown && parsed.type === "h2") {
      pushExplicitH2(parsed.text);
      continue;
    }

    if (parsed.explicitMarkdown && parsed.type === "h3") {
      pushExplicitH3(parsed.text);
      continue;
    }

    if (parsed.type === "blockquote") {
      blocks.push(createBlock("blockquote", withInlineLinks(parsed.text)));
      lastBlockWasH3 = false;
      continue;
    }

    if (parsed.explicitMarkdown && parsed.type === "paragraph") {
      pushParagraph(parsed.text);
      continue;
    }

    const nextLine = rawLines[index + 1]?.trim() ?? null;
    if (hasSeenH2 && paragraphsSinceLastHeading === 0) {
      pushParagraph(parsed.text);
      continue;
    }
    if (isLikelyHeading(parsed.text, nextLine)) {
      pushHeuristicHeading(parsed.text);
      continue;
    }

    pushParagraph(parsed.text);
  }

  flushList(blocks, listType, listItems);

  return blocksToHtml(blocks);
}
