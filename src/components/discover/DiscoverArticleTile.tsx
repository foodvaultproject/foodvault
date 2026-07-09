import Image from "next/image";
import Link from "next/link";
import {
  articleHref,
  formatPublishDate,
  formatReadTime,
  type DiscoverArticleCard,
} from "@/lib/discover/queries";
import {
  DISCOVER_FIVE_TILE_CARD_CLASS,
  DISCOVER_TILE_CARD_CLASS,
  DISCOVER_TILE_IMAGE_CLASS,
} from "@/lib/discover/image-frame";

const TILE_IMAGE_SIZES = "240px";

type DiscoverArticleTileProps = {
  article: DiscoverArticleCard;
  variant?: "default" | "detailed" | "guide" | "overlay";
  readMoreLabel?: string;
  layout?: "fixed" | "homepage";
  imageSizes?: string;
};

export function DiscoverArticleTile({
  article,
  variant = "default",
  readMoreLabel = "Read More",
  layout = "fixed",
  imageSizes = TILE_IMAGE_SIZES,
}: DiscoverArticleTileProps) {
  const cardClass =
    layout === "homepage" ? DISCOVER_FIVE_TILE_CARD_CLASS : DISCOVER_TILE_CARD_CLASS;

  if (variant === "overlay") {
    return (
      <Link
        href={articleHref(article.slug)}
        className={`${cardClass} group relative`}
      >
        <div className={DISCOVER_TILE_IMAGE_CLASS}>
          <Image
            src={article.heroImageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={imageSizes}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
        <span className="absolute bottom-4 left-4 right-4 text-sm font-bold leading-snug text-white line-clamp-3">
          {article.title}
        </span>
      </Link>
    );
  }

  return (
    <article className={cardClass}>
      <Link href={articleHref(article.slug)} className="block">
        <div className={DISCOVER_TILE_IMAGE_CLASS}>
          <Image
            src={article.heroImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes={imageSizes}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {article.category}
        </p>
        <h3 className="mt-2 text-sm font-bold leading-snug text-foreground line-clamp-3">
          <Link href={articleHref(article.slug)} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>

        {variant === "detailed" && article.summary ? (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        ) : null}

        {variant === "guide" ? (
          <>
            {article.summary ? (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
            ) : null}
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {formatPublishDate(article.publishDate) || "Recently published"}
              </span>
              <Link
                href={articleHref(article.slug)}
                aria-label={`Read ${article.title}`}
                className="text-muted-foreground hover:text-primary"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <Link
            href={articleHref(article.slug)}
            className="mt-auto pt-4 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            {readMoreLabel}
          </Link>
        )}
      </div>
    </article>
  );
}

export function DiscoverRecipeTile({ article }: { article: DiscoverArticleCard }) {
  return (
    <Link href={articleHref(article.slug)} className={`${DISCOVER_TILE_CARD_CLASS} group relative`}>
      <div className={DISCOVER_TILE_IMAGE_CLASS}>
        <Image
          src={article.heroImageUrl}
          alt={article.title}
          fill
          className="object-cover"
          sizes={TILE_IMAGE_SIZES}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
      </div>
      <div className="absolute bottom-0 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {article.category} | {formatReadTime(article.readTimeMinutes)}
        </span>
        <h3 className="mt-2 text-sm font-bold leading-snug text-white line-clamp-3">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}
