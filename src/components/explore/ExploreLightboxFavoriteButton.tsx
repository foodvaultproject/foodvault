"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { FavoriteHeartIcon } from "@/components/favorites/FavoriteHeartIcon";
import { getAuthSession } from "@/lib/auth";
import { toggleFavoritePartnerAction } from "@/lib/member/favorites-actions";

type ExploreLightboxFavoriteButtonProps = {
  partnerId: string;
  initialFavorited: boolean;
  canFavorite: boolean;
};

export function ExploreLightboxFavoriteButton({
  partnerId,
  initialFavorited,
  canFavorite,
}: ExploreLightboxFavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
    favorited,
    (_current, nextValue: boolean) => nextValue
  );
  const [bouncing, setBouncing] = useState(false);
  const [pendingFavorite, setPendingFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFavorited(initialFavorited);
    setBouncing(false);
    setPendingFavorite(false);
  }, [partnerId, initialFavorited]);

  function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (isPending || bouncing) return;

    if (!canFavorite) {
      void getAuthSession().then((session) => {
        router.push(session ? "/pricing" : "/signup");
      });
      return;
    }

    if (optimisticFavorited) {
      startTransition(async () => {
        setOptimisticFavorited(false);
        const result = await toggleFavoritePartnerAction(partnerId, true);
        if ("error" in result && result.error) {
          return;
        }
        setFavorited(false);
      });
      return;
    }

    setBouncing(true);
    startTransition(async () => {
      const result = await toggleFavoritePartnerAction(partnerId, false);
      if ("error" in result && result.error) {
        setBouncing(false);
        return;
      }

      setPendingFavorite(true);
    });
  }

  function handleAnimationEnd() {
    if (!bouncing || !pendingFavorite) return;

    setBouncing(false);
    setPendingFavorite(false);
    setFavorited(true);
    setOptimisticFavorited(true);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={optimisticFavorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={optimisticFavorited}
      className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity disabled:opacity-60"
      onAnimationEnd={handleAnimationEnd}
    >
      <FavoriteHeartIcon
        favorited={optimisticFavorited}
        size="md"
        className={`${bouncing ? "animate-fv-heart-bounce text-white" : "text-white"}`.trim()}
      />
    </button>
  );
}
