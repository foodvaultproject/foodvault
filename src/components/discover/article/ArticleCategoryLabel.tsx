type ArticleCategoryLabelProps = {
  category: string;
};

export function ArticleCategoryLabel({ category }: ArticleCategoryLabelProps) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
      {category}
    </p>
  );
}
