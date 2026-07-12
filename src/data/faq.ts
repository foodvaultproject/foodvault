import type { MembershipSettings } from "@/lib/member/pricing";
import {
  formatMembershipPriceMonthly,
  formatTrialLengthDays,
} from "@/lib/member/pricing";

export type FAQItem = {
  question: string;
  answer: string;
  bullets?: string[];
  closing?: string;
};

const memberFaqsBase: FAQItem[] = [
  {
    question: "What is FOODVAULT?",
    answer:
      'FOODVAULT is a premium membership platform for food enthusiasts in New Zealand. We partner with top-tier food and grocery brands to bring our members exclusive "vaulted" savings, early access to new products, and a curated discovery experience designed to maximise your grocery budget.',
  },
  {
    question: "Is FoodVault an online store?",
    answer:
      "No, FoodVault is a membership platform, not a direct retailer. We provide the gateway to exclusive pricing. When you find a brand you love in our directory, you shop directly on their official website using your member-exclusive access.",
  },
  {
    question: "How do I receive discounts?",
    answer:
      'Once you are a member, you\'ll have access to our "Member Vault." From there, you can browse participating brands and reveal your exclusive pricing. When you click through to a partner\'s site, your member discount is often applied automatically at checkout, or you\'ll be provided with a unique member code.',
  },
  {
    question: "What about free trials and payment?",
    answer: "",
  },
  {
    question: "Cancellation and Refunds",
    answer:
      "You can cancel your FoodVault membership at any time with a single click in your account settings. There are no lock-in contracts or hidden fees. For more details on our refund policy, please visit our dedicated Refund & Cancellation Policy page.",
  },
];

export function getMemberFaqs(settings: MembershipSettings): FAQItem[] {
  const trialLabel = formatTrialLengthDays(settings.trialLengthDays);
  const priceLabel = formatMembershipPriceMonthly(settings.membershipPriceMonthly);

  return memberFaqsBase.map((faq) =>
    faq.question === "What about free trials and payment?"
      ? {
          ...faq,
          answer: `We offer a ${trialLabel} free trial so you can explore the network and see the potential savings for yourself. After the trial period, membership continues at ${priceLabel}. You can manage your billing, update payment methods, and view invoices at any time through your Member Account settings.`,
        }
      : faq
  );
}

export const partnerFaqs: FAQItem[] = [
  {
    question: "Is listing my brand free?",
    answer:
      "Yes, listing your brand on the FoodVault directory is currently free for qualified partners in New Zealand. Our goal is to connect our members with the best independent food and beverage brands, providing you with a direct-to-consumer channel to acquire customers you own.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Once you submit your application through the Partner Portal, our team typically reviews it within 2–3 business days. We look for New Zealand brands that align with our premium, artisan, and health-conscious values to ensure the best experience for our members.",
  },
  {
    question: "Do I need a Shopify store to join?",
    answer:
      "While many of our partners use Shopify, it is not a requirement. As long as you have a professional e-commerce presence where our New Zealand members can shop directly, you are eligible to apply for the FoodVault network.",
  },
  {
    question: "How do I contact members?",
    answer:
      "FoodVault is designed to help you acquire customers you own. When a member shops on your site, they become your customer. You'll receive their order data and contact information directly through your own e-commerce platform, allowing you to build a long-term relationship.",
  },
];

export const affiliateFaqs: FAQItem[] = [
  {
    question: "What is the FoodVault Affiliate Program?",
    answer:
      "The FoodVault Affiliate Program allows anyone to promote participating FoodVault partners using their own unique referral links. When someone purchases through your referral link, you earn a commission from the partner.",
  },
  {
    question: "Who can become an affiliate?",
    answer:
      "Anyone. You do not need to be a FoodVault member. Simply create a free account and start promoting participating brands.",
  },
  {
    question: "Does it cost anything to join?",
    answer: "No. Joining the FoodVault Affiliate Program is completely free.",
  },
  {
    question: "How do I become an affiliate?",
    answer:
      "Create a FoodVault account and visit the Affiliate Dashboard. Browse participating brands and start promoting those you've been approved to promote (or automatically enrolled in, depending on the brand's settings). Your referral links are generated automatically.",
  },
  {
    question: "Where can I share my affiliate links?",
    answer: "You can share them almost anywhere, including:",
    bullets: [
      "Social media",
      "Blogs",
      "YouTube",
      "TikTok",
      "Instagram",
      "Facebook",
      "Email newsletters",
      "Personal websites",
      "Online communities (where permitted)",
    ],
    closing: "Always follow the rules of the platform you're posting on.",
  },
  {
    question: "How do referral links work?",
    answer:
      "Each affiliate receives a unique referral link for every participating brand. When someone clicks your link and makes a qualifying purchase, FoodVault records the referral and calculates your commission automatically.",
  },
  {
    question: "How do I know if my referral worked?",
    answer: "Your Affiliate Dashboard records:",
    bullets: [
      "Referral clicks",
      "Affiliate orders",
      "Pending commissions",
      "Approved commissions",
      "Paid commissions",
    ],
    closing: "You can monitor your performance in real time.",
  },
  {
    question: "When do I earn a commission?",
    answer:
      "You earn a commission once a customer completes a qualifying purchase through your referral link. Some brands may have additional conditions, which will be displayed on their profile.",
  },
  {
    question: "When do I get paid?",
    answer:
      "Commissions are held for approximately 30 days after the purchase to allow for returns, refunds or order cancellations. Once the hold period has passed and the order remains valid, the commission becomes payable.",
  },
  {
    question: "How are payments made?",
    answer:
      "FoodVault automatically pays approved affiliate commissions using the payment method connected to your Affiliate Account. You can view your payment history from your Affiliate Dashboard.",
  },
  {
    question: "Is there a minimum payout amount?",
    answer:
      "If a minimum payout threshold applies, it will be displayed in your Affiliate Dashboard before your first payment.",
  },
  {
    question: "Can I promote more than one brand?",
    answer:
      "Yes. You can promote as many participating FoodVault brands as you like. Each brand has its own referral link and commission structure.",
  },
  {
    question: "Can different brands offer different commission rates?",
    answer:
      "Yes. Each partner sets their own commission percentage. Your dashboard displays the current commission available for every participating brand.",
  },
  {
    question: "Can I buy products using my own affiliate link?",
    answer:
      "No. Self-referrals are not permitted. Purchases made through your own affiliate links are automatically flagged for review and may not qualify for commission.",
  },
  {
    question: "Can I still use my FoodVault member discount?",
    answer:
      "Yes. If you are a FoodVault member, you may still use member discounts when shopping. However, purchases made using your own affiliate links are not eligible to earn affiliate commissions.",
  },
  {
    question: "What happens if a customer returns their order?",
    answer:
      "If an order is refunded or cancelled, the associated affiliate commission may also be cancelled or adjusted. Your dashboard will always display the current commission status.",
  },
  {
    question: "How long does my referral remain active?",
    answer:
      "Each participating brand sets its own referral cookie period. If a customer completes a purchase within that period after clicking your referral link, the sale may qualify for commission.",
  },
  {
    question: "Can brands remove me from their affiliate program?",
    answer:
      "Brands may suspend or remove affiliates who breach their program terms or engage in fraudulent activity. FoodVault may also suspend affiliate accounts that violate our Terms of Use.",
  },
  {
    question: "How can I increase my affiliate earnings?",
    answer: "Successful affiliates typically:",
    bullets: [
      "Create helpful product reviews.",
      "Share honest recommendations.",
      "Produce useful videos and content.",
      "Build engaged audiences on social media.",
      "Promote products they genuinely use and recommend.",
    ],
    closing:
      "Authentic recommendations generally perform better than excessive advertising.",
  },
  {
    question: "How do I track my performance?",
    answer: "Your Affiliate Dashboard includes:",
    bullets: [
      "Total referral clicks",
      "Affiliate orders",
      "Conversion rate",
      "Pending commissions",
      "Approved commissions",
      "Total earnings",
      "Payment history",
    ],
    closing: "Everything updates automatically as your referrals generate sales.",
  },
  {
    question: "Who do I contact if I need help?",
    answer:
      "If you have questions about the Affiliate Program, visit our Help Centre or contact the FoodVault support team. We're here to help you get the most out of the program.",
  },
];
