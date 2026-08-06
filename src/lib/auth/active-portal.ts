import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export const ACTIVE_PORTAL_COOKIE = "fv-active-portal";

export type ActivePortal = "member" | "partner";

export function parseActivePortal(value: string | undefined): ActivePortal | null {
  return value === "member" || value === "partner" ? value : null;
}

export function readActivePortalClient(): ActivePortal | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${ACTIVE_PORTAL_COOKIE}=([^;]*)`)
  );
  return parseActivePortal(match?.[1]);
}

export function setActivePortalClient(portal: ActivePortal) {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${ACTIVE_PORTAL_COOKIE}=${portal}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function readActivePortalFromCookies(
  cookieStore: Pick<ReadonlyRequestCookies, "get">
): ActivePortal | null {
  return parseActivePortal(cookieStore.get(ACTIVE_PORTAL_COOKIE)?.value);
}

export function setActivePortalCookie(
  cookieStore: Pick<ReadonlyRequestCookies, "set">,
  portal: ActivePortal
) {
  cookieStore.set(ACTIVE_PORTAL_COOKIE, portal, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
