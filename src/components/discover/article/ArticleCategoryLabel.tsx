import Link from "next/link";
import { stockupCategoryHubPath } from "@/lib/discover/categories";

type ArticleCategoryLabelProps = {
  category: string;
  stockup?: boolean;
};

export function ArticleCategoryLabel({ category, stockup = false }: ArticleCategoryLabelProps) {
  const href = stockup ? stockupCategoryHubPath(category) : null;
  const className = `text-xs font-semibold uppercase tracking-[0.12em] ${
    stockup ? "text-[#064E3B]" : "text-primary"
  }`;

  if (!href) {
    return <p className={className}>{category}</p>;
  }

  return (
    <Link href={href} className={className}>
      {category}
    </Link>
  );
}
