import { NextResponse } from "next/server";
import {
  hospitalityLocationFromNominatim,
  type NominatimSearchHit,
} from "@/lib/hospitality/nominatim";

export const dynamic = "force-dynamic";

let lastRequestAt = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  const wait = Math.max(0, 1100 - (Date.now() - lastRequestAt));
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastRequestAt = Date.now();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", searchParams.get("format") || "json");
  url.searchParams.set("q", query);
  url.searchParams.set("countrycodes", searchParams.get("countrycodes") || "nz");
  url.searchParams.set("addressdetails", searchParams.get("addressdetails") || "1");
  url.searchParams.set("limit", searchParams.get("limit") || "5");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "FoodVault-App",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to look up addresses right now." },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as NominatimSearchHit[];
  const hits = Array.isArray(payload) ? payload : [];
  const results = hits.map(hospitalityLocationFromNominatim);
  return NextResponse.json({ hits, results });
}
