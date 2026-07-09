type ArticleTagsProps = {
  tags: string[];
};

export function ArticleTags({ tags }: ArticleTagsProps) {
  if (tags.length === 0) return null;

  return (
    <section aria-labelledby="article-tags-heading">
      <h2
        id="article-tags-heading"
        className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
      >
        Tags
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag}>
            <span className="inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground">
              {tag}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
