import { formatCurrency } from "@/lib/locale";
import type { MembershipSettings } from "@/lib/member/pricing";

export const categories = [
  { label: "Coffee", emoji: "☕" },
  { label: "Drinks", emoji: "🥤" },
  { label: "Snacks", emoji: "🍿" },
  { label: "Oil", emoji: "🫒" },
  { label: "Pantry", emoji: "🥫" },
  { label: "Dairy", emoji: "🥛" },
  { label: "Meat", emoji: "🥩" },
  { label: "Bakery", emoji: "🥐" },
  { label: "Sweets", emoji: "🍫" },
];

export const featuredBrands = [
  {
    name: "Tuesday Beverages",
    description: "Craft cold brew and sparkling botanical drinks.",
    discount: "30% OFF",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop",
  },
  {
    name: "Pepper Sauce Co.",
    description: "Small-batch hot sauces from local growers.",
    discount: "25% OFF",
    image:
      "https://images.unsplash.com/photo-1606923829579-0cb981a196e0?w=600&h=400&fit=crop",
  },
  {
    name: "Axe Table Tea",
    description: "Organic loose-leaf teas sourced sustainably.",
    discount: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&h=400&fit=crop",
  },
  {
    name: "Eco Energy Bar",
    description: "Plant-based bars packed with whole ingredients.",
    discount: "30% OFF",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop",
  },
  {
    name: "Moon Herbal Tea",
    description: "Calming herbal blends for everyday wellness.",
    discount: "15% OFF",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop",
  },
  {
    name: "Solar Nutrients",
    description: "Superfood powders and smoothie boosters.",
    discount: "25% OFF",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop",
  },
  {
    name: "Sunday Beverages",
    description: "Refreshing kombucha and functional drinks.",
    discount: "30% OFF",
    image:
      "https://images.unsplash.com/photo-1622597467836-f053a3891a49?w=600&h=400&fit=crop",
  },
  {
    name: "High Hills Honey",
    description: "Raw honey from independent beekeepers.",
    discount: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=400&fit=crop",
  },
  {
    name: "Coastal Pantry",
    description: "Artisan pantry staples made in small batches.",
    discount: "25% OFF",
    image:
      "https://images.unsplash.com/photo-1506368083636-6defb67639a7?w=600&h=400&fit=crop",
  },
];

export const newBrands = [
  { name: "Ugly Drinks", tag: "New Member" },
  { name: "Field & Fork", tag: "New Member" },
  { name: "River Roast", tag: "New Member" },
  { name: "Green Grove", tag: "New Member" },
];

export const popularBrands = [
  { name: "Ugly Drinks", image: "https://images.unsplash.com/photo-1625772453859-039d9333fbb5?w=400&h=400&fit=crop" },
  { name: "Pantry Items", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop" },
  { name: "Coffee Beans", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop" },
  { name: "Organic Breakfast", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop" },
  { name: "Fresh Produce", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop" },
  { name: "Artisan Cheese", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop" },
  { name: "Craft Chocolate", image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop" },
  { name: "Natural Snacks", image: "https://images.unsplash.com/photo-1599490659213-e8345eb1a4cb?w=400&h=400&fit=crop" },
  { name: "Herbal Blends", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop" },
  { name: "Cold Pressed", image: "https://images.unsplash.com/photo-1622597467836-f053a3891a49?w=400&h=400&fit=crop" },
  { name: "Spice Market", image: "https://images.unsplash.com/photo-1596040033229-a0b2a1d5a6f5?w=400&h=400&fit=crop" },
  { name: "Bakery Fresh", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop" },
  { name: "Sea Salt Co.", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop" },
  { name: "Nut Butter Lab", image: "https://images.unsplash.com/photo-1586201375761-838a048e572d?w=400&h=400&fit=crop" },
  { name: "Farm Eggs", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop" },
  { name: "Juice Bar", image: "https://images.unsplash.com/photo-1613478223719-2ab802b781f0?w=400&h=400&fit=crop" },
];

export const logoCloud = [
  "River Roast",
  "Green Grove",
  "Coastal Pantry",
  "Field & Fork",
  "Moon Tea",
  "Axe Table",
  "Solar Nutrients",
  "High Hills",
  "Pepper Sauce",
  "Eco Bar",
  "Tuesday Bev",
  "Ugly Drinks",
  "Sunday Bev",
  "Nut Butter",
  "Spice Market",
  "Juice Bar",
  "Farm Eggs",
  "Bakery Fresh",
  "Herbal Blends",
  "Sea Salt Co.",
  "Craft Choc",
];

export const discoverArticles = [
  {
    category: "Behind the Brand",
    title: "How independent brands are changing the way we shop",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=520&fit=crop",
  },
  {
    category: "Member Tips",
    title: "5 ways to maximise your FoodVault membership savings",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525cd352?w=400&h=520&fit=crop",
  },
  {
    category: "Recipes",
    title: "Weeknight dinners using your favourite member brands",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=520&fit=crop",
  },
  {
    category: "Guides",
    title: "The ultimate guide to shopping direct from local producers",
    image:
      "https://images.unsplash.com/photo-1466637574447-3675ea332785?w=400&h=520&fit=crop",
  },
  {
    category: "Community",
    title: "Meet the members saving hundreds every month",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=520&fit=crop",
  },
];

export const testimonials = [
  {
    quote:
      `FoodVault has completely changed how I shop for food. I'm saving over ${formatCurrency(80)} a month on brands I already loved.`,
    name: "Sarah M.",
    location: "Auckland",
  },
  {
    quote:
      "The member pricing is genuine — I shop direct on each brand's site and the savings are real every time.",
    name: "James T.",
    location: "Wellington",
  },
  {
    quote:
      "Supporting independent food businesses while saving money? This is exactly what I was looking for.",
    name: "Emma L.",
    location: "Christchurch",
  },
];

export function getHomepageFaqs(
  settings: Pick<MembershipSettings, "trialLengthDays">
) {
  const trialLabel =
    settings.trialLengthDays === 1
      ? "1-day"
      : `${settings.trialLengthDays}-day`;

  return [
    {
      question: "What is FoodVault?",
      answer:
        "FoodVault is a membership platform built for Kiwis looking to save more. We partner with New Zealand brands to provide exclusive member pricing while helping people discover great products and shop directly with trusted businesses.",
    },
    {
      question: "How do I receive discounts?",
      answer:
        "Once you become a member, you'll have instant access to every participating brand's exclusive member offer. Simply visit a brand profile, click through to their website, and apply the member code during checkout.",
    },
    {
      question: "What about free trials and payment?",
      answer:
        `We offer a ${trialLabel} free trial, giving you plenty of time to explore participating brands and experience the savings before choosing whether to continue with a paid membership.`,
    },
  ];
}
