import {
  HOSPITALITY_VENUE_TYPE_LABELS,
} from "@/lib/hospitality/constants";
import {
  formatHospitalityLocationLabel,
  type HospitalityDetails,
  type HospitalityVenueType,
} from "@/lib/hospitality/types";
import type { BrandCard } from "@/lib/member/browse-brands-types";
import type { PartnerProfile } from "@/lib/member/partner-profile";

export type HospitalityDemoVenue = {
  id: string;
  slug: string;
  businessName: string;
  shortDescription: string;
  brandStory: string;
  bannerImageUrl: string;
  logoUrl: string | null;
  galleryImageUrls: string[];
  discountPercent: number | null;
  discountLabel: string;
  hospitality: HospitalityDetails;
};

const DEMO_VENUES: HospitalityDemoVenue[] = [
  {
    id: "hosp-harbourlight-cafe",
    slug: "harbourlight-cafe",
    businessName: "Harbourlight Cafe",
    shortDescription: "Waterfront brunch, specialty coffee, and house-baked sweets.",
    brandStory:
      "Harbourlight is a neighbourhood cafe on the Wellington waterfront. We roast locally, bake in-house, and keep a short seasonal menu so every plate feels considered. FoodVault members are welcomed in-store with a simple membership check at the counter.",
    bannerImageUrl: "/trending-homepage/bakery-hp.webp",
    logoUrl: null,
    galleryImageUrls: [
      "/trending-homepage/bakery-hp.webp",
      "/homepage banner 2/banner-2.webp",
      "/how-it-works/how-it-works-hero-image.webp",
    ],
    discountPercent: 15,
    discountLabel: "15% Off Total Bill",
    hospitality: {
      venueType: "cafe",
      location: {
        street: "12 Customhouse Quay",
        suburb: "Wellington Central",
        city: "Wellington",
        region: "Wellington",
        lat: -41.2848,
        lng: 174.779,
        displayName: "12 Customhouse Quay, Wellington Central, Wellington",
      },
      openingHours: "Mon–Fri 7:00am–3:00pm · Sat–Sun 8:00am–4:00pm",
      phone: "044555121",
      offerCategory: "percentage_off",
      offerTitle: "15% Off Total Bill",
      offerTerms: "Dine-in only. Excludes alcohol and gift cards. One redemption per visit.",
      redemptionCap: "once_per_visit",
    },
  },
  {
    id: "hosp-the-sourdough-room",
    slug: "the-sourdough-room",
    businessName: "The Sourdough Room",
    shortDescription: "Slow-fermented loaves, pastries, and weekend bun drops.",
    brandStory:
      "The Sourdough Room is a Ponsonby bakery built around long ferments and a small daily bake. Members can claim a complimentary pastry with any loaf — just show your FoodVault membership at the counter.",
    bannerImageUrl: "/homepage banner 2/banner-2.webp",
    logoUrl: null,
    galleryImageUrls: [
      "/homepage banner 2/banner-2.webp",
      "/trending-homepage/bakery-hp.webp",
      "/homepage banner 3/banner-3.webp",
    ],
    discountPercent: null,
    discountLabel: "Free Pastry With Any Loaf",
    hospitality: {
      venueType: "bakery",
      location: {
        street: "318 Ponsonby Road",
        suburb: "Ponsonby",
        city: "Auckland",
        region: "Auckland",
        lat: -36.857,
        lng: 174.744,
        displayName: "318 Ponsonby Road, Ponsonby, Auckland",
      },
      openingHours: "Wed–Sun 7:00am–2:00pm",
      phone: "093761440",
      offerCategory: "free_item",
      offerTitle: "Free Pastry With Any Loaf",
      offerTerms: "Valid on the day of purchase. Subject to pastry availability. One per visit.",
      redemptionCap: "once_per_visit",
    },
  },
  {
    id: "hosp-ember-and-vine",
    slug: "ember-and-vine",
    businessName: "Ember & Vine",
    shortDescription: "Seasonal plates, wood-fired cooking, and a tight wine list.",
    brandStory:
      "Ember & Vine is a neighbourhood restaurant in Christchurch Central. We cook over fire, work with Canterbury growers, and keep the room warm and unfussy. Members receive 15% off the food bill when they show their membership.",
    bannerImageUrl: "/homepage banner 3/banner-3.webp",
    logoUrl: null,
    galleryImageUrls: [
      "/homepage banner 3/banner-3.webp",
      "/trending-homepage/drinks-hp.webp",
      "/home/hero-visitor-background.webp",
    ],
    discountPercent: 15,
    discountLabel: "15% Off Food Bill",
    hospitality: {
      venueType: "restaurant",
      location: {
        street: "88 Cashel Street",
        suburb: "Christchurch Central",
        city: "Christchurch",
        region: "Canterbury",
        lat: -43.533,
        lng: 172.637,
        displayName: "88 Cashel Street, Christchurch Central, Christchurch",
      },
      openingHours: "Tue–Sun 5:00pm–10:00pm",
      phone: "033655890",
      offerCategory: "percentage_off",
      offerTitle: "15% Off Food Bill",
      offerTerms: "Dine-in only. Excludes alcohol, corkage, and tasting menus. One redemption per visit.",
      redemptionCap: "once_per_visit",
    },
  },
  {
    id: "hosp-kereru-deli",
    slug: "kereru-deli",
    businessName: "Kererū Deli",
    shortDescription: "House-cured meats, cheeses, and ready-to-eat picnic fare.",
    brandStory:
      "Kererū Deli is a Dunedin favourite for sandwiches, cheeses, and pantry finds. FoodVault members can claim our weekend picnic bundle — a sandwich, salad, and drink — at a member-only price.",
    bannerImageUrl: "/trending-homepage/pantry-hp.webp",
    logoUrl: null,
    galleryImageUrls: [
      "/trending-homepage/pantry-hp.webp",
      "/homepage banner 2/banner-2.webp",
      "/trending-homepage/bakery-hp.webp",
    ],
    discountPercent: null,
    discountLabel: "Weekend Picnic Bundle",
    hospitality: {
      venueType: "deli",
      location: {
        street: "15 George Street",
        suburb: "Dunedin Central",
        city: "Dunedin",
        region: "Otago",
        lat: -45.874,
        lng: 170.504,
        displayName: "15 George Street, Dunedin Central, Dunedin",
      },
      openingHours: "Mon–Sat 8:00am–5:00pm · Sun 9:00am–3:00pm",
      phone: "034777210",
      offerCategory: "special_bundle",
      offerTitle: "Weekend Picnic Bundle",
      offerTerms: "Saturday and Sunday only. Includes one sandwich, one salad, and one drink. Dine-in or takeaway.",
      redemptionCap: "once_per_visit",
    },
  },
  {
    id: "hosp-cloud-nine-espresso",
    slug: "cloud-nine-espresso",
    businessName: "Cloud Nine Espresso",
    shortDescription: "City espresso bar with rotating single origins and toasties.",
    brandStory:
      "Cloud Nine is a compact CBD espresso bar for people who care about their morning coffee. Members get a free upgrade to our guest filter or a large milk coffee — show your membership when you order.",
    bannerImageUrl: "/trending-homepage/drinks-hp.webp",
    logoUrl: null,
    galleryImageUrls: [
      "/trending-homepage/drinks-hp.webp",
      "/home/hero-visitor-background.webp",
      "/how-it-works/how-it-works-hero-image.webp",
    ],
    discountPercent: null,
    discountLabel: "Free Coffee Upgrade",
    hospitality: {
      venueType: "cafe",
      location: {
        street: "44 High Street",
        suburb: "Auckland CBD",
        city: "Auckland",
        region: "Auckland",
        lat: -36.8485,
        lng: 174.7633,
        displayName: "44 High Street, Auckland CBD, Auckland",
      },
      openingHours: "Mon–Fri 6:30am–3:30pm",
      phone: "093090118",
      offerCategory: "exclusive_perk",
      offerTitle: "Free Coffee Upgrade",
      offerTerms: "Upgrade any regular coffee to large, or swap to the guest filter at no extra cost. One per visit.",
      redemptionCap: "once_per_visit",
    },
  },
  {
    id: "hosp-little-loaf",
    slug: "little-loaf",
    businessName: "Little Loaf",
    shortDescription: "Newtown bakery counter with laminated pastries and sandwiches.",
    brandStory:
      "Little Loaf is a tiny Newtown bakehouse with a loyal morning queue. Members receive 15% off the bakery cabinet — croissants, sandwiches, and sweet buns included.",
    bannerImageUrl: "/how-it-works/how-it-works-hero-image.webp",
    logoUrl: null,
    galleryImageUrls: [
      "/how-it-works/how-it-works-hero-image.webp",
      "/trending-homepage/bakery-hp.webp",
      "/homepage banner 2/banner-2.webp",
    ],
    discountPercent: 15,
    discountLabel: "15% Off Bakery Cabinet",
    hospitality: {
      venueType: "bakery",
      location: {
        street: "204 Riddiford Street",
        suburb: "Newtown",
        city: "Wellington",
        region: "Wellington",
        lat: -41.314,
        lng: 174.78,
        displayName: "204 Riddiford Street, Newtown, Wellington",
      },
      openingHours: "Thu–Mon 7:30am–2:00pm",
      phone: "043891002",
      offerCategory: "percentage_off",
      offerTitle: "15% Off Bakery Cabinet",
      offerTerms: "Applies to bakery cabinet items only. Excludes wholesale and pre-orders. One redemption per visit.",
      redemptionCap: "once_per_visit",
    },
  },
  {
    id: "hosp-south-island-smokehouse",
    slug: "south-island-smokehouse",
    businessName: "South Island Smokehouse",
    shortDescription: "Queenstown smokehouse plates, sharing boards, and local beer.",
    brandStory:
      "South Island Smokehouse is a casual Queenstown restaurant built around slow smoke and sharing boards. Members get 10% off food when they show an active FoodVault membership.",
    bannerImageUrl: "/home/hero-visitor-background.webp",
    logoUrl: null,
    galleryImageUrls: [
      "/home/hero-visitor-background.webp",
      "/homepage banner 3/banner-3.webp",
      "/trending-homepage/drinks-hp.webp",
    ],
    discountPercent: 10,
    discountLabel: "10% Off Food",
    hospitality: {
      venueType: "restaurant",
      location: {
        street: "9 Beach Street",
        suburb: "Queenstown",
        city: "Queenstown",
        region: "Otago",
        lat: -45.032,
        lng: 168.661,
        displayName: "9 Beach Street, Queenstown",
      },
      openingHours: "Daily 12:00pm–9:00pm",
      phone: "034427760",
      offerCategory: "percentage_off",
      offerTitle: "10% Off Food",
      offerTerms: "Dine-in only. Excludes alcohol and public holidays. One redemption per visit.",
      redemptionCap: "once_per_visit",
    },
  },
  {
    id: "hosp-grey-lynn-provisions",
    slug: "grey-lynn-provisions",
    businessName: "Grey Lynn Provisions",
    shortDescription: "Neighbourhood deli for sandwiches, pantry staples, and coffee.",
    brandStory:
      "Grey Lynn Provisions is a walk-up deli for weekday lunches and Sunday provisions. Members can claim a free coffee with any sandwich or salad bowl.",
    bannerImageUrl: "/trending-homepage/pantry-hp.webp",
    logoUrl: null,
    galleryImageUrls: [
      "/trending-homepage/pantry-hp.webp",
      "/trending-homepage/drinks-hp.webp",
      "/homepage banner 2/banner-2.webp",
    ],
    discountPercent: null,
    discountLabel: "Free Coffee With Lunch",
    hospitality: {
      venueType: "deli",
      location: {
        street: "510 Great North Road",
        suburb: "Grey Lynn",
        city: "Auckland",
        region: "Auckland",
        lat: -36.858,
        lng: 174.737,
        displayName: "510 Great North Road, Grey Lynn, Auckland",
      },
      openingHours: "Mon–Sat 8:00am–4:00pm",
      phone: "093600441",
      offerCategory: "exclusive_perk",
      offerTitle: "Free Coffee With Lunch",
      offerTerms: "Free regular coffee with any sandwich or salad. Dine-in or takeaway. One per visit.",
      redemptionCap: "once_per_visit",
    },
  },
];

export function listHospitalityDemoVenues() {
  return DEMO_VENUES;
}

export function isHospitalityDemoListing(idOrSlug: string) {
  const normalized = idOrSlug.trim().toLowerCase();
  return DEMO_VENUES.some(
    (venue) => venue.id === normalized || venue.slug === normalized
  );
}

export function getHospitalityDemoVenueBySlug(slug: string) {
  const normalized = slug.trim().toLowerCase();
  return DEMO_VENUES.find((venue) => venue.slug === normalized) ?? null;
}

export function getHospitalityDemoVenueById(id: string) {
  return DEMO_VENUES.find((venue) => venue.id === id) ?? null;
}

export function hospitalityLocationLabel(venue: HospitalityDemoVenue) {
  return formatHospitalityLocationLabel(venue.hospitality.location);
}

export function hospitalityVenueToBrandCard(venue: HospitalityDemoVenue): BrandCard {
  return {
    id: venue.id,
    businessName: venue.businessName,
    slug: venue.slug,
    shortDescription: venue.shortDescription,
    department: HOSPITALITY_VENUE_TYPE_LABELS[venue.hospitality.venueType],
    departments: [HOSPITALITY_VENUE_TYPE_LABELS[venue.hospitality.venueType]],
    subcategories: [],
    dietaryLifestyleAttributes: [],
    offerType: venue.hospitality.offerCategory,
    discountLabel: venue.discountLabel,
    discountPercent: venue.discountPercent,
    bannerImageUrl: venue.bannerImageUrl,
    galleryImageUrl: venue.galleryImageUrls[0] ?? venue.bannerImageUrl,
    logoUrl: venue.logoUrl,
    logoOriginalUrl: venue.logoUrl,
    logoCrop: null,
    location: hospitalityLocationLabel(venue),
    isFeatured: false,
    listingModel: "hospitality_venue",
    venueType: venue.hospitality.venueType,
    locationLabel: hospitalityLocationLabel(venue),
  };
}

export function hospitalityVenueToProfile(venue: HospitalityDemoVenue): PartnerProfile {
  const venueTypeLabel = HOSPITALITY_VENUE_TYPE_LABELS[venue.hospitality.venueType];

  return {
    id: venue.id,
    slug: venue.slug,
    businessName: venue.businessName,
    shortDescription: venue.shortDescription,
    brandStory: venue.brandStory,
    websiteUrl: null,
    country: "New Zealand",
    department: venueTypeLabel,
    departments: [venueTypeLabel],
    subcategories: [],
    categoryGroups: [],
    offerType: venue.hospitality.offerCategory,
    discountValue: venue.discountLabel,
    discountPercent: venue.discountPercent,
    discountLabel: venue.discountLabel,
    offerScope: "entire_store",
    selectedProducts: [],
    offerAppliesTo: null,
    offerExclusions: venue.hospitality.offerTerms,
    bannerImageUrl: venue.bannerImageUrl,
    logoUrl: venue.logoUrl,
    logoOriginalUrl: venue.logoUrl,
    logoCrop: null,
    galleryImageUrls: venue.galleryImageUrls,
    offerImageUrls: [],
    instagram: null,
    facebook: null,
    linkedin: null,
    tiktok: null,
    youtube: null,
    isFeatured: false,
    affiliateEnabled: false,
    affiliateCommissionPercent: null,
    affiliateCookieDurationDays: null,
    affiliateProgramDescription: null,
    affiliateTerms: null,
    vaultDrop: null,
    listingModel: "hospitality_venue",
    hospitality: venue.hospitality,
  };
}

export type HospitalityVenueFilters = {
  search?: string;
  region?: string;
  city?: string;
  venueType?: HospitalityVenueType | "";
};

export function filterHospitalityDemoVenues(
  filters: HospitalityVenueFilters = {}
): HospitalityDemoVenue[] {
  const search = filters.search?.trim().toLowerCase() ?? "";
  const region = filters.region?.trim() ?? "";
  const city = filters.city?.trim().toLowerCase() ?? "";
  const venueType = filters.venueType ?? "";

  return DEMO_VENUES.filter((venue) => {
    if (venueType && venue.hospitality.venueType !== venueType) {
      return false;
    }

    if (region === "other") {
      const current = venue.hospitality.location.region;
      if (
        current === "Auckland" ||
        current === "Wellington" ||
        current === "Canterbury"
      ) {
        return false;
      }
    } else if (region && venue.hospitality.location.region !== region) {
      return false;
    }

    if (city) {
      const suburb = venue.hospitality.location.suburb.toLowerCase();
      const venueCity = venue.hospitality.location.city.toLowerCase();
      if (!suburb.includes(city) && !venueCity.includes(city)) {
        return false;
      }
    }

    if (search) {
      const haystack = [
        venue.businessName,
        venue.shortDescription,
        venue.discountLabel,
        venue.hospitality.location.suburb,
        venue.hospitality.location.city,
        venue.hospitality.location.region,
        HOSPITALITY_VENUE_TYPE_LABELS[venue.hospitality.venueType],
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

export function listHospitalityCityOptions(region?: string) {
  const venues = filterHospitalityDemoVenues({
    region: region && region !== "other" ? region : undefined,
  });
  const values = new Set<string>();
  for (const venue of venues) {
    const suburb = venue.hospitality.location.suburb.trim();
    const city = venue.hospitality.location.city.trim();
    if (suburb) values.add(suburb);
    if (city) values.add(city);
  }
  return [...values].sort((a, b) => a.localeCompare(b));
}
