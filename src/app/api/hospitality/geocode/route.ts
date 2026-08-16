import { NextResponse } from "next/server";
import { normalizeNzRegion } from "@/lib/hospitality/constants";
import type { HospitalityLocation } from "@/lib/hospitality/types";

export const dynamic = "force-dynamic";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  region?: string;
};

type NominatimResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
};

let lastRequestAt = 0;

function mapNominatimResult(result: NominatimResult): HospitalityLocation {
  const address = result.address ?? {};
  const street = [address.house_number, address.road ?? address.pedestrian]
    .filter(Boolean)
    .join(" ");
  const suburb =
    address.suburb ?? address.neighbourhood ?? address.city_district ?? "";
  const city = address.city ?? address.town ?? address.village ?? "";
  const region = normalizeNzRegion(address.state ?? address.region ?? "");

  return {
    street,
    suburb,
    city,
    region,
    lat: result.lat ? Number(result.lat) : null,
    lng: result.lon ? Number(result.lon) : null,
    displayName: result.display_name ?? [street, suburb, city, region].filter(Boolean).join(", "),
  };
}

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
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "nz");
  url.searchParams.set("limit", "6");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "FoodVault/1.0 (hospitality-address-lookup)",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to look up addresses right now." },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as NominatimResult[];
  const results = Array.isArray(payload) ? payload.map(mapNominatimResult) : [];

  return NextResponse.json({ results });
}
