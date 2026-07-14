"use client";

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
import { getPartnerSession } from "@/lib/partner-auth";
import { confirmMemberOfferLiveAction } from "@/lib/partner/confirm-offer-live-action";
import {
  confirmMemberOfferLive,
  getPartnerRecord,
  type PartnerRecord,
} from "@/lib/partner-data";
import {
  isListingEditable,
  resolvePartnerOnboardingState,
  type PartnerOnboardingState,
} from "@/lib/partner-status";
import { PARTNER_ACTIVE_ID_SESSION_KEY } from "@/components/partner-portal/PartnerOnboardingStatusBanner";

type PartnerOnboardingContextValue = {
  partner: PartnerRecord | null;
  loading: boolean;
  onboardingState: PartnerOnboardingState;
  isListingEditable: boolean;
  showActivationDialog: boolean;
  confirmingActivation: boolean;
  openActivationDialog: () => void;
  closeActivationDialog: () => void;
  confirmActivation: () => Promise<void>;
  refreshPartner: () => Promise<void>;
};

const PartnerOnboardingContext = createContext<PartnerOnboardingContextValue | null>(
  null
);

export function PartnerOnboardingProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<PartnerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [confirmingActivation, setConfirmingActivation] = useState(false);

  const refreshPartner = useCallback(async () => {
    const session = await getPartnerSession();
    if (!session) {
      setPartner(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(PARTNER_ACTIVE_ID_SESSION_KEY);
      }
      setLoading(false);
      return;
    }

    const record = await getPartnerRecord(session.id);
    setPartner(record);
    if (typeof window !== "undefined" && record?.id) {
      sessionStorage.setItem(PARTNER_ACTIVE_ID_SESSION_KEY, record.id);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshPartner();
  }, [refreshPartner]);

  const onboardingState = useMemo((): PartnerOnboardingState => {
    if (!partner) {
      return "APPLICATION_INCOMPLETE";
    }

    return resolvePartnerOnboardingState(
      partner.application_status_v2,
      partner.listing_status_v2
    );
  }, [partner]);

  const confirmActivation = useCallback(async () => {
    if (!partner) return;

    const session = await getPartnerSession();
    if (!session) return;

    setConfirmingActivation(true);
    try {
      if (isSupabaseConfigured()) {
        const result = await confirmMemberOfferLiveAction(partner.id);
        if (result.error) {
          throw new Error(result.error);
        }
        await refreshPartner();
      } else {
        const updated = await confirmMemberOfferLive(session.id, partner.id);
        setPartner(updated);
      }
      setShowActivationDialog(false);
    } finally {
      setConfirmingActivation(false);
    }
  }, [partner, refreshPartner]);

  const value = useMemo<PartnerOnboardingContextValue>(
    () => ({
      partner,
      loading,
      onboardingState,
      isListingEditable: isListingEditable(onboardingState),
      showActivationDialog,
      confirmingActivation,
      openActivationDialog: () => setShowActivationDialog(true),
      closeActivationDialog: () => setShowActivationDialog(false),
      confirmActivation,
      refreshPartner,
    }),
    [
      partner,
      loading,
      onboardingState,
      showActivationDialog,
      confirmingActivation,
      confirmActivation,
      refreshPartner,
    ]
  );

  return (
    <PartnerOnboardingContext.Provider value={value}>
      {children}
    </PartnerOnboardingContext.Provider>
  );
}

export function usePartnerOnboarding() {
  const context = useContext(PartnerOnboardingContext);
  if (!context) {
    throw new Error("usePartnerOnboarding must be used within PartnerOnboardingProvider");
  }
  return context;
}
