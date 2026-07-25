"use client";

export type BrowseFilterTag = {
  id: string;
  label: string;
  group: "department" | "subcategory" | "dietary";
  value: string;
};

type BrowseFilterTagsProps = {
  tags: BrowseFilterTag[];
  onRemove: (tag: BrowseFilterTag) => void;
};

export function BrowseFilterTags({ tags, onRemove }: BrowseFilterTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onRemove(tag)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
          aria-label={`Remove ${tag.label} filter`}
        >
          <span>{tag.label}</span>
          <span aria-hidden="true" className="text-sm leading-none">
            ✕
          </span>
        </button>
      ))}
    </div>
  );
}
