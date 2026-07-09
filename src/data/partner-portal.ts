export const offerAppliesToOptions = ["Entire Store", "Selected Products"] as const;

/** @deprecated Prefer offerScope from partner-offer.ts */
export function normalizeOfferAppliesTo(value: string | null | undefined): string {
  if (value === "Selected Products") return "Selected Products";
  return "Entire Store";
}

export const defaultPartnerListing = {
  companyName: "Alpha Organics",
  websiteUrl: "https://alphaorganics.co.nz",
  shortDescription: "Organic groceries delivered with zero-waste packaging.",
  brandStory:
    "At Alpha Organics, we believe that high-quality nutrition should be accessible without compromising the planet. Based in Auckland, we source seasonal produce and pantry staples from trusted New Zealand growers.",
  primaryDepartment: "Fruit & Veg" as const,
  subcategories: ["Organic", "Fresh Salad & Herbs", "Vegetables"],
  offerType: "Percentage Discount",
  offerValue: "20",
  offerTitle: "20% Off Storewide",
  offerScope: "entire_store" as const,
  selectedProducts: [] as import("@/lib/partner-offer").SelectedProduct[],
  memberCode: "FOODVAULT-ALPHA-20",
  supportEmail: "hello@alphaorganics.co.nz",
  supportPhone: "+64 21 000 0000",
  instagram: "alphaorganics",
  facebook: "https://facebook.com/alphaorganics",
  youtube: "https://youtube.com/@alphaorganics",
  tiktok: "alphaorganics",
};

export const analyticsData = {
  lastUpdated: "Today at 2:30 PM",
  listingViews: { value: "42,890", change: "+12.4%" },
  websiteClicks: { value: "3,122", change: "+8.1%" },
  memberSaves: { value: "1,402", change: "+22%" },
  topSearchCategories: ["Protein", "Coffee", "Organic", "Honey", "Gluten Free"],
  popularCollections: [
    { name: "Healthy Snacks", status: "Top Performer" },
    { name: "Pantry Essentials", status: "Rising Interest" },
    { name: "Coffee Specials", status: "Consistent Views" },
  ],
  recentActivity: [
    { type: "view", message: "Members viewed your listing.", time: "2 minutes ago" },
    { type: "click", message: "Members clicked through to your site.", time: "15 minutes ago" },
    { type: "save", message: "Members saved your listing to favourites.", time: "1 hour ago" },
    { type: "view", message: "Members viewed your listing.", time: "3 hours ago" },
  ],
};

export const setupChecklist = [
  {
    id: "approved",
    title: "Application Approved",
    description: "Your partner application has been verified.",
    complete: true,
  },
  {
    id: "code",
    title: "Review your suggested member code",
    description: "Standard code generated for member checkout.",
    complete: true,
  },
  {
    id: "website",
    title: "Update your website with your member offer",
    description: "Add the discount code or offer to your checkout system.",
    complete: false,
  },
  {
    id: "confirm",
    title: "Confirm your member offer is active",
    description: "Let us know when you're ready to receive traffic.",
    complete: false,
  },
  {
    id: "live",
    title: "Listing published",
    description: "Final step to go live on the FoodVault discovery feed.",
    complete: false,
  },
];
