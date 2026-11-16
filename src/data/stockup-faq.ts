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
      "How StockUp online grocery shopping works across New Zealand, including Auckland, with fast checkout, GST-inclusive prices, and NZ Post tracking.",
    items: [
      {
        question: "How does New Zealand online shopping work on StockUp?",
        paragraphs: [
          [
            {
              text: "StockUp is built for an easy online shopping experience. Browse the supermarket, add what you need, and check out in New Zealand dollars. Shelf prices already include GST, so the total you see is the total you pay for the goods.",
            },
          ],
          [
            { text: "Start in the " },
            { text: "pantry", href: "/pantry" },
            {
              text: ", save the items you buy every week, and come back when you want them delivered. Fast pantry delivery in New Zealand uses the same flow whether you are filling a trolley in Auckland or sending staples further south.",
            },
          ],
        ],
      },
      {
        question: "Do you deliver online grocery shopping NZ-wide, including Auckland?",
        paragraphs: [
          [
            {
              text: "Yes. StockUp ships New Zealand online shopping orders nationwide, including Auckland and the rest of the country. Standard delivery is $9.95, and shipping is free on orders of $50 or more.",
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
        question: "Is checkout fast, and are StockUp prices GST-inclusive?",
        paragraphs: [
          [
            {
              text: "Checkout is a short delivery form, then payment in NZD. Product prices on StockUp are GST-inclusive. You do not add 15% GST on top of the shelf price at the end.",
            },
          ],
          [
            { text: "Saver pricing on everyday lines is covered in " },
            { text: "StockUp savings", href: "/discover/savings" },
            { text: ". Delivery notes are optional if a courier needs extra instructions." },
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
              text: "Open any product in the shop and tap the heart. That saves it to My Grocery List on this device, which is StockUp’s saved grocery list for the things you buy again. Use it for milk, bread, coffee, cleaning products, or any other everyday item.",
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
      "Repeat the basics on your schedule: coffee, oats, olive oil, tinned goods, cleaning, and other pantry staples, with room to skip or change a shop before you pay.",
    items: [
      {
        question: "How do automated recurring grocery orders work on StockUp?",
        paragraphs: [
          [
            {
              text: "StockUp does not charge you on a locked subscription. Automated recurring grocery orders here mean a standing list of basic essentials that you send back to the cart whenever you want the next delivery. Save the items once, then add the list when you are ready to order again.",
            },
          ],
          [
            {
              text: "That is the practical way to auto-reorder basic essentials such as coffee, oats, olive oil, tinned tomatoes, rice, and cleaning products, and to never run out of pantry staples without paying for a delivery you did not ask for.",
            },
          ],
        ],
      },
      {
        question: "Can I pause, skip, or adjust a recurring essentials order?",
        paragraphs: [
          [
            {
              text: "Yes. Nothing leaves the warehouse until you check out. Pause by waiting. Skip a line by unticking it. Adjust by changing the quantity on the list or in the cart. You can also remove a product and add it back later.",
            },
          ],
          [
            { text: "Past orders stay in " },
            { text: "your account", href: "/account" },
            {
              text: " if you want to compare what you sent last time. The next shop only includes what you select.",
            },
          ],
        ],
      },
      {
        question: "Which pantry staples are worth keeping on a repeat list?",
        paragraphs: [
          [
            {
              text: "Keep the items that run out on a predictable cycle: coffee, oats, olive oil, tinned goods, rice, pasta, flour, toilet paper, and everyday cleaning products. Add them to the grocery list at the quantity your household uses, then reorder that set when the cupboard gets low.",
            },
          ],
          [
            { text: "Seasonal or one-off products can stay off the list. Compare saver pricing in " },
            { text: "savings guides", href: "/discover/savings" },
            { text: " before you lock a staple into the regular shop." },
          ],
        ],
      },
    ],
  },
  {
    id: "organic-pantry",
    title: "Wide Range of Organic Products & Pantry Quality",
    intro:
      "Certified organic options, wholefoods, bulk pantry staples, and local New Zealand brands in the same shop as everyday groceries.",
    items: [
      {
        question: "Does StockUp have a wide range of organic products in NZ?",
        paragraphs: [
          [
            {
              text: "Yes. The shop includes a wide range of organic products NZ households look for, alongside conventional groceries. Where a product is certified organic, that is stated on the product itself. StockUp does not label a conventional item as organic.",
            },
          ],
          [
            { text: "Browse the " },
            { text: "pantry", href: "/pantry" },
            {
              text: " and search for organic, or filter by the brand you already buy. The range covers pantry food and household lines, not a separate organic-only store.",
            },
          ],
        ],
      },
      {
        question: "Can I buy organic pantry staples and wholefoods online?",
        paragraphs: [
          [
            {
              text: "You can. Organic pantry staples New Zealand shoppers reorder often — oats, oils, grains, tinned goods, and other wholefoods — sit in the same catalogue as everyday brands. Add them to a saved grocery list if you want them in the next shop.",
            },
          ],
          [
            {
              text: "Bulk-style pantry staples are listed as the pack size the brand sells. Check the product name and size before you add a large pack to the cart.",
            },
          ],
        ],
      },
      {
        question: "Do you stock local New Zealand brands?",
        paragraphs: [
          [
            {
              text: "StockUp is a Kiwi-owned supermarket shop, and the catalogue includes local New Zealand brands as well as imported pantry lines. Brand is shown on every product card, so you can build a list that prefers the producers you want to support.",
            },
          ],
          [
            { text: "New arrivals and pricing notes are published under " },
            { text: "News & Savings", href: "/discover/savings" },
            { text: "." },
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
