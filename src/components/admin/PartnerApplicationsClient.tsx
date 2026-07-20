"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { StatCard, formatAdminDate } from "@/components/admin/AdminUi";
import {
  approvePartnerApplicationAction,
  rejectPartnerApplicationAction,
} from "@/lib/admin/actions";
import type { PartnerApplicationRow } from "@/lib/admin/types";

type Stats = {
  pending: number;
  approvedToday: number;
  avgReview: string;
  rejectionRate: string;
};

export function PartnerApplicationsClient({
  stats,
  applications,
}: {
  stats: Stats;
  applications: PartnerApplicationRow[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<PartnerApplicationRow | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAction(action: "approve" | "reject") {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approvePartnerApplicationAction(selected.id)
          : await rejectPartnerApplicationAction(selected.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSelected(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Partner Applications</h1>
        <p className="mt-1 text-sm text-muted">Review and approve new partner submissions</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending Review" value={stats.pending} />
        <StatCard label="Approved Today" value={stats.approvedToday} />
        <StatCard label="Avg Review Time" value={stats.avgReview} />
        <StatCard label="Rejection Rate" value={stats.rejectionRate} />
      </div>

      <div className="flex gap-6">
        <div className={`min-w-0 flex-1 ${selected ? "lg:max-w-[calc(100%-380px)]" : ""}`}>
          <div className="overflow-hidden rounded border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Business</th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted md:table-cell">Category</th>
                  <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted lg:table-cell">Location</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Submitted</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted"></th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      No applications pending review
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      className={`border-b border-border last:border-0 hover:bg-surface ${
                        selected?.id === app.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">{app.business_name ?? "—"}</td>
                      <td className="hidden px-4 py-3 text-muted md:table-cell">{app.primary_category ?? "—"}</td>
                      <td className="hidden px-4 py-3 text-muted lg:table-cell">{app.location ?? "—"}</td>
                      <td className="px-4 py-3 text-muted">{formatAdminDate(app.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setSelected(app)}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected ? (
          <aside className="w-full shrink-0 rounded border border-border bg-white lg:w-[360px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Application Review</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-muted hover:text-foreground"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              <Detail label="Business Name" value={selected.business_name} />
              <ApplicationMediaThumbnails application={selected} />
              <Detail label="Website" value={selected.website_url} />
              <Detail label="Category" value={selected.primary_category} />
              <Detail label="Location" value={selected.location} />
              <Detail label="Description" value={selected.short_description} />
              <Detail label="Brand Story" value={selected.brand_story} />
              <Detail label="Offer Type" value={selected.offer_type} />
              <Detail label="Discount" value={selected.discount_value ? `${selected.discount_value}%` : null} />
              <Detail
                label="Offer Scope"
                value={
                  selected.offer_scope === "selected_products"
                    ? "Selected Products"
                    : "Entire Store"
                }
              />
              <Detail label="Member Code" value={selected.member_code} />
              <Detail label="Support Email" value={selected.support_email} />
              <Detail label="Support Phone" value={selected.support_phone} />
              <Detail label="Submitted" value={formatAdminDate(selected.created_at)} />
            </div>
            {error ? <p className="px-5 text-sm text-red-600">{error}</p> : null}
            <div className="flex gap-3 border-t border-border p-5">
              <button
                type="button"
                disabled={pending}
                onClick={() => handleAction("reject")}
                className="flex-1 rounded-sm border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface disabled:opacity-60"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleAction("approve")}
                className="flex-1 fv-btn-primary inline-flex items-center justify-center rounded-sm px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
              >
                Approve
              </button>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value ?? "—"}</p>
    </div>
  );
}

function ApplicationMediaThumbnails({ application }: { application: PartnerApplicationRow }) {
  const gallery = application.gallery_image_urls ?? [];
  const hasBanner = Boolean(application.banner_image_url);
  const hasLogo = Boolean(application.logo_url);
  const hasGallery = gallery.length > 0;

  if (!hasBanner && !hasLogo && !hasGallery) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Brand Assets
        </p>
        <p className="mt-1 text-sm text-muted">No images uploaded</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Brand Assets</p>
      <div className="mt-2 space-y-3">
        {hasBanner ? (
          <MediaPreview label="Banner" href={application.banner_image_url!} aspect="banner">
            <Image
              src={application.banner_image_url!}
              alt=""
              width={320}
              height={107}
              className="h-full w-full object-cover"
              unoptimized
            />
          </MediaPreview>
        ) : null}

        {hasLogo ? (
          <MediaPreview label="Logo" href={application.logo_url!} aspect="logo">
            <Image
              src={application.logo_url!}
              alt=""
              width={64}
              height={64}
              className="h-full w-full object-cover"
              unoptimized
            />
          </MediaPreview>
        ) : null}

        {hasGallery ? (
          <div>
            <p className="mb-1.5 text-xs text-muted">Gallery ({gallery.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {gallery.map((url, index) => (
                <MediaPreview key={`${url}-${index}`} href={url} aspect="gallery" hideLabel>
                  <Image
                    src={url}
                    alt=""
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </MediaPreview>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MediaPreview({
  label,
  href,
  aspect,
  hideLabel = false,
  children,
}: {
  label?: string;
  href: string;
  aspect: "banner" | "logo" | "gallery";
  hideLabel?: boolean;
  children: ReactNode;
}) {
  const frameClass =
    aspect === "banner"
      ? "aspect-[3/1] w-full"
      : aspect === "logo"
        ? "h-16 w-16 rounded-full"
        : "aspect-square w-full";

  return (
    <div>
      {label && !hideLabel ? <p className="mb-1.5 text-xs text-muted">{label}</p> : null}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`block overflow-hidden rounded border border-border bg-page transition hover:border-primary/40 hover:shadow-sm ${frameClass}`}
        title="Open full image"
      >
        {children}
      </a>
    </div>
  );
}
