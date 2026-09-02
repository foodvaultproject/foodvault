import type { Metadata } from "next";
import { MembershipReview } from "@/components/signup/MembershipReview";
import { getSavingsTickerImages } from "@/lib/homepage/hero-gallery-images";
import { getMembershipSettings } from "@/lib/member/settings";
import { requireMemberSession } from "@/lib/member/signup-actions";

export const metadata: Metadata = {
  title: "Review Your Membership",
  description: "Review your FoodVault membership plan and pay securely with Stripe.",
};

type SignupMembershipPageProps = {
  searchParams: Promise<{ cancelled?: string }>;
};

export default async function SignupMembershipPage({
  searchParams,
}: SignupMembershipPageProps) {
  await requireMemberSession();
  const [{ cancelled }, settings, tickerImages] = await Promise.all([
    searchParams,
    getMembershipSettings(),
    getSavingsTickerImages(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <MembershipReview
        settings={settings}
        tickerImages={tickerImages}
        cancelled={cancelled === "1"}
      />
    </div>
  );
}
