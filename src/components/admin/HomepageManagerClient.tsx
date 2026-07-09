"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveHomepageAction } from "@/lib/admin/actions";

type LivePartner = {
  id: string;
  business_name: string | null;
  primary_category?: string | null;
};

const inputClass =
  "w-full rounded-md border border-border px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

export function HomepageManagerClient({
  headline,
  subheading,
  livePartners,
  featuredPartnerIds,
  newThisWeekIds,
}: {
  headline: string;
  subheading: string;
  livePartners: LivePartner[];
  featuredPartnerIds: string[];
  newThisWeekIds: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [featured, setFeatured] = useState<string[]>(featuredPartnerIds.slice(0, 6));
  const [newWeek, setNewWeek] = useState<string[]>(newThisWeekIds.slice(0, 12));

  function toggleSelection(
    list: string[],
    setList: (v: string[]) => void,
    id: string,
    max: number
  ) {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else if (list.length < max) {
      setList([...list, id]);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    featured.forEach((id) => fd.append("featured_partners", id));
    newWeek.forEach((id) => fd.append("new_this_week", id));
    startTransition(async () => {
      const result = await saveHomepageAction(fd);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Homepage saved successfully.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Homepage Manager</h1>
        <p className="mt-1 text-sm text-muted">Configure public homepage content and featured partners</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded border border-border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Hero Copy</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="homepage_headline">Headline</label>
              <input
                id="homepage_headline"
                name="homepage_headline"
                defaultValue={headline}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="homepage_subheading">Subheading</label>
              <textarea
                id="homepage_subheading"
                name="homepage_subheading"
                rows={3}
                defaultValue={subheading}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="rounded border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Featured Partners
            </h2>
            <span className="text-xs text-muted">{featured.length}/6 selected</span>
          </div>
          <PartnerSelector
            partners={livePartners}
            selected={featured}
            max={6}
            onToggle={(id) => toggleSelection(featured, setFeatured, id, 6)}
          />
        </section>

        <section className="rounded border border-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              New This Week
            </h2>
            <span className="text-xs text-muted">{newWeek.length}/12 selected</span>
          </div>
          <PartnerSelector
            partners={livePartners}
            selected={newWeek}
            max={12}
            onToggle={(id) => toggleSelection(newWeek, setNewWeek, id, 12)}
          />
        </section>

        {message ? (
          <p className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
        >
          Save Homepage
        </button>
      </form>
    </div>
  );
}

function PartnerSelector({
  partners,
  selected,
  max,
  onToggle,
}: {
  partners: LivePartner[];
  selected: string[];
  max: number;
  onToggle: (id: string) => void;
}) {
  if (partners.length === 0) {
    return <p className="text-sm text-muted">No live partners available.</p>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {partners.map((partner) => {
        const isSelected = selected.includes(partner.id);
        const disabled = !isSelected && selected.length >= max;
        return (
          <button
            key={partner.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(partner.id)}
            className={`rounded border px-4 py-3 text-left text-sm transition-colors ${
              isSelected
                ? "border-primary bg-primary/5 text-primary"
                : disabled
                  ? "cursor-not-allowed border-border bg-page text-[#94a3b8]"
                  : "border-border bg-white text-foreground hover:border-primary/40"
            }`}
          >
            <p className="font-semibold">{partner.business_name ?? "Unnamed"}</p>
            {partner.primary_category ? (
              <p className="text-xs text-muted">{partner.primary_category}</p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
