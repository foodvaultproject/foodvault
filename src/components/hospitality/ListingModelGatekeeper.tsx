"use client";

import type { ListingModel } from "@/lib/hospitality/types";

type ListingModelGatekeeperProps = {
  onSelect: (model: ListingModel) => void;
};

const options: {
  model: ListingModel;
  title: string;
  eyebrow: string;
  description: string;
  points: string[];
}[] = [
  {
    model: "online_brand",
    title: "Online Kiwi Brand",
    eyebrow: "Option A",
    description: "Drive web traffic to your store with exclusive member promo codes.",
    points: [
      "Members shop on your website",
      "Reveal and copy a unique discount code",
      "Best for e-commerce and direct-to-consumer brands",
    ],
  },
  {
    model: "hospitality_venue",
    title: "Hospitality Venue",
    eyebrow: "Option B",
    description: "Drive foot traffic with in-person membership checks at your venue.",
    points: [
      "Members visit your cafe, restaurant, bakery, or deli",
      "Show a live membership pass at the counter",
      "Best for physical locations and dine-in offers",
    ],
  },
];

export function ListingModelGatekeeper({ onSelect }: ListingModelGatekeeperProps) {
  return (
    <section className="bg-background py-6 sm:py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-4xl lg:px-8">
        <div className="text-center lg:text-left">
          <h1 className="text-[18px] font-bold tracking-tight text-primary">
            How do you want to join FoodVault?
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Choose the listing model that matches your business. You can still complete your
            application next — this just sets the right fields and member experience.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.model}
              type="button"
              onClick={() => onSelect(option.model)}
              className="rounded-lg border border-border bg-background p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {option.eyebrow}
              </p>
              <h2 className="mt-1 text-lg font-bold text-foreground">{option.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-foreground">
                {option.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <span className="fv-btn-primary mt-5 inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground">
                Continue
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
