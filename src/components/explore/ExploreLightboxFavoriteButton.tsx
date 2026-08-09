"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [bouncing, setBouncing] = useState(false);
  const [pendingFavorite, setPendingFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFavorited(initialFavorited);
    setBouncing(false);
    setPendingFavorite(false);
  }, [partnerId, initialFavorited]);

  async function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (loading || bouncing) return;

    if (!canFavorite) {
      const session = await getAuthSession();
      router.push(session ? "/pricing" : "/signup");
      return;
    }

    if (favorited) {
      setLoading(true);
      const result = await toggleFavoritePartnerAction(partnerId, true);
      setLoading(false);

      if (!("error" in result) || !result.error) {
        setFavorited(false);
        router.refresh();
      }
      return;
    }

    setLoading(true);
    setBouncing(true);

    const result = await toggleFavoritePartnerAction(partnerId, false);
    setLoading(false);

    if ("error" in result && result.error) {
      setBouncing(false);
      return;
    }

    setPendingFavorite(true);
  }

  function handleAnimationEnd() {
    if (!bouncing || !pendingFavorite) return;

    setBouncing(false);
    setPendingFavorite(false);
    setFavorited(true);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={(event) => void handleToggle(event)}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={favorited}
      className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity disabled:opacity-60"
      onAnimationEnd={handleAnimationEnd}
    >
      <FavoriteHeartIcon
        favorited={favorited}
        size="md"
        className={`${bouncing ? "animate-fv-heart-bounce text-white" : "text-white"}`.trim()}
      />
    </button>
  );
}
