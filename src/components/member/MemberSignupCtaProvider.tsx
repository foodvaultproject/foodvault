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
import { isSupabaseConfigured } from "@/lib/auth";
import { resolveClientMembershipView } from "@/lib/member/client-membership";
import { createClient } from "@/lib/supabase/client";

type MemberSignupCtaContextValue = {
  isFreeTrial: boolean;
  isActiveMember: boolean;
  trialEndsAt: string | null;
  isLoading: boolean;
};

const MemberSignupCtaContext = createContext<MemberSignupCtaContextValue>({
  isFreeTrial: false,
  isActiveMember: false,
  trialEndsAt: null,
  isLoading: true,
});

export function MemberSignupCtaProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<MemberSignupCtaContextValue>({
    isFreeTrial: false,
    isActiveMember: false,
    trialEndsAt: null,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true }));

    try {
      const view = await resolveClientMembershipView();
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
