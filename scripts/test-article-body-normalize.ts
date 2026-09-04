import assert from "node:assert/strict";
import {
  normalizeArticleBodyHtml,
  sanitizeInlineHtml,
  blocksToHtml,
  createBlock,
} from "../src/lib/discover/article-blocks";
import { formatArticleBodyContent } from "../src/lib/discover/format-article-body";

function eq(actual: string, expected: string, label: string) {
  assert.equal(actual, expected, `${label}\n  expected: ${expected}\n  actual:   ${actual}`);
}

console.log("Running article body normalization tests...\n");

eq(
  normalizeArticleBodyHtml(
    "<h2>Section</h2><h3>Subsection</h3><h4>Invalid</h4>"
  ),
  "<h2>Section</h2><h3>Subsection</h3><p>Invalid</p>",
  "TEST 1: H4 converted to paragraph"
);

eq(
  normalizeArticleBodyHtml("<h3>Orphan</h3><p>Text</p>"),
  "<p>Orphan</p><p>Text</p>",
  "TEST 2: Orphan H3 converted to paragraph"
);

eq(
  normalizeArticleBodyHtml(
    "<h2>Section</h2><p>Text</p><h3>Subsection</h3><p>Text</p>"
  ),
  "<h2>Section</h2><p>Text</p><h3>Subsection</h3><p>Text</p>",
  "TEST 3: Valid hierarchy unchanged"
);

eq(
  normalizeArticleBodyHtml(
    "<h1>FoodVault Is Officially Live!</h1><p>Intro</p>",
    "FoodVault Is Officially Live!"
  ),
  "<p>Intro</p>",
  "TEST 4: Duplicate H1 removed when matching title"
);

eq(
  normalizeArticleBodyHtml("<h1>Different Section</h1><p>Intro</p>"),
  "<h2>Different Section</h2><p>Intro</p>",
  "TEST 5: Non-matching H1 converted to H2"
);

eq(
  formatArticleBodyContent(
    "## Explicit H2\nParagraph\n### Explicit H3\nMore content",
    "Unrelated Title"
  ),
  "<h2>Explicit H2</h2><p>Paragraph</p><h3>Explicit H3</h3><p>More content</p>",
  "TEST 6: Explicit Markdown headings preserved"
);

eq(
  formatArticleBodyContent("### Explicit H3\nParagraph", "Unrelated Title"),
  "<h2>Explicit H3</h2><p>Paragraph</p>",
  "TEST 7: Markdown H3 before H2 becomes H2"
);

eq(
  blocksToHtml([
    createBlock("paragraph", sanitizeInlineHtml("Text <h2>Heading</h2>")),
  ]),
  "<p>Text Heading</p>",
  "TEST 8: Inline nested heading stripped from paragraph"
);

eq(
  formatArticleBodyContent(
    "Save with [Join FoodVault](https://www.foodvault.co.nz/signup) and [Grove Avocado Oil](/brands/grove-avocado-oil).",
    "Unrelated Title"
  ),
  '<p>Save with <a href="https://www.foodvault.co.nz/signup">Join FoodVault</a> and <a href="/brands/grove-avocado-oil">Grove Avocado Oil</a>.</p>',
  "TEST 9: Markdown links become clickable anchors"
);

eq(
  formatArticleBodyContent(
    "Members save on Grove Avocado Oil &amp;amp; other Kiwi pantry staples every week.",
    "Unrelated Title"
  ),
  "<p>Members save on Grove Avocado Oil & other Kiwi pantry staples every week.</p>",
  "TEST 10: Double-encoded amp;amp is unescaped before save"
);

console.log("\nAll 10 tests passed.");
