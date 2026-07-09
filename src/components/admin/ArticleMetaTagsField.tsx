"use client";

import { useState } from "react";
import { normalizeMetaTag } from "@/lib/discover/meta-tags";

type ArticleMetaTagsFieldProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
};

export function ArticleMetaTagsField({
  tags,
  onChange,
  disabled = false,
}: ArticleMetaTagsFieldProps) {
  const [input, setInput] = useState("");

  function addTags(raw: string) {
    const next = [...tags];
    for (const part of raw.split(/[,;\n]/)) {
      const tag = normalizeMetaTag(part);
      if (!tag || next.includes(tag)) continue;
      next.push(tag);
    }
    if (next.length !== tags.length) {
      onChange(next);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (!input.trim()) return;
      addTags(input);
      setInput("");
    } else if (event.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="min-h-[42px] rounded border border-border bg-white px-3 py-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-foreground"
            >
              {tag}
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => onChange(tags.filter((entry) => entry !== tag))}
                  aria-label={`Remove tag ${tag}`}
                  className="text-muted hover:text-foreground"
                >
                  &times;
                </button>
              ) : null}
            </span>
          ))}
          {!disabled ? (
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!input.trim()) return;
                addTags(input);
                setInput("");
              }}
              placeholder={tags.length ? "Add another tag" : "Add tags and press Enter"}
              className="min-w-[10rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-foreground outline-none placeholder:text-muted-light"
            />
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        Press Enter or comma to add a tag. Tags appear at the bottom of the published article.
      </p>
    </div>
  );
}
