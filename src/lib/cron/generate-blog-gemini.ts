import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";
import {
  featuredPartnerFromPayload,
  type BlogGenerationPayload,
  type BlogRotationCategory,
} from "@/lib/cron/generate-blog";
import { unescapeArticleEntities } from "@/lib/discover/article-inline";
import { parseMetaTags } from "@/lib/discover/meta-tags";

export const GEMINI_BLOG_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
const GEMINI_BLOG_MODEL_FALLBACK = "gemini-3.6-flash";

const BLOG_RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "SEO-optimised blog headline for New Zealand searchers.",
    },
    slug: {
      type: SchemaType.STRING,
      description: "Clean URL-friendly slug using lowercase letters, numbers, and hyphens only.",
    },
    excerpt: {
      type: SchemaType.STRING,
      description: "Short two-sentence preview summary.",
    },
    content: {
      type: SchemaType.STRING,
      description:
        "Rich 600-800 word Markdown post with subheadings, bold highlights, bullet points, and FoodVault basket ROI.",
    },
    category: {
      type: SchemaType.STRING,
      description: "One of: saving, partners, recipes, news.",
    },
    meta_title: {
      type: SchemaType.STRING,
      description: "Search engine title, 50-60 characters.",
    },
    meta_description: {
      type: SchemaType.STRING,
      description:
        "Dedicated SEO and social-preview description, 150-160 characters. Do not exceed 160 characters.",
    },
    tags: {
      type: SchemaType.ARRAY,
      description:
        "Exactly 3 to 5 high-intent SEO keywords, e.g. Partner Spotlight, Independent NZ, Pantry Savings.",
      items: { type: SchemaType.STRING },
      minItems: 3,
      maxItems: 5,
    },
  },
  required: [
    "title",
    "slug",
    "excerpt",
    "content",
    "category",
    "meta_title",
    "meta_description",
    "tags",
  ],
};

export type GeneratedBlogDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: BlogRotationCategory;
  meta_title: string;
  meta_description: string;
  tags: string[];
};

const MIN_META_DESCRIPTION_LENGTH = 150;
const MAX_META_DESCRIPTION_LENGTH = 160;
const MIN_SEO_TAGS = 3;
const MAX_SEO_TAGS = 5;

const FALLBACK_TAGS_BY_CATEGORY: Record<BlogRotationCategory, string[]> = {
  savings: ["Pantry Savings", "Member Pricing", "Independent NZ"],
  partners: ["Partner Spotlight", "Independent NZ", "Member Savings"],
  recipes: ["Kiwi Recipes", "Member Savings", "Weeknight Meals"],
  news: ["NZ Grocery News", "Member Savings", "FoodVault"],
};

const ROTATION_CATEGORY_ALIASES: Record<string, BlogRotationCategory> = {
  saving: "savings",
  savings: "savings",
  partner: "partners",
  partners: "partners",
  brands: "partners",
  recipe: "recipes",
  recipes: "recipes",
  news: "news",
};

function categoryPromptBrief(payload: BlogGenerationPayload): string {
  switch (payload.category) {
    case "savings":
      return [
        "Write a savings article that shows how FoodVault members spend less on everyday Kiwi groceries.",
        "Use the essential category and any featured partner offer exactly as provided — do not invent discounts.",
        "Make the FoodVault basket ROI concrete: membership cost versus typical FoodVault member savings on that shop.",
        "Describe FoodVault savings in their own right. Do not mention or compare against New Zealand supermarkets.",
      ].join(" ");
    case "partners":
      return [
        "Write a partner spotlight introducing this independent New Zealand brand.",
        "Use only the supplied brand history, description, and current FoodVault offer.",
        "Show how that exclusive offer improves a typical member basket.",
      ].join(" ");
    case "recipes":
      return [
        "Write a simple weeknight recipe article using the supplied partner ingredients and Kiwi pantry staples.",
        "Include servings, time, ingredients as bullets, and 5-7 clear steps.",
        "Close with where members can buy the hero ingredients at FoodVault prices and how that lifts basket ROI.",
      ].join(" ");
    case "news":
      return [
        payload.context.openaiInstruction,
        payload.context.foodVaultAngle,
        "Keep the story on FoodVault member savings and independent Kiwi brands. Do not invent specific CPI or inflation statistics.",
      ].join(" ");
  }
}

function contextForPrompt(payload: BlogGenerationPayload): unknown {
  const partner = featuredPartnerFromPayload(payload);
  const partnerSummary = partner
    ? {
        id: partner.id,
        businessName: partner.businessName,
        slug: partner.slug,
        brandHistory: partner.brandHistory,
        description: partner.description,
        departments: partner.departments,
        offer: partner.offer,
        profilePath: partner.slug ? `/brands/${partner.slug}` : null,
      }
    : null;

  if (payload.category === "partners") {
    return { partner: partnerSummary };
  }

  if (payload.category === "savings") {
    const { partner: _partner, ...rest } = payload.context;
    return { ...rest, partner: partnerSummary };
  }

  if (payload.category === "recipes") {
    const { partner: _partner, ...rest } = payload.context;
    return { ...rest, partner: partnerSummary };
  }

  return payload.context;
}

function buildPrompt(payload: BlogGenerationPayload): string {
  const outputCategory =
    payload.category === "savings" ? "saving" : payload.category;

  return [
    "You are the FoodVault Discover editor. FoodVault is a New Zealand membership that unlocks exclusive pricing from independent food and household brands.",
    "Tone: inviting, local Kiwi — warm, practical, and confident. Write as Mark, Kiwi & Piggy.",
    "Always emphasise FoodVault basket ROI: how exclusive member pricing pays back the membership fee across a typical shop.",
    "It is fine to talk about saving money and how FoodVault helps Kiwi consumers save, including what those savings are.",
    "Never mention, criticise, or compare FoodVault with New Zealand supermarkets or grocery chains. Do not name Countdown, Woolworths, Pak'nSave, New World, FreshChoice, SuperValue, Four Square, The Warehouse, Foodstuffs, or any other NZ supermarket. Do not use framing such as cheaper than the supermarket, instead of supermarket prices, supermarket specials, supermarket inflation, duopoly, or full retail supermarket prices. Speak only about FoodVault member pricing, independent Kiwi brands, and the value of membership.",
    "",
    categoryPromptBrief(payload),
    "",
    `Selected rotation category: ${payload.category}.`,
    `Set the JSON "category" field to exactly: ${outputCategory}.`,
    "Return only JSON matching the schema.",
    "title: SEO-optimised blog headline.",
    "slug: clean, URL-friendly kebab-case.",
    "excerpt: exactly two sentences for the article card.",
    "meta_description: a dedicated search-engine and social-preview description, 150-160 characters maximum. Lead with the search intent and include FoodVault. Do not exceed 160 characters.",
    "tags: exactly 3 to 5 highly relevant, high-intent keywords, e.g. [\"Partner Spotlight\", \"Independent NZ\", \"Pantry Savings\"]. No generic filler and no more than 5 tags.",
    "content: 600-800 words of standard Markdown with ## / ### subheadings, **bold highlights**, bullet points, and a FoodVault CTA.",
    "When referencing FoodVault routes, always write standard Markdown hyperlinked text using valid absolute or root relative URLs, e.g., [Join FoodVault](https://www.foodvault.co.nz/signup) or [Grove Avocado Oil](/brands/grove-avocado-oil). Never print raw unlinked paths.",
    "Use a literal & character in titles and body text. Do not emit HTML entities such as &amp; or &amp;amp;.",
    "Include a clear Markdown call-to-action such as [Join FoodVault](https://www.foodvault.co.nz/signup).",
    "Do not invent prices, discount percentages, or brand facts that are not in the context.",
    "Do not wrap the JSON in markdown fences.",
    "",
    "Context payload:",
    JSON.stringify(contextForPrompt(payload), null, 2),
  ].join("\n");
}

export function clampMetaDescription(text: string, fallback: string): string {
  const source =
    unescapeArticleEntities(text).trim() || unescapeArticleEntities(fallback).trim();
  if (source.length <= MAX_META_DESCRIPTION_LENGTH) {
    return source;
  }

  const sliced = source.slice(0, MAX_META_DESCRIPTION_LENGTH);
  const lastSpace = sliced.lastIndexOf(" ");
  const trimmed =
    lastSpace >= MIN_META_DESCRIPTION_LENGTH ? sliced.slice(0, lastSpace) : sliced;
  return trimmed.replace(/[.,;:]\s*$/, "").trim();
}

export function normalizeGeneratedTags(
  raw: unknown,
  category: BlogRotationCategory
): string[] {
  const parsed = parseMetaTags(raw)
    .map((tag) => unescapeArticleEntities(tag))
    .filter(Boolean);
  const unique: string[] = [];
  for (const tag of parsed) {
    if (!unique.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      unique.push(tag);
    }
  }

  for (const fallback of FALLBACK_TAGS_BY_CATEGORY[category]) {
    if (unique.length >= MIN_SEO_TAGS) break;
    if (!unique.some((existing) => existing.toLowerCase() === fallback.toLowerCase())) {
      unique.push(fallback);
    }
  }

  return unique.slice(0, MAX_SEO_TAGS);
}

function parseGeneratedBlog(
  text: string,
  fallbackCategory: BlogRotationCategory
): GeneratedBlogDraft {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Gemini returned invalid JSON for the blog draft");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini JSON was not an object");
  }

  const row = parsed as Record<string, unknown>;
  const title = unescapeArticleEntities(String(row.title ?? "").trim());
  const excerpt = unescapeArticleEntities(String(row.excerpt ?? "").trim());
  let content = unescapeArticleEntities(String(row.content ?? "").trim());
  content = content.replace(/&amp;amp;/g, "&").replace(/&amp;/g, "&");
  const slug = String(row.slug ?? "").trim();
  const metaTitle = unescapeArticleEntities(String(row.meta_title ?? "").trim());
  const metaDescription = unescapeArticleEntities(
    String(row.meta_description ?? "").trim()
  );

  if (!title || !excerpt || !content) {
    throw new Error("Gemini draft was missing title, excerpt, or content");
  }

  const mappedCategory =
    ROTATION_CATEGORY_ALIASES[String(row.category ?? "").trim().toLowerCase()] ??
    fallbackCategory;

  return {
    title,
    slug,
    excerpt,
    content,
    category: mappedCategory,
    meta_title: metaTitle || title,
    meta_description: clampMetaDescription(metaDescription, excerpt),
    tags: normalizeGeneratedTags(row.tags ?? row.meta_tags, mappedCategory),
  };
}

function isMissingModelError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /not found|not supported|404/i.test(message);
}

function createBlogModel(apiKey: string, model: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: BLOG_RESPONSE_SCHEMA,
    },
  });
}

export async function generateBlogDraftWithGemini(
  payload: BlogGenerationPayload
): Promise<GeneratedBlogDraft> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = buildPrompt(payload);
  const preferredModel = GEMINI_BLOG_MODEL;

  let result;
  try {
    result = await createBlogModel(apiKey, preferredModel).generateContent(prompt);
  } catch (error) {
    if (preferredModel !== GEMINI_BLOG_MODEL_FALLBACK && isMissingModelError(error)) {
      console.warn(
        `[generate-blog] ${preferredModel} unavailable, retrying with ${GEMINI_BLOG_MODEL_FALLBACK}`
      );
      result = await createBlogModel(apiKey, GEMINI_BLOG_MODEL_FALLBACK).generateContent(prompt);
    } else {
      throw error;
    }
  }

  const text = result.response.text().trim();
  if (!text) {
    throw new Error("Gemini returned an empty blog draft");
  }

  return parseGeneratedBlog(text, payload.category);
}
