"use server";

import { getRequestSupabaseSession } from "@/lib/auth/request-session";
import { getActiveMemberView } from "@/lib/member/active-member";
import { getMemberProfile } from "@/lib/member/queries";

export type MembershipPassViewer = {
  isLoggedIn: boolean;
  isActiveMember: boolean;
  fullName: string;
  initials: string;
  avatarUrl: string | null;
};

function initialsFromName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function avatarFromMetadata(metadata: Record<string, unknown> | undefined) {
  const avatarUrl = metadata?.avatar_url;
  const picture = metadata?.picture;
  if (typeof avatarUrl === "string" && avatarUrl.trim()) return avatarUrl.trim();
  if (typeof picture === "string" && picture.trim()) return picture.trim();
  return null;
}

export async function getMembershipPassViewerAction(): Promise<MembershipPassViewer> {
  const { user } = await getRequestSupabaseSession();
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const accountType = metadata.account_type;

  if (!user || accountType === "partner") {
    return {
      isLoggedIn: Boolean(user),
      isActiveMember: false,
      fullName: "",
      initials: "M",
      avatarUrl: null,
    };
  }

  const [profile, membership] = await Promise.all([
    getMemberProfile(user.id),
    getActiveMemberView(),
  ]);

  const fullName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim() ||
    "FoodVault Member";

  return {
    isLoggedIn: true,
    isActiveMember: membership.isActiveMember,
    fullName,
    initials: initialsFromName(fullName),
    avatarUrl: avatarFromMetadata(metadata),
  };
}
