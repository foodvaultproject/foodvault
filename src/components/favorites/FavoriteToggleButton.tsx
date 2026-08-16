"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { getAuthSession } from "@/lib/auth";
import { FavoriteHeartIcon } from "@/components/favorites/FavoriteHeartIcon";
import {
  isLocalHospitalityFavorited,
  shouldUseLocalHospitalityFavorite,
  toggleLocalHospitalityFavorite,
} from "@/lib/hospitality/local-favorites";
import { toggleFavoritePartnerAction } from "@/lib/member/favorites-actions";

type FavoriteToggleButtonProps = {
  partnerId: string;
  initialFavorited: boolean;
};

export function FavoriteToggleButton({
  partnerId,
  initialFavorited,
}: FavoriteToggleButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(() =>
    shouldUseLocalHospitalityFavorite(partnerId)
      ? isLocalHospitalityFavorited(partnerId)
      : initialFavorited
  );
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
    favorited,
    (_current, nextValue: boolean) => nextValue
  );
  const [isPending, startTransition] = useTransition();

  async function handleToggle() {
    const session = await getAuthSession();
    if (!session || session.accountType === "partner") {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      const nextValue = !optimisticFavorited;
      setOptimisticFavorited(nextValue);

      if (shouldUseLocalHospitalityFavorite(partnerId)) {
        toggleLocalHospitalityFavorite(partnerId);
        setFavorited(nextValue);
        return;
      }

      const result = await toggleFavoritePartnerAction(partnerId, optimisticFavorited);
      if ("error" in result && result.error) {
        return;
      }

      setFavorited(nextValue);
    });
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={isPending}
      aria-label={optimisticFavorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={optimisticFavorited}
      className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
    >
      <FavoriteHeartIcon favorited={optimisticFavorited} />
      {isPending ? "Saving..." : optimisticFavorited ? "Saved" : "Save to Favorites"}
    </button>
  );
}

export function FavoriteToggleIcon({
  partnerId,
  initialFavorited,
}: FavoriteToggleButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(() =>
    shouldUseLocalHospitalityFavorite(partnerId)
      ? isLocalHospitalityFavorited(partnerId)
      : initialFavorited
  );
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
    favorited,
    (_current, nextValue: boolean) => nextValue
  );
  const [isPending, startTransition] = useTransition();

  async function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const session = await getAuthSession();
    if (!session || session.accountType === "partner") {
      router.push("/login");
      return;
    }

    startTransition(async () => {
      const nextValue = !optimisticFavorited;
      setOptimisticFavorited(nextValue);

      if (shouldUseLocalHospitalityFavorite(partnerId)) {
        toggleLocalHospitalityFavorite(partnerId);
        setFavorited(nextValue);
        return;
      }

      const result = await toggleFavoritePartnerAction(partnerId, optimisticFavorited);
      if ("error" in result && result.error) {
        return;
      }

      setFavorited(nextValue);
    });
  }

  return (
    <button
      type="button"
      onClick={(event) => void handleToggle(event)}
      disabled={isPending}
      aria-label={optimisticFavorited ? "Remove from favorites" : "Save to favorites"}
      className="rounded-full p-1 transition-transform hover:scale-110 disabled:opacity-60"
    >
      <FavoriteHeartIcon favorited={optimisticFavorited} />
    </button>
  );
}
