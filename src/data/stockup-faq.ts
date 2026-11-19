export type StockUpFaqSegment = {
  text: string;
  href?: string;
};

export type StockUpFaqItem = {
  question: string;
  paragraphs: StockUpFaqSegment[][];
};

export type StockUpFaqCategory = {
  id: string;
  title: string;
  intro: string;
  items: StockUpFaqItem[];
};

export const STOCKUP_FAQ_PATH = "/faq";
export const STOCKUP_FAQ_CANONICAL = "https://www.stockup.co.nz/faq";

export const STOCKUP_FAQ_TITLE =
  "FAQ — New Zealand Online Grocery Shopping, Auto-Reorder & Organic Pantry | StockUp";

export const STOCKUP_FAQ_DESCRIPTION =
  "Answers to common questions about StockUp's easy New Zealand online shopping experience, saved shopping lists, automated recurring essentials, and wide range of organic products.";

export const STOCKUP_FAQ_CATEGORIES: StockUpFaqCategory[] = [
  {
    id: "online-shopping",
    title: "Easy New Zealand Online Shopping & Delivery",
    intro:
      "How StockUp online grocery shopping works across New Zealand, with New Zealand-wide delivery and NZ Post tracking.",
    items: [
      {
        question: "How does New Zealand online shopping work on StockUp?",
        paragraphs: [
          [
            {
              text: "StockUp is built for an easy online shopping experience. Browse the supermarket and add what you need.",
            },
          ],
          [
            { text: "Start in the " },
            { text: "pantry", href: "/pantry" },
            {
              text: ", save the items you buy every week, and come back when you want them delivered. Delivery is New Zealand-wide.",
            },
          ],
        ],
      },
      {
        question: "Do you deliver online grocery shopping NZ-wide?",
        paragraphs: [
          [
            {
              text: "Yes. StockUp delivers New Zealand-wide. Standard delivery is $9.95, and shipping is free on orders of $50 or more.",
            },
          ],
          [
            {
              text: "Enter a New Zealand street address at checkout. Once the order is dispatched, NZ Post tracking is added to the order so you can follow the parcel from your account history.",
            },
          ],
        ],
      },
      {
        question: "How do I track a StockUp order with NZ Post?",
        paragraphs: [
          [
            { text: "After dispatch, open " },
            { text: "your account", href: "/account" },
            {
              text: " and go to order history. When a tracking number is available, it links to NZ Post so you can see where the parcel is. Until then the order stays in packing.",
            },
          ],
        ],
      },
    ],
  },
  {
    id: "shopping-lists",
    title: "Saved Favorites & Custom Shopping Lists",
    intro:
      "Save favorite everyday items, build a household shopping list, and send that saved grocery list back to the cart in one click.",
    items: [
      {
        question: "How do I create a shopping list and save favorites?",
        paragraphs: [
          [
            {
              text: "Open any product in the shop and tap the heart. That saves it to My Grocery List on this device, which is StockUp’s saved grocery list for the things you buy again.",
            },
          ],
          [
            { text: "You can start from the " },
            { text: "pantry", href: "/pantry" },
            { text: ". " },
            { text: "Create an account", href: "/login?mode=signup" },
            {
              text: " to keep orders and invoices together. The grocery list itself stays in this browser until you clear site data.",
            },
          ],
        ],
      },
      {
        question: "Can I build reusable household shopping lists?",
        paragraphs: [
          [
            {
              text: "Yes. A saved grocery list is a reusable household shopping list. Add the products your home actually uses, set a quantity on each line, and leave the list in place for the next shop. Tick the lines you want this time, or choose Select all.",
            },
          ],
          [
            {
              text: "It is one list per browser, so keep the household staples on it and adjust quantities when someone is away or you are shopping for a bigger week.",
            },
          ],
        ],
      },
      {
        question: "How do I re-add an entire saved grocery list to the cart in one click?",
        paragraphs: [
          [
            {
              text: "Open My Grocery List, choose Select all, then Add to cart. Every selected line, with the quantity you saved, goes into the cart together. Untick anything you still have in the cupboard before you add the list.",
            },
          ],
          [
            { text: "From there, review the cart and check out, or keep browsing the " },
            { text: "pantry", href: "/pantry" },
            { text: " if you want to add a one-off item." },
          ],
        ],
      },
    ],
  },
  {
    id: "recurring-essentials",
    title: "Automated Reordering & Recurring Essentials",
    intro:
      "Create as many Auto-Restock schedules as you need, choose how often each one runs, and change, pause, or cancel them whenever you want.",
    items: [
      {
        question: "How do automated recurring grocery orders work on StockUp?",
        paragraphs: [
          [
            {
              text: "You can create as many Auto-Restock schedules as you want. Name each one, add the products you want, and set how often it repeats — weekly, fortnightly, monthly, every few days, or on dates you choose. After that it is set and forget, so the essentials you always need keep coming without you having to remember the next shop.",
            },
          ],
          [
            {
              text: "Every schedule stays in your control. Pause it, skip a delivery, change the items or quantities, or cancel it whenever you want.",
            },
          ],
        ],
      },
      {
        question: "Can I pause, skip, or adjust a recurring essentials order?",
        paragraphs: [
          [
            {
              text: "Yes. Open ",
            },
            { text: "Auto-Restock", href: "/account/schedules" },
            {
              text: " to pause a schedule, set a date for it to resume, skip the next delivery, edit the products, or cancel it. You can do this on any schedule, at any time.",
            },
          ],
        ],
      },
      {
        question: "Which pantry staples are worth keeping on a repeat list?",
        paragraphs: [
          [
            {
              text: "Keep the products your household uses on a regular cycle, at the quantity you usually need. Leave one-off items off the schedule.",
            },
          ],
        ],
      },
    ],
  },
  {
    id: "organic-pantry",
    title: "Wide Range of Organic Products & Pantry Quality",
    intro: "Organic products sit in the same shop as everyday groceries.",
    items: [
      {
        question: "Does StockUp have a wide range of organic products in NZ?",
        paragraphs: [
          [
            {
              text: "Yes. StockUp has a wide range of certified organic products to shop from.",
            },
          ],
          [
            { text: "Browse the " },
            { text: "pantry", href: "/pantry" },
            { text: " and add them to your cart or an Auto-Restock schedule." },
          ],
        ],
      },
    ],
  },
];

export function stockUpFaqPlainAnswer(item: StockUpFaqItem): string {
  return item.paragraphs
    .map((paragraph) =>
      paragraph
        .map((segment) =>
          segment.href ? `${segment.text} (${segment.href})` : segment.text
        )
        .join("")
    )
    .join(" ");
}

export function stockUpFaqEntities() {
  return STOCKUP_FAQ_CATEGORIES.flatMap((category) => category.items);
}
