export default function AutoRestockLoading() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-9 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
