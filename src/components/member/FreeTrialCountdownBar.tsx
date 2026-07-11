"use client";

import { useEffect, useState } from "react";
import {
  useIsFreeTrialMember,
  useTrialEndsAt,
} from "@/components/member/MemberSignupCtaProvider";
import {
  getTrialCountdownParts,
  type TrialCountdownParts,
} from "@/lib/member/trial-countdown";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatCountdownLine(parts: TrialCountdownParts) {
  return `${parts.days} Days : ${pad(parts.hours)} Hours : ${pad(parts.minutes)} Minutes : ${pad(parts.seconds)} Seconds`;
}

export function FreeTrialCountdownBar() {
  const isFreeTrial = useIsFreeTrialMember();
  const trialEndsAt = useTrialEndsAt();
  const [parts, setParts] = useState<TrialCountdownParts>(() =>
    getTrialCountdownParts(trialEndsAt)
  );

  useEffect(() => {
    if (!isFreeTrial || !trialEndsAt) {
      return;
    }

    setParts(getTrialCountdownParts(trialEndsAt));

    const intervalId = window.setInterval(() => {
      setParts(getTrialCountdownParts(trialEndsAt));
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [isFreeTrial, trialEndsAt]);

  if (!isFreeTrial || !trialEndsAt || parts.expired) {
    return null;
  }

  return (
    <div
      className="border-t border-primary/20 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white"
      role="timer"
      aria-live="polite"
      aria-label={`Free Trial Ends In ${formatCountdownLine(parts)}`}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-0.5 px-4 py-2 text-center sm:flex-row sm:gap-2 sm:px-6 sm:py-2.5 lg:px-8">
        <span className="text-[11px] font-semibold uppercase tracking-wide sm:text-xs">
          Free Trial Ends In
        </span>
        <span className="text-[11px] font-bold tabular-nums sm:text-xs">
          {formatCountdownLine(parts)}
        </span>
      </div>
    </div>
  );
}

export const FREE_TRIAL_COUNTDOWN_BAR_HEIGHT_REM = 2.5;
