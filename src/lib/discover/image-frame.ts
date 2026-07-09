/** Portrait frame for Discover listing tiles and article hero (4:5). */
export const DISCOVER_TILE_IMAGE_CLASS = "relative aspect-[4/5] overflow-hidden";

/** Matches fixed-width Discover card (16rem / 256px). */
export const DISCOVER_TILE_WIDTH_CLASS = "w-full max-w-[16rem] sm:w-64";

export const DISCOVER_TILE_CARD_BASE_CLASS =
  "flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-md";

/** Fixed-width Discover article tile card (discover page sections). */
export const DISCOVER_TILE_CARD_CLASS = `${DISCOVER_TILE_WIDTH_CLASS} shrink-0 ${DISCOVER_TILE_CARD_BASE_CLASS}`;

/** Grid/flex wrapper that lays out fixed-width Discover tiles. */
export const DISCOVER_TILE_GRID_CLASS = "flex flex-wrap gap-4 sm:gap-6";

/** Five-tile row: scroll on mobile, five equal tiles in one row on desktop. */
export const DISCOVER_FIVE_TILE_GRID_CLASS =
  "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:gap-6 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:snap-none xl:gap-6";

/** Homepage Discover row: scroll on mobile, five equal tiles in one row on desktop. */
export const DISCOVER_HOMEPAGE_TILE_GRID_CLASS =
  `mt-8 sm:mt-12 ${DISCOVER_FIVE_TILE_GRID_CLASS}`;

/** Fluid tile card within a five-column grid on desktop. */
export const DISCOVER_FIVE_TILE_CARD_CLASS = `${DISCOVER_TILE_CARD_BASE_CLASS} w-[min(100%,16rem)] shrink-0 snap-start sm:w-64 lg:w-full lg:max-w-none lg:shrink`;

/** @deprecated Use DISCOVER_FIVE_TILE_CARD_CLASS. */
export const DISCOVER_HOMEPAGE_TILE_CARD_CLASS = DISCOVER_FIVE_TILE_CARD_CLASS;

/** @deprecated Use DISCOVER_TILE_IMAGE_CLASS. */
export const DISCOVER_ARTICLE_IMAGE_CLASS = DISCOVER_TILE_IMAGE_CLASS;
