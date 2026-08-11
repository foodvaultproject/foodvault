import { formatArticleBodyHtml } from "@/lib/discover/article-body";

type ArticleBodyProps = {
  body: string | null;
  title?: string | null;
};

export function ArticleBody({ body, title }: ArticleBodyProps) {
  const html = formatArticleBodyHtml(body, title);

  if (!html) {
    return <p className="text-lg text-muted-foreground">This article has no body content yet.</p>;
  }

  return (
    <div
      className="article-body max-w-none space-y-6 text-foreground [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-foreground [&_img]:my-10 [&_img]:rounded-lg [&_img]:border [&_img]:border-border [&_li]:text-[1.125rem] [&_li]:leading-[1.8] [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6 [&_p]:text-[1.125rem] [&_p]:leading-[1.8] [&_ul]:my-6 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
