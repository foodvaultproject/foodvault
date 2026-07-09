export type ApplicationStatusV2 =
  | "APPLICATION_UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type ListingStatusV2 = "PENDING" | "LIVE";

export type PartnerOnboardingState =
  | "APPLICATION_INCOMPLETE"
  | "APPLICATION_UNDER_REVIEW"
  | "APPROVED_PENDING_ACTIVATION"
  | "LIVE";

function normalizeStatus(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

export function resolvePartnerOnboardingState(
  applicationStatus: ApplicationStatusV2 | string | null | undefined,
  listingStatus: ListingStatusV2 | string | null | undefined
): PartnerOnboardingState {
  const listing = normalizeStatus(listingStatus);
  const application = normalizeStatus(applicationStatus);

  if (listing === "LIVE") {
    return "LIVE";
  }

  if (application === "APPROVED") {
    return "APPROVED_PENDING_ACTIVATION";
  }

  return "APPLICATION_UNDER_REVIEW";
}

export function isListingEditable(state: PartnerOnboardingState): boolean {
  return (
    state !== "APPLICATION_INCOMPLETE" && state !== "APPLICATION_UNDER_REVIEW"
  );
}
