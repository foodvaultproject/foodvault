import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugifyTitle } from "@/lib/admin/types";
import { pantryProductPath } from "@/lib/commerce/catalog";
import { getActiveVaultMarketProducts } from "@/lib/commerce/products";
import { STOCKUP_ARTICLE_AUTHOR } from "@/lib/discover/constants";
import { normalizeArticleBodyHtml } from "@/lib/discover/article-blocks";
import { unescapeArticleEntities } from "@/lib/discover/article-inline";
import { formatArticleBodyContent } from "@/lib/discover/format-article-body";
import { parseDiscoverFaqs, parseMetaTags } from "@/lib/discover/meta-tags";
import { formatNzPrice } from "@/lib/partner-offer";
import type { FoodVaultProduct } from "@/types/commerce";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";

const RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    slug: { type: SchemaType.STRING },
    excerpt: { type: SchemaType.STRING },
    content: { type: SchemaType.STRING },
    category: { type: SchemaType.STRING },
    meta_title: { type: SchemaType.STRING },
    meta_description: { type: SchemaType.STRING },
    tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    related_product_ids: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    faqs: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          answer: { type: SchemaType.STRING },
        },
        required: ["question", "answer"],
      },
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
    "related_product_ids",
    "faqs",
  ],
};

type StockUpCategory = "News" | "Savings";

function estimateReadTimeMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(5, Math.min(15, Math.round(words / 200)));
}

async function nextCategory(admin: SupabaseClient): Promise<StockUpCategory> {
  const { data } = await admin
    .from("discover_articles")
    .select("category")
    .eq("site", "stockup")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.category === "Savings" ? "News" : "Savings";
}

async function uniqueSlug(admin: SupabaseClient, raw: string, title: string) {
  const base = slugifyTitle(raw) || slugifyTitle(title) || `stockup-${Date.now()}`;
  let slug = base === "news" || base === "savings" ? `${base}-guide` : base;
  for (let suffix = 2; suffix < 20; suffix += 1) {
    const { data } = await admin
      .from("discover_articles")
      .select("id")
      .eq("site", "stockup")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${suffix}`;
  }
  return `${base}-${Date.now()}`;
}

function productContext(products: FoodVaultProduct[]) {
  return products.slice(0, 8).map((product) => ({
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: formatNzPrice(product.member_price),
    path: pantryProductPath(product),
    inStock: product.stock_quantity > 0,
  }));
}

export async function generateAndSaveStockUpArticle(
  admin: SupabaseClient,
  options: { publish: boolean }
) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const category = await nextCategory(admin);
  const products = (await getActiveVaultMarketProducts()).filter(
    (product) => product.is_active && product.stock_quantity > 0
  );
  const featured = products.slice(0, 6);
  if (featured.length === 0) {
    throw new Error("No in-stock StockUp products are available to write about.");
  }

  const prompt = [
    "You are the StockUp editor. StockUp is a New Zealand online supermarket that delivers groceries directly.",
    "Write only about StockUp, NZ grocery shopping, saver pricing, and the supplied in-stock products.",
    "Never mention FoodVault, memberships, partner brands, or any other grocery website.",
    `Write a ${category} article.`,
    "Set category to exactly News or Savings, matching the requested category.",
    "content: 600-800 words of Markdown with ## subheadings. Link products with markdown using the supplied path, and include a shopping CTA to [Shop StockUp](/pantry).",
    "tags: 3 to 5 NZ grocery search keywords.",
    "related_product_ids: 2 to 4 ids copied from the supplied products.",
    "faqs: 2 or 3 shopper questions with practical answers about price, delivery, or how to use the products.",
    "Do not invent prices. Use only the prices in the context.",
    "Context:",
    JSON.stringify({ category, products: productContext(featured) }),
  ].join("\n");

  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });
  const result = await model.generateContent(prompt);
  const raw = JSON.parse(result.response.text()) as Record<string, unknown>;
  const title = String(raw.title ?? "").trim();
  const content = unescapeArticleEntities(String(raw.content ?? ""));
  if (!title || !content) throw new Error("StockUp draft was empty");

  const allowedIds = new Set(featured.map((product) => product.id));
  const related = (Array.isArray(raw.related_product_ids) ? raw.related_product_ids : [])
    .map((id) => String(id))
    .filter((id) => allowedIds.has(id))
    .slice(0, 4);
  const relatedIds = related.length > 0 ? related : featured.slice(0, 3).map((product) => product.id);
  const faqs = parseDiscoverFaqs(raw.faqs).slice(0, 3);
  const now = new Date().toISOString();
  const slug = await uniqueSlug(admin, String(raw.slug ?? ""), title);
  const cmsCategory: StockUpCategory = category;

  const { data, error } = await admin
    .from("discover_articles")
    .insert({
      site: "stockup",
      title,
      slug,
      category: cmsCategory,
      summary: String(raw.excerpt ?? "").trim(),
      body: normalizeArticleBodyHtml(formatArticleBodyContent(content, title), title),
      hero_image_url: featured.find((product) => relatedIds.includes(product.id))?.image_url ?? null,
      meta_title: String(raw.meta_title ?? title).trim(),
      meta_description: String(raw.meta_description ?? raw.excerpt ?? "").trim().slice(0, 160),
      meta_tags: parseMetaTags(raw.tags).slice(0, 5),
      related_product_ids: relatedIds,
      faqs,
      featured: false,
      publish_date: options.publish ? now : null,
      status: options.publish ? "PUBLISHED" : "DRAFT",
      author_name: STOCKUP_ARTICLE_AUTHOR,
      read_time_minutes: estimateReadTimeMinutes(content),
      updated_at: now,
    })
    .select("id, slug, title, category")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Could not save the StockUp article");
  }

  return data as { id: string; slug: string; title: string; category: string };
}
