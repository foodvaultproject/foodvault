"use server";

import { getAuthSession } from "@/lib/auth";
import { getActiveMemberView } from "@/lib/member/active-member";
import { getMemberProfile } from "@/lib/member/queries";

export type MembershipPassViewer = {
  isLoggedIn: boolean;
  isActiveMember: boolean;
  fullName: string;
  initials: string;
};

function initialsFromName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function getMembershipPassViewerAction(): Promise<MembershipPassViewer> {
  const session = await getAuthSession();
  if (!session || session.accountType === "partner") {
    return {
      isLoggedIn: Boolean(session),
      isActiveMember: false,
      fullName: "",
      initials: "M",
    };
  }

  const [profile, membership] = await Promise.all([
    getMemberProfile(session.id),
    getActiveMemberView(),
  ]);

  const fullName = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || "FoodVault Member";

  return {
    isLoggedIn: true,
    isActiveMember: membership.isActiveMember,
    fullName,
    initials: initialsFromName(fullName),
  };
}
