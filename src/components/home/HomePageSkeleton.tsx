import { HOME_HERO_PY_COMPACT } from "@/components/home/section-spacing";

function PulseBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/15 ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export function HomePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading homepage">
      <section className="relative flex flex-col overflow-hidden border-b border-white/15 bg-primary">
        <div className="pointer-events-none absolute inset-0 z-0 bg-primary/90" aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-[1200px]">
          <div className="grid min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,46%)] md:min-h-[28rem] md:items-stretch lg:min-h-[32rem]">
            <div className={`flex flex-col justify-center px-4 sm:px-6 lg:px-8 ${HOME_HERO_PY_COMPACT}`}>
              <PulseBlock className="h-10 w-4/5 max-w-md bg-white/20" />
              <PulseBlock className="mt-4 h-10 w-3/5 max-w-sm bg-white/15" />
              <PulseBlock className="mt-6 h-4 w-full max-w-xl bg-white/10" />
              <PulseBlock className="mt-2 h-4 w-5/6 max-w-lg bg-white/10" />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <PulseBlock className="h-11 w-full max-w-[11rem] bg-white/25" />
                <PulseBlock className="h-11 w-full max-w-[11rem] bg-white/15" />
              </div>
            </div>
            <div className="relative mt-auto flex min-h-0 items-end justify-center self-stretch px-4 pb-4 sm:px-6 md:mt-0 md:px-8 md:pb-0">
              <PulseBlock className="aspect-[4/5] w-full max-w-[20rem] rounded-2xl bg-white/10 md:max-w-none md:w-[70%]" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-8 sm:py-10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <PulseBlock
                key={index}
                className="aspect-[4/3] bg-surface"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
