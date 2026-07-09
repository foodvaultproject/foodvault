export function DashboardSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f3f4f6]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="h-10 w-56 rounded-lg bg-border" />
        <div className="mt-8 h-56 rounded-lg bg-border" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-36 rounded-lg bg-border" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function AccountPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f3f4f6]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="h-10 w-48 rounded-lg bg-border" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-border" />
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 rounded-lg bg-border" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MembershipPageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f3f4f6]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="h-10 w-48 rounded-lg bg-border" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-72 rounded-lg bg-border" />
          <div className="h-72 rounded-lg bg-border" />
        </div>
      </div>
    </div>
  );
}
