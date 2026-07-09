"use client";

import { useEffect, useState } from "react";
import { getPartnerSession } from "@/lib/partner-auth";
import { getPartnerRecord } from "@/lib/partner-data";
import {
  getAffiliateSetupTasks,
  getPartnerAffiliateProgramStatus,
  isAffiliateProgramSetupComplete,
  type AffiliateSetupTask,
} from "@/lib/partner-affiliate/program-status";
import {
  resolvePartnerOnboardingState,
  type PartnerOnboardingState,
} from "@/lib/partner-status";

type PartnerAffiliateSetupStatus = {
  loading: boolean;
  visible: boolean;
  incompleteTasks: AffiliateSetupTask[];
  onboardingState: PartnerOnboardingState | null;
};

const INITIAL_STATE: PartnerAffiliateSetupStatus = {
  loading: true,
  visible: false,
  incompleteTasks: [],
  onboardingState: null,
};

export function usePartnerAffiliateSetupStatus(): PartnerAffiliateSetupStatus {
  const [state, setState] = useState<PartnerAffiliateSetupStatus>(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const session = await getPartnerSession();
      if (!session) {
        if (!cancelled) {
          setState({
            loading: false,
            visible: false,
            incompleteTasks: [],
            onboardingState: null,
          });
        }
        return;
      }

      const partner = await getPartnerRecord(session.id);
      if (!partner?.affiliate_enabled) {
        if (!cancelled) {
          setState({
            loading: false,
            visible: false,
            incompleteTasks: [],
            onboardingState: null,
          });
        }
        return;
      }

      const onboardingState = resolvePartnerOnboardingState(
        partner.application_status_v2,
        partner.listing_status_v2
      );

      if (onboardingState !== "LIVE") {
        if (!cancelled) {
          setState({
            loading: false,
            visible: false,
            incompleteTasks: [],
            onboardingState,
          });
        }
        return;
      }

      const programStatus = await getPartnerAffiliateProgramStatus(partner.id);
      const tasks = getAffiliateSetupTasks(programStatus);
      const incompleteTasks = tasks.filter((task) => !task.complete);
      const visible = !isAffiliateProgramSetupComplete(programStatus);

      if (!cancelled) {
        setState({
          loading: false,
          visible,
          incompleteTasks,
          onboardingState,
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
