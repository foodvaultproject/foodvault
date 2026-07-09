import type { Metadata } from "next";
import { MembershipReview } from "@/components/signup/MembershipReview";
import { getMembershipSettings } from "@/lib/member/settings";
import { requireMemberSession } from "@/lib/member/signup-actions";

export const metadata: Metadata = {
  title: "Review Your Membership",
  description: "Review your FoodVault membership plan before continuing to payment.",
};

export default async function SignupMembershipPage() {
  await requireMemberSession();
  const settings = await getMembershipSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
      <MembershipReview settings={settings} />
    </div>
  );
}
