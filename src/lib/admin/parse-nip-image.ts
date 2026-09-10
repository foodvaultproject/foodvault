import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";
import {
  emptyNipMatrix,
  NIP_NUTRIENTS,
  type NipMatrix,
  type NipNutrientKey,
} from "@/lib/admin/pantry-shared";

const NIP_MODEL = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
const NIP_MODEL_FALLBACK = "gemini-3.6-flash";
const MAX_NIP_TEXT_CHARS = 20_000;

const PAIR_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    per_serve: { type: SchemaType.STRING },
    per_100g: { type: SchemaType.STRING },
  },
  required: ["per_serve", "per_100g"],
};

const NIP_RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    serving_size: { type: SchemaType.STRING },
    servings_per_pack: { type: SchemaType.STRING },
    energy_kj: PAIR_SCHEMA,
    energy_kcal: PAIR_SCHEMA,
    protein: PAIR_SCHEMA,
    fat_total: PAIR_SCHEMA,
    fat_saturated: PAIR_SCHEMA,
    carbs: PAIR_SCHEMA,
    sugars: PAIR_SCHEMA,
    sodium: PAIR_SCHEMA,
  },
  required: [
    "serving_size",
    "servings_per_pack",
    ...NIP_NUTRIENTS.map((nutrient) => nutrient.key),
  ],
};

type NipPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

function asPair(value: unknown): { per_serve: string; per_100g: string } {
  if (!value || typeof value !== "object") {
    return { per_serve: "", per_100g: "" };
  }
  const record = value as Record<string, unknown>;
  return {
    per_serve: typeof record.per_serve === "string" ? record.per_serve.trim() : "",
    per_100g: typeof record.per_100g === "string" ? record.per_100g.trim() : "",
  };
}

function parseNipPayload(raw: string): NipMatrix {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const json = start >= 0 && end > start ? raw.slice(start, end + 1) : raw;
  const parsed = JSON.parse(json) as Record<string, unknown>;
  const nip = emptyNipMatrix();
  nip.serving_size = typeof parsed.serving_size === "string" ? parsed.serving_size.trim() : "";
  nip.servings_per_pack =
    typeof parsed.servings_per_pack === "string" ? parsed.servings_per_pack.trim() : "";
  for (const nutrient of NIP_NUTRIENTS) {
    nip.values[nutrient.key as NipNutrientKey] = asPair(parsed[nutrient.key]);
  }
  return nip;
}

function isMissingModelError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /not found|not supported|404/i.test(message);
}

function createNipModel(apiKey: string, model: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: NIP_RESPONSE_SCHEMA,
    },
  });
}

async function generateNipJson(apiKey: string, parts: NipPart[]): Promise<string> {
  let result;
  try {
    result = await createNipModel(apiKey, NIP_MODEL).generateContent(parts);
  } catch (error) {
    if (NIP_MODEL !== NIP_MODEL_FALLBACK && isMissingModelError(error)) {
      result = await createNipModel(apiKey, NIP_MODEL_FALLBACK).generateContent(parts);
    } else {
      throw error;
    }
  }

  return result.response.text().trim();
}

function requireGeminiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return apiKey;
}

export async function parseNipMatrixFromImage(file: File): Promise<NipMatrix> {
  const apiKey = requireGeminiKey();

  const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
  const mimeType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg";
  const prompt = [
    "Read this New Zealand / Australia Nutrition Information Panel photo.",
    "Return only the structured NIP values. Keep units in the strings (kJ, kcal, g, mg).",
    "Use empty strings when a value is not visible. Do not invent numbers.",
    "servings_per_pack should be the number of servings, serving_size the labelled serving (e.g. 25g).",
    "Map Energy kJ to energy_kj, Energy Cal/kcal to energy_kcal, Protein to protein,",
    "Fat total to fat_total, Saturated to fat_saturated, Carbohydrate to carbs,",
    "Sugars to sugars, Sodium to sodium.",
    "per_serve is Quantity per serving. per_100g is Quantity per 100g or 100mL.",
  ].join(" ");

  const text = await generateNipJson(apiKey, [
    { text: prompt },
    { inlineData: { mimeType, data: bytes } },
  ]);
  if (!text) {
    throw new Error("Could not read nutrition values from that image.");
  }

  try {
    return parseNipPayload(text);
  } catch {
    throw new Error("Could not interpret the nutrition panel. Try a clearer photo.");
  }
}

export async function parseNipMatrixFromText(pastedText: string): Promise<NipMatrix> {
  const apiKey = requireGeminiKey();
  const pasted = pastedText.trim();
  if (!pasted) {
    throw new Error("Paste the nutrition information panel text first.");
  }
  if (pasted.length > MAX_NIP_TEXT_CHARS) {
    throw new Error("Paste a shorter nutrition panel — that text is too long.");
  }

  const prompt = [
    "This is pasted text from a New Zealand / Australia Nutrition Information Panel.",
    "Return only the structured NIP values. Keep units in the strings (kJ, kcal, g, mg).",
    "Use empty strings when a value is not present. Do not invent numbers.",
    "servings_per_pack should be the number of servings, serving_size the labelled serving (e.g. 25g).",
    "Map Energy kJ to energy_kj, Energy Cal/kcal to energy_kcal, Protein to protein,",
    "Fat total to fat_total, Saturated to fat_saturated, Carbohydrate to carbs,",
    "Sugars to sugars, Sodium to sodium.",
    "per_serve is Quantity per serving. per_100g is Quantity per 100g or 100mL.",
    "Pasted text:",
    pasted,
  ].join("\n");

  const text = await generateNipJson(apiKey, [{ text: prompt }]);
  if (!text) {
    throw new Error("Could not read nutrition values from that text.");
  }

  try {
    return parseNipPayload(text);
  } catch {
    throw new Error("Could not interpret the nutrition panel text. Check the paste and try again.");
  }
}
