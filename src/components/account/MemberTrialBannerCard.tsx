import Link from "next/link";
import { TrialCountdown } from "@/components/account/TrialCountdown";
import { formatMemberDate } from "@/lib/member/format";
import { SIGNUP_MEMBERSHIP_PATH } from "@/lib/member/paths";
import type { MemberTrialBanner } from "@/lib/member/queries";

export const MEMBER_TRIAL_BANNER_DESCRIPTION =
  "Discover new brands, unlock member-only discount codes, and experience all the benefits of FoodVault before deciding whether membership is right for you.";

type MemberTrialBannerCardProps = {
  trialBanner: MemberTrialBanner;
  className?: string;
};

export function MemberTrialBannerCard({
  trialBanner,
  className = "",
}: MemberTrialBannerCardProps) {
  return (
    <section
      className={`rounded-lg border border-primary/20 bg-gradient-to-br from-white via-white to-primary/5 p-6 shadow-sm sm:p-8 ${className}`.trim()}
    >
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
        FREE Trial Active
      </span>
      <p className="mt-4 text-sm text-muted-foreground">
        Trial Ends: {formatMemberDate(trialBanner.trialEndsAt)}
      </p>
      <TrialCountdown trialEndsAt={trialBanner.trialEndsAt} />
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
        {MEMBER_TRIAL_BANNER_DESCRIPTION}
      </p>
      <div className="mt-6">
        <Link
          href={SIGNUP_MEMBERSHIP_PATH}
          className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-3 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150"
        >
          Upgrade Now
        </Link>
      </div>
    </section>
  );
}
