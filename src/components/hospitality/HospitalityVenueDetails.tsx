"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  HOSPITALITY_VENUE_TYPE_LABELS,
} from "@/lib/hospitality/constants";
import {
  formatWeeklyScheduleLines,
  getVenueOpenState,
  parseWeeklySchedule,
} from "@/lib/hospitality/hours";
import { hospitalityDirectionsHref } from "@/lib/hospitality/maps";
import { formatHospitalityAddress } from "@/lib/hospitality/types";
import type { PartnerProfile } from "@/lib/member/partner-profile";
import { listPartnerSocialLinks, SOCIAL_PROFILE_ICONS } from "@/lib/partner-social";

type HospitalityVenueDetailsProps = {
  profile: PartnerProfile;
};

function websiteHref(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function HospitalityVenueDetails({ profile }: HospitalityVenueDetailsProps) {
  const hospitality = profile.hospitality;
  const socials = useMemo(
    () =>
      listPartnerSocialLinks({
        instagram: profile.instagram ?? undefined,
        facebook: profile.facebook ?? undefined,
        linkedin: profile.linkedin ?? undefined,
        tiktok: profile.tiktok ?? undefined,
        youtube: profile.youtube ?? undefined,
      }),
    [profile]
  );

  if (!hospitality) return null;

  const address = formatHospitalityAddress(hospitality.location);
  const directionsHref = hospitalityDirectionsHref(hospitality.location);
  const phoneHref = hospitality.phone.replace(/[\s()-]/g, "");
  const openState = getVenueOpenState(hospitality.openingHours);
  const hasSchedule = hospitality.openingHours.trim().startsWith("{");
  const venueTypeLabel = HOSPITALITY_VENUE_TYPE_LABELS[hospitality.venueType];
  const website = profile.websiteUrl?.trim() ?? "";
  const hasHighlights = Boolean(venueTypeLabel || website || socials.length > 0);

  return (
    <section
      id="info"
      className="rounded-2xl border border-gray-100 bg-background p-6 shadow-sm dark:border-gray-800"
    >
      <h2 className="text-sm font-semibold text-foreground">Venue details</h2>
      <div
        className={`mt-5 grid gap-8 ${hasHighlights ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}
      >
        <div className="min-w-0">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Address &amp; contact
          </h3>
          {address ? (
            <div className="mt-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-primary">
                  <MapPinIcon />
                </span>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium leading-relaxed text-foreground hover:text-primary hover:underline"
                >
                  {address}
                </a>
              </div>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
          ) : null}
          {hospitality.phone ? (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-primary">
                <PhoneIcon />
              </span>
              <a
                href={`tel:${phoneHref}`}
                className="text-sm font-medium text-foreground hover:text-primary hover:underline"
              >
                {hospitality.phone}
              </a>
            </div>
          ) : null}
        </div>

        {hospitality.openingHours ? (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Opening hours
              </h3>
              {openState ? (
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    openState === "open"
                      ? "bg-success-light text-success"
                      : "bg-surface text-muted-foreground"
                  }`}
                >
                  {openState === "open" ? "Open Now" : "Closed"}
                </span>
              ) : null}
            </div>
            <div className="mt-3">
              {hasSchedule ? (
                <ul className="max-w-xs space-y-1.5 text-sm">
                  {formatWeeklyScheduleLines(
                    parseWeeklySchedule(hospitality.openingHours)
                  ).map((row) => (
                    <li key={row.day} className="flex justify-between gap-6">
                      <span className="font-medium text-foreground">{row.label}</span>
                      <span className="text-right text-muted-foreground">{row.hours}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-foreground">{hospitality.openingHours}</p>
              )}
            </div>
          </div>
        ) : null}

        {hasHighlights ? (
          <div className="min-w-0">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Venue highlights
            </h3>
            {venueTypeLabel ? (
              <div className="mt-3">
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {venueTypeLabel}
                </span>
              </div>
            ) : null}
            {website ? (
              <div className="mt-3">
                <a
                  href={websiteHref(website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fv-btn-primary inline-flex items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Visit Website
                  <span aria-hidden="true">&#8599;</span>
                </a>
              </div>
            ) : null}
            {socials.length > 0 ? (
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Follow us on socials
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {socials.map((social) => (
                    <a
                      key={social.platform}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex h-14 w-14 items-center justify-center transition-opacity hover:opacity-80"
                    >
                      <Image
                        src={SOCIAL_PROFILE_ICONS[social.platform]}
                        alt=""
                        width={56}
                        height={56}
                        className="h-14 w-14 object-contain"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MapPinIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}
