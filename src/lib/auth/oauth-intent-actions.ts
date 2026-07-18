"use server";

import { cookies } from "next/headers";
import { OAUTH_INTENT_COOKIE, type OAuthIntent } from "@/lib/auth/oauth-intent";

export async function storeOAuthIntentAction(intent: OAuthIntent) {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_INTENT_COOKIE, JSON.stringify(intent), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
}

export async function clearOAuthIntentCookieAction() {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_INTENT_COOKIE);
}
