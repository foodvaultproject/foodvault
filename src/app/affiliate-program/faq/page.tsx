import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticlesByCategory } from "@/lib/discover/queries";

export const metadata: Metadata = {
  title: "Affiliate Program FAQ | FoodVault",
  description:
    "Answers to common questions about joining the FoodVault Affiliate Program, commissions, payouts, and referral tracking.",
  openGraph: {
    title: "Affiliate Program FAQ | FoodVault",
    description:
      "Answers to common questions about joining the FoodVault Affiliate Program, commissions, payouts, and referral tracking.",
  },
};

export default async function AffiliateProgramFaqPage() {
  const articles = await getPublishedArticlesByCategory("News");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/affiliate-program" className="text-sm font-semibold text-primary hover:text-primary-hover">
          ← Back to Affiliate Program
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-foreground">Affiliate Program FAQ</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Everything you need to know about promoting FoodVault brands and getting paid.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-lg border border-border bg-background p-8 text-sm text-muted-foreground">
          FAQ content will appear here once articles are published in What&apos;s Happening?.
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <article key={article.id} className="rounded-lg border border-border bg-background p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">{article.title}</h2>
              {article.body ? (
                <div
                  className="prose prose-sm mt-4 max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: article.body }}
                />
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">{article.summary}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
