import Image from "next/image";
import Link from "next/link";
import { MemberSignupCtaLink } from "@/components/member/MemberSignupCtaLink";
import {
  DiscoverArticleTile,
  DiscoverRecipeTile,
} from "@/components/discover/DiscoverArticleTile";
import { DiscoverSectionGrid } from "@/components/discover/DiscoverSectionGrid";
import {
  articleHref,
  formatReadTime,
  type DiscoverArticleCard,
} from "@/lib/discover/queries";
import {
  DISCOVER_ARTICLE_IMAGE_CLASS,
} from "@/lib/discover/image-frame";
import { heading2, heading2OnDark } from "@/lib/ui-classes";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-8">
      <h2 className={heading2}>{title}</h2>
    </div>
  );
}

export function FeaturedArticleSection({
  article,
}: {
  article: DiscoverArticleCard | null;
}) {
  if (!article) return null;

  return (
    <section className="bg-background py-6 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <div className="grid md:grid-cols-[minmax(0,320px)_1fr] lg:grid-cols-[minmax(0,360px)_1fr]">
            <div className={`${DISCOVER_ARTICLE_IMAGE_CLASS} md:rounded-l-2xl`}>
              <Image
                src={article.heroImageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 360px"
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              {article.featured ? (
                <span className="inline-flex w-fit rounded-sm bg-primary px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Featured
                </span>
              ) : null}
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {article.category}
              </p>
              <h2 className={`mt-2 ${heading2}`}>
                {article.title}
              </h2>
              {article.summary ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {article.summary}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={articleHref(article.slug)}
                  className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
                >
                  Read Article
                </Link>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatReadTime(article.readTimeMinutes)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SavingSection({ articles }: { articles: DiscoverArticleCard[] }) {
  if (articles.length === 0) return null;

  return (
    <section id="saving" className="bg-surface py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Saving" />
        <DiscoverSectionGrid>
          {articles.map((article) => (
            <DiscoverArticleTile
              key={article.id}
              article={article}
              variant="detailed"
              layout="grid"
              readMoreLabel="Read Article"
            />
          ))}
        </DiscoverSectionGrid>
      </div>
    </section>
  );
}

export function RecipesSection({ articles }: { articles: DiscoverArticleCard[] }) {
  if (articles.length === 0) return null;

  return (
    <section id="recipes" className="bg-surface py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Recipes" />
        <DiscoverSectionGrid>
          {articles.map((recipe) => (
            <DiscoverRecipeTile key={recipe.id} article={recipe} layout="grid" />
          ))}
        </DiscoverSectionGrid>
      </div>
    </section>
  );
}

export function PartnersSection({ articles }: { articles: DiscoverArticleCard[] }) {
  if (articles.length === 0) return null;

  return (
    <section id="partners" className="bg-background py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Partners" />
        <DiscoverSectionGrid>
          {articles.map((article) => (
            <DiscoverArticleTile
              key={article.id}
              article={article}
              variant="overlay"
              layout="grid"
            />
          ))}
        </DiscoverSectionGrid>
      </div>
    </section>
  );
}

export function NewsSection({ articles }: { articles: DiscoverArticleCard[] }) {
  if (articles.length === 0) return null;

  return (
    <section id="news" className="bg-surface py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="News" />
        <DiscoverSectionGrid>
          {articles.map((article) => (
            <DiscoverArticleTile
              key={article.id}
              article={article}
              variant="detailed"
              layout="grid"
              readMoreLabel="Read Article"
            />
          ))}
        </DiscoverSectionGrid>
      </div>
    </section>
  );
}

export function DiscoverFinalCTA() {
  return (
    <section className="bg-background py-7 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-primary px-6 py-12 text-center sm:px-10 sm:py-16">
          <h2 className={heading2OnDark}>
            Ready To Start Saving?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Join 50,000+ New Zealand members who are revolutionising their grocery budget
            and supporting ethical food systems.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MemberSignupCtaLink
              variant="start-free-trial-nav"
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-white/90 sm:w-auto"
            >
              Start FREE Trial
            </MemberSignupCtaLink>
            <Link
              href="/browse-brands"
              className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Browse Brands
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
