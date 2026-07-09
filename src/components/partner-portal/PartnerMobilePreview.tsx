import Image from "next/image";

type PartnerMobilePreviewProps = {
  companyName: string;
  shortDescription: string;
  offerTitle: string;
  offerSummary: string;
  memberCode: string;
  subcategories: string[];
};

export function PartnerMobilePreview({
  companyName,
  shortDescription,
  offerTitle,
  offerSummary,
  memberCode,
  subcategories,
}: PartnerMobilePreviewProps) {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Live Preview
      </p>

      <div className="overflow-hidden rounded-[2rem] border-[6px] border-foreground/90 bg-foreground shadow-2xl">
        <div className="bg-white">
          <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
            <span>←</span>
            <span className="flex gap-2">
              <span>↗</span>
              <span>♥</span>
            </span>
          </div>

          <div className="relative h-36">
            <Image
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop"
              alt=""
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>

          <div className="px-4 pb-5 pt-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-sm font-bold text-white">
                {companyName.charAt(0)}
              </span>
              <div>
                <p className="flex items-center gap-1 font-bold text-foreground">
                  {companyName}
                  <span className="text-primary">✓</span>
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-success px-3 py-2 text-white">
              <p className="text-sm font-bold">{offerTitle}</p>
              <p className="text-xs text-white/90">{offerSummary}</p>
            </div>

            <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Member Code
              </p>
              <p className="font-bold text-primary">{memberCode}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {subcategories.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {shortDescription}
            </p>

            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Members are 2.4× more likely to engage with offers that include a confirmed discount code.
        </p>
      </div>
    </div>
  );
}
