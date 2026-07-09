export function getSiteOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://foodvault.co.nz";
}

export function buildReferralUrl(linkPath: string) {
  const origin = getSiteOrigin();
  return `${origin}/go/${linkPath}`;
}

export function qrCodeImageUrl(url: string, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

export async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export async function shareReferralLink(url: string, brandName: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({
      title: `Promote ${brandName} on FoodVault`,
      text: `Shop ${brandName} through my FoodVault affiliate link.`,
      url,
    });
    return true;
  }

  return false;
}

export function parseDeviceType(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();
  if (/mobile|iphone|android/.test(ua)) return "Mobile";
  if (/ipad|tablet/.test(ua)) return "Tablet";
  return "Desktop";
}
