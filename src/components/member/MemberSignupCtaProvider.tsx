"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isCurrentUserAdminAction } from "@/lib/admin/auth";
import { isSupabaseConfigured, getAuthSession, syncAuthSessionHints } from "@/lib/auth";
import { repairMemberSessionAction } from "@/lib/auth/finalize-verified-session";
import { readMembershipStateHintClient } from "@/lib/auth/session-hint";
import { resolveClientMembershipView } from "@/lib/member/client-membership";
import { createClient } from "@/lib/supabase/client";

type MemberSignupCtaContextValue = {
  isFreeTrial: boolean;
  isActiveMember: boolean;
  trialEndsAt: string | null;
  isLoading: boolean;
};

function initialMembershipStateFromHint(): Omit<MemberSignupCtaContextValue, "isLoading"> & {
  isLoading: boolean;
} {
  const membershipHint = readMembershipStateHintClient();

  if (membershipHint === "active") {
    return {
      isFreeTrial: false,
      isActiveMember: true,
      trialEndsAt: null,
      isLoading: false,
    };
  }

  if (membershipHint === "trial") {
    return {
      isFreeTrial: true,
      isActiveMember: false,
      trialEndsAt: null,
      isLoading: false,
    };
  }

  return {
    isFreeTrial: false,
    isActiveMember: false,
    trialEndsAt: null,
    isLoading: true,
  };
}

const MemberSignupCtaContext = createContext<MemberSignupCtaContextValue>({
  isFreeTrial: false,
  isActiveMember: false,
  trialEndsAt: null,
  isLoading: true,
});

export function MemberSignupCtaProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<MemberSignupCtaContextValue>(
    initialMembershipStateFromHint
  );

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true }));

    try {
      if (await isCurrentUserAdminAction()) {
        syncAuthSessionHints(null);
        setState({
          isFreeTrial: false,
          isActiveMember: false,
          trialEndsAt: null,
          isLoading: false,
        });
        return;
      }

      const session = await getAuthSession();
      if (!session || session.accountType !== "member") {
        syncAuthSessionHints(session);
        setState({
          isFreeTrial: false,
          isActiveMember: false,
          trialEndsAt: null,
          isLoading: false,
        });
        return;
      }

      let view = await resolveClientMembershipView();

      if (isSupabaseConfigured() && !view.isFreeTrial && !view.isActiveMember) {
        const repaired = await repairMemberSessionAction();
        if (repaired) {
          view = await resolveClientMembershipView();
        }
      }

      syncAuthSessionHints(session, view);
      setState({ ...view, isLoading: false });
    } catch {
      setState({
        isFreeTrial: false,
        isActiveMember: false,
        trialEndsAt: null,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

  const value = useMemo(() => state, [state]);

  return (
    <MemberSignupCtaContext.Provider value={value}>
      {children}
    </MemberSignupCtaContext.Provider>
  );
}

export function useMemberSignupCtaContext(): MemberSignupCtaContextValue {
  return useContext(MemberSignupCtaContext);
}

export function useIsFreeTrialMember(): boolean {
  return useMemberSignupCtaContext().isFreeTrial;
}

export function useIsActiveMember(): boolean {
  return useMemberSignupCtaContext().isActiveMember;
}

export function useTrialEndsAt(): string | null {
  return useMemberSignupCtaContext().trialEndsAt;
}
