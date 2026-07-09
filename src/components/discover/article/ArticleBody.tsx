import { formatArticleBodyHtml } from "@/lib/discover/article-body";

type ArticleBodyProps = {
  body: string | null;
};

export function ArticleBody({ body }: ArticleBodyProps) {
  const html = formatArticleBodyHtml(body);

  if (!html) {
    return <p className="text-lg text-muted-foreground">This article has no body content yet.</p>;
  }

  return (
    <div
      className="article-body max-w-none space-y-6 text-foreground [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:text-foreground [&_img]:my-10 [&_img]:rounded-lg [&_img]:border [&_img]:border-border [&_li]:text-[1.125rem] [&_li]:leading-[1.8] [&_ol]:my-6 [&_ol]:space-y-3 [&_p]:text-[1.125rem] [&_p]:leading-[1.8] [&_ul]:my-6 [&_ul]:space-y-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
