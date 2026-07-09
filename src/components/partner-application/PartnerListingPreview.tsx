import { PartnerLogo } from "@/components/partners/PartnerLogo";
import { PartnerBanner } from "@/components/partners/PartnerBanner";

type PartnerListingPreviewProps = {
  businessName: string;
  shortDescription: string;
  offerSummary: string;
  discountValue: string;
  bannerPreview?: string;
  logoPreview?: string;
};

export function PartnerListingPreview({
  businessName,
  shortDescription,
  offerSummary,
  discountValue,
  bannerPreview,
  logoPreview,
}: PartnerListingPreviewProps) {
  const displayName = businessName.trim() || "Your Brand Name";
  const description =
    shortDescription.trim() ||
    "Your short description will appear here for members browsing FoodVault.";
  const offer = offerSummary.trim() || "Member exclusive offer";
  const code = discountValue
    ? `FOODVAULT${discountValue.replace(/[^0-9]/g, "") || "15"}`
    : "FOODVAULT15";

  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Live Listing Preview
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
          <PartnerBanner src={bannerPreview} alt="" sizes="400px">
            {!bannerPreview ? (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-surface-lavender" />
            ) : null}
          </PartnerBanner>

          <div className="relative px-5 pb-5 pt-10">
            <PartnerLogo
              src={logoPreview}
              alt=""
              businessName={displayName}
              size="sm"
              bordered
              shadow
              isCropped={Boolean(logoPreview)}
              className="absolute -top-8 left-5 ring-4 ring-background"
            />

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-foreground">{displayName}</h3>
                <p className="text-sm text-muted-foreground">New Zealand</p>
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <span aria-hidden="true">♥</span>
                <span aria-hidden="true">🛍</span>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>

            <button
              type="button"
              className="mt-4 w-full rounded-md border border-border py-2 text-xs font-bold uppercase tracking-wide text-foreground"
            >
              Follow
            </button>

            <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Use code
              </p>
              <p className="mt-1 font-bold text-primary">{code}</p>
              <p className="mt-1 text-xs text-muted-foreground">{offer}</p>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white"
            >
              Shop Now
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
        <h3 className="font-bold text-foreground">What happens after approval?</h3>
        <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
          {[
            "We review your application",
            "FoodVault generates your member code",
            "You accept and confirm offer details",
            "Create the code on your website",
            "Confirm live and go live on FoodVault",
          ].map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Join 100+ quality New Zealand brands already listed on FoodVault.
      </p>
    </div>
  );
}
