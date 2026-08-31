"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { formatArticleBodyAction } from "@/lib/admin/actions";
import {
  blocksToHtml,
  bodyToBlocks,
  createBlock,
  sanitizeInlineHtml,
  type ArticleBlock,
  type ArticleBlockType,
} from "@/lib/discover/article-blocks";

const BLOCK_TYPE_OPTIONS: { value: ArticleBlockType; label: string }[] = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h2", label: "H2" },
  { value: "h3", label: "H3" },
  { value: "ul", label: "Bullet list" },
  { value: "ol", label: "Numbered list" },
  { value: "blockquote", label: "Blockquote" },
];

const toolbarButtonClass =
  "rounded border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-50";

const selectClass =
  "rounded border border-border bg-white px-2 py-1.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

type ArticleBodyEditorProps = {
  initialBody: string;
  articleTitle: string;
  disabled?: boolean;
  onChange?: (html: string) => void;
};

export type ArticleBodyEditorHandle = {
  getHtml: () => string;
};

function isRichTextBlock(type: ArticleBlockType): boolean {
  return type === "paragraph" || type === "blockquote";
}

function isPlainTextBlock(type: ArticleBlockType): boolean {
  return type === "h2" || type === "h3";
}

function isListBlock(type: ArticleBlockType): boolean {
  return type === "ul" || type === "ol";
}

function RichTextBlockEditor({
  block,
  disabled,
  editorRef,
  onFocus,
  onChange,
}: {
  block: ArticleBlock;
  disabled: boolean;
  editorRef: (element: HTMLDivElement | null) => void;
  onFocus: () => void;
  onChange: (html: string) => void;
}) {
  const localRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = localRef.current;
    if (!element) return;
    if (element.innerHTML !== block.content) {
      element.innerHTML = block.content;
    }
  }, [block.content, block.id]);

  return (
    <div
      ref={(element) => {
        localRef.current = element;
        editorRef(element);
      }}
      contentEditable={!disabled}
      suppressContentEditableWarning
      onFocus={onFocus}
      onInput={(event) => onChange(event.currentTarget.innerHTML)}
      className={`min-h-[4.5rem] w-full rounded-md border border-border px-3 py-2 text-sm leading-relaxed text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
        block.type === "blockquote" ? "border-l-4 border-l-primary/40 bg-surface/30 italic" : ""
      }`}
      aria-label={
        block.type === "blockquote" ? "Blockquote content" : "Paragraph content"
      }
    />
  );
}

export const ArticleBodyEditor = forwardRef<ArticleBodyEditorHandle, ArticleBodyEditorProps>(
  function ArticleBodyEditor(
    { initialBody, articleTitle, disabled = false, onChange },
    ref
  ) {
  const [blocks, setBlocks] = useState<ArticleBlock[]>(() =>
    bodyToBlocks(initialBody, articleTitle)
  );
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [formatting, startFormatTransition] = useTransition();
  const richTextRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const headingInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const listTextareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const serializeBlocks = useCallback((current: ArticleBlock[]) => {
    const flushed = current.map((block) => {
      if (isRichTextBlock(block.type)) {
        const element = richTextRefs.current[block.id];
        if (element) {
          return { ...block, content: sanitizeInlineHtml(element.innerHTML) };
        }
      }
      if (isPlainTextBlock(block.type)) {
        const element = headingInputRefs.current[block.id];
        if (element) {
          return { ...block, content: element.value };
        }
      }
      if (isListBlock(block.type)) {
        const element = listTextareaRefs.current[block.id];
        if (element) {
          return { ...block, content: element.value };
        }
      }
      return block;
    });
    return blocksToHtml(flushed);
  }, []);

  const html = useMemo(() => blocksToHtml(blocks), [blocks]);

  useImperativeHandle(
    ref,
    () => ({
      getHtml: () => serializeBlocks(blocks),
    }),
    [blocks, serializeBlocks]
  );

  useEffect(() => {
    onChange?.(html);
  }, [html, onChange]);

  const updateBlock = useCallback(
    (id: string, patch: Partial<ArticleBlock>) => {
      setBlocks((current) =>
        current.map((block) => (block.id === id ? { ...block, ...patch } : block))
      );
    },
    []
  );

  const addBlock = useCallback((type: ArticleBlockType = "paragraph") => {
    setBlocks((current) => [...current, createBlock(type)]);
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((current) => {
      if (current.length <= 1) {
        return [createBlock("paragraph")];
      }
      return current.filter((block) => block.id !== id);
    });
  }, []);

  const moveBlock = useCallback((id: string, direction: -1 | 1) => {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      if (index < 0) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  }, []);

  const applyInlineCommand = useCallback(
    (command: "bold" | "italic" | "createLink" | "insertImage") => {
      if (!focusedBlockId) return;
      const block = blocks.find((item) => item.id === focusedBlockId);
      if (!block || !isRichTextBlock(block.type)) return;

      const element = richTextRefs.current[focusedBlockId];
      if (!element) return;

      element.focus();

      if (command === "createLink") {
        const url = window.prompt("Link URL");
        if (!url?.trim()) return;
        document.execCommand("createLink", false, url.trim());
      } else if (command === "insertImage") {
        const url = window.prompt("Image URL");
        if (!url?.trim()) return;
        document.execCommand("insertImage", false, url.trim());
      } else {
        document.execCommand(command, false);
      }

      updateBlock(focusedBlockId, {
        content: sanitizeInlineHtml(element.innerHTML),
      });
    },
    [blocks, focusedBlockId, updateBlock]
  );

  const handleFormatArticle = useCallback(() => {
    setFormatError(null);
    startFormatTransition(async () => {
      const source = blocks
        .map((block) => block.content.trim())
        .filter(Boolean)
        .join("\n\n");

      const result = await formatArticleBodyAction({
        content: source || initialBody,
        articleTitle,
      });

      if (result.error) {
        setFormatError(result.error);
        return;
      }

      if (result.html) {
        setBlocks(bodyToBlocks(result.html, articleTitle));
      }
    });
  }, [articleTitle, blocks, initialBody]);

  const focusedBlock = blocks.find((block) => block.id === focusedBlockId) ?? null;

  return (
    <div className="space-y-3">
      <textarea name="body" hidden readOnly value={html} />

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface/40 p-3">
        <button
          type="button"
          disabled={disabled || formatting}
          onClick={handleFormatArticle}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
        >
          {formatting ? "Formatting…" : "Format Article"}
        </button>

        <span className="hidden h-5 w-px bg-border sm:inline-block" aria-hidden="true" />

        <button type="button" disabled={disabled} onClick={() => addBlock("paragraph")} className={toolbarButtonClass}>
          + Paragraph
        </button>
        <button type="button" disabled={disabled} onClick={() => addBlock("h2")} className={toolbarButtonClass}>
          + H2
        </button>
        <button type="button" disabled={disabled} onClick={() => addBlock("h3")} className={toolbarButtonClass}>
          + H3
        </button>

        {focusedBlock && isRichTextBlock(focusedBlock.type) ? (
          <>
            <span className="hidden h-5 w-px bg-border sm:inline-block" aria-hidden="true" />
            <button type="button" disabled={disabled} onClick={() => applyInlineCommand("bold")} className={toolbarButtonClass}>
              Bold
            </button>
            <button type="button" disabled={disabled} onClick={() => applyInlineCommand("italic")} className={toolbarButtonClass}>
              Italic
            </button>
            <button type="button" disabled={disabled} onClick={() => applyInlineCommand("createLink")} className={toolbarButtonClass}>
              Link
            </button>
            <button type="button" disabled={disabled} onClick={() => applyInlineCommand("insertImage")} className={toolbarButtonClass}>
              Image
            </button>
          </>
        ) : null}
      </div>

      {formatError ? <p className="text-sm text-red-600">{formatError}</p> : null}

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-md border border-border bg-white p-3 shadow-sm"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <select
                value={block.type}
                disabled={disabled}
                onChange={(event) =>
                  updateBlock(block.id, {
                    type: event.target.value as ArticleBlockType,
                  })
                }
                className={selectClass}
                aria-label={`Block ${index + 1} type`}
              >
                {BLOCK_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={() => moveBlock(block.id, -1)}
                  className={toolbarButtonClass}
                  aria-label="Move block up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={disabled || index === blocks.length - 1}
                  onClick={() => moveBlock(block.id, 1)}
                  className={toolbarButtonClass}
                  aria-label="Move block down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeBlock(block.id)}
                  className={toolbarButtonClass}
                  aria-label="Remove block"
                >
                  Remove
                </button>
              </div>
            </div>

            {isPlainTextBlock(block.type) ? (
              <input
                type="text"
                ref={(element) => {
                  headingInputRefs.current[block.id] = element;
                }}
                value={block.content}
                disabled={disabled}
                onChange={(event) =>
                  updateBlock(block.id, { content: event.target.value })
                }
                placeholder={block.type === "h2" ? "Section heading (H2)" : "Subsection heading (H3)"}
                className="w-full rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : null}

            {isListBlock(block.type) ? (
              <textarea
                ref={(element) => {
                  listTextareaRefs.current[block.id] = element;
                }}
                value={block.content}
                disabled={disabled}
                rows={4}
                onChange={(event) =>
                  updateBlock(block.id, { content: event.target.value })
                }
                placeholder="One list item per line"
                className="w-full rounded-md border border-border px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : null}

            {isRichTextBlock(block.type) ? (
              <RichTextBlockEditor
                block={block}
                disabled={disabled}
                editorRef={(element) => {
                  richTextRefs.current[block.id] = element;
                }}
                onFocus={() => setFocusedBlockId(block.id)}
                onChange={(content) =>
                  updateBlock(block.id, { content: sanitizeInlineHtml(content) })
                }
              />
            ) : null}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Use H2 for major sections and H3 for subsections. The article title is the only H1 on the published page.
      </p>
    </div>
  );
});
