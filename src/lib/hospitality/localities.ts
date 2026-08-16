import { NZ_REGIONS, type NzRegion } from "@/lib/hospitality/constants";

export const NZ_LOCALITIES_BY_REGION: Record<NzRegion, readonly string[]> = {
  Northland: [
    "Whangārei",
    "Kerikeri",
    "Paihia",
    "Russell",
    "Kaitaia",
    "Dargaville",
    "Mangawhai",
    "Waipu",
  ],
  Auckland: [
    "Auckland CBD",
    "Ponsonby",
    "Grey Lynn",
    "Kingsland",
    "Mount Eden",
    "Mount Albert",
    "Newmarket",
    "Parnell",
    "Remuera",
    "Mission Bay",
    "St Heliers",
    "Takapuna",
    "Devonport",
    "Birkenhead",
    "Albany",
    "Henderson",
    "New Lynn",
    "Avondale",
    "Onehunga",
    "Ellerslie",
    "Howick",
    "Pakuranga",
    "Botany",
    "Manukau",
    "Papatoetoe",
    "Otahuhu",
    "Westgate",
    "Orewa",
    "Waiheke Island",
  ],
  Waikato: [
    "Hamilton",
    "Cambridge",
    "Te Awamutu",
    "Huntly",
    "Morrinsville",
    "Matamata",
    "Taupō",
    "Tokoroa",
  ],
  "Bay of Plenty": [
    "Tauranga",
    "Mount Maunganui",
    "Papamoa",
    "Rotorua",
    "Whakatāne",
    "Te Puke",
    "Katikati",
  ],
  Gisborne: ["Gisborne"],
  "Hawke's Bay": ["Napier", "Hastings", "Havelock North", "Taradale", "Wairoa"],
  Taranaki: ["New Plymouth", "Hāwera", "Stratford", "Inglewood"],
  "Manawatū-Whanganui": [
    "Palmerston North",
    "Whanganui",
    "Feilding",
    "Levin",
    "Taihape",
  ],
  Wellington: [
    "Wellington Central",
    "Te Aro",
    "Mount Victoria",
    "Newtown",
    "Island Bay",
    "Kilbirnie",
    "Miramar",
    "Karori",
    "Thorndon",
    "Kelburn",
    "Brooklyn",
    "Petone",
    "Lower Hutt",
    "Upper Hutt",
    "Porirua",
    "Eastbourne",
  ],
  Tasman: ["Richmond", "Motueka", "Māpua", "Takaka"],
  Nelson: ["Nelson", "Stoke", "Tahunanui"],
  Marlborough: ["Blenheim", "Picton", "Renwick"],
  "West Coast": ["Greymouth", "Westport", "Hokitika", "Punakaiki"],
  Canterbury: [
    "Christchurch Central",
    "Christchurch",
    "Addington",
    "Riccarton",
    "Merivale",
    "Papanui",
    "Sydenham",
    "Cashmere",
    "Sumner",
    "Lyttelton",
    "Rolleston",
    "Rangiora",
    "Kaiapoi",
    "Timaru",
    "Ashburton",
  ],
  Otago: [
    "Dunedin Central",
    "South Dunedin",
    "North Dunedin",
    "St Clair",
    "Mosgiel",
    "Queenstown",
    "Wanaka",
    "Arrowtown",
    "Cromwell",
    "Oamaru",
  ],
  Southland: ["Invercargill", "Gore", "Te Anau", "Queenstown"],
};

export function listNzLocalitiesForRegion(region?: string | null) {
  if (!region || region === "other") {
    return [...new Set(NZ_REGIONS.flatMap((name) => NZ_LOCALITIES_BY_REGION[name]))].sort(
      (a, b) => a.localeCompare(b)
    );
  }

  const match = NZ_REGIONS.find(
    (name) => name.toLowerCase() === region.trim().toLowerCase()
  );
  return match ? [...NZ_LOCALITIES_BY_REGION[match]] : [];
}

export function filterSuggestions(options: readonly string[], query: string, limit = 8) {
  const needle = query.trim().toLowerCase();
  const ranked = needle
    ? options.filter((option) => option.toLowerCase().includes(needle))
    : [...options];

  ranked.sort((a, b) => {
    if (!needle) return a.localeCompare(b);
    const aStarts = a.toLowerCase().startsWith(needle) ? 0 : 1;
    const bStarts = b.toLowerCase().startsWith(needle) ? 0 : 1;
    return aStarts - bStarts || a.localeCompare(b);
  });

  return ranked.slice(0, limit);
}
