export default function PartnerProfileLoading() {
  return (
    <div className="animate-pulse bg-background">
      <div className="relative h-40 bg-muted sm:h-48 md:h-56" />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-12 flex gap-4 sm:-mt-14">
          <div className="h-20 w-20 shrink-0 rounded-lg bg-muted ring-4 ring-background sm:h-24 sm:w-24" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-7 w-48 max-w-full rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            <div className="h-32 rounded-lg bg-muted" />
            <div className="h-24 rounded-lg bg-muted" />
            <div className="h-40 rounded-lg bg-muted" />
          </div>
          <div className="h-48 rounded-lg bg-muted lg:sticky lg:top-24" />
        </div>
      </div>
    </div>
  );
}
