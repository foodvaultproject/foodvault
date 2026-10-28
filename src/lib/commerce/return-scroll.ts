const RETURN_SCROLL_KEY = "stockup.return-scroll";

type ReturnScroll = {
  href: string;
  y: number;
};

export function normalizeReturnHref(href: string) {
  const url = new URL(href, "http://stockup.local");
  const entries = [...new URLSearchParams(url.search).entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const search = new URLSearchParams(entries).toString();
  return search ? `${url.pathname}?${search}` : url.pathname;
}

export function rememberReturnScroll() {
  if (typeof window === "undefined") return;
  const href = normalizeReturnHref(`${window.location.pathname}${window.location.search}`);
  const snapshot: ReturnScroll = { href, y: window.scrollY };
  sessionStorage.setItem(RETURN_SCROLL_KEY, JSON.stringify(snapshot));
}

export function readReturnScroll(): ReturnScroll | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RETURN_SCROLL_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ReturnScroll>;
    if (typeof parsed.href !== "string" || typeof parsed.y !== "number") return null;
    return { href: parsed.href, y: parsed.y };
  } catch {
    return null;
  }
}

export function clearReturnScroll() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RETURN_SCROLL_KEY);
}
