"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuthSession } from "@/lib/auth";
import { FavoriteHeartIcon } from "@/components/favorites/FavoriteHeartIcon";
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
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const session = await getAuthSession();
    if (!session || session.accountType === "partner") {
      router.push("/login");
      return;
    }

    setLoading(true);
    const result = await toggleFavoritePartnerAction(partnerId, favorited);
    setLoading(false);

    if ("error" in result && result.error) {
      return;
    }

    setFavorited((current) => !current);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={favorited}
      className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
    >
      <FavoriteHeartIcon favorited={favorited} />
      {favorited ? "Saved" : "Save to Favorites"}
    </button>
  );
}

export function FavoriteToggleIcon({
  partnerId,
  initialFavorited,
}: FavoriteToggleButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const session = await getAuthSession();
    if (!session || session.accountType === "partner") {
      router.push("/login");
      return;
    }

    setLoading(true);
    const result = await toggleFavoritePartnerAction(partnerId, favorited);
    setLoading(false);

    if (!("error" in result) || !result.error) {
      setFavorited((current) => !current);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={(event) => void handleToggle(event)}
      disabled={loading}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      className="rounded-full p-1 transition-transform hover:scale-110 disabled:opacity-60"
    >
      <FavoriteHeartIcon favorited={favorited} />
    </button>
  );
}
