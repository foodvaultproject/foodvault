import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseDeviceType } from "@/lib/affiliate/links";
import { FV_REF_COOKIE } from "@/lib/store-integration/config";
import { getRequestIp, hashClientIp } from "@/lib/audit-service";

type RouteContext = {
  params: Promise<{ brandSlug: string; affiliateCode: string }>;
};

type ClickResult = {
  website_url?: string | null;
  redirect_url?: string | null;
  session_token?: string | null;
  cookie_duration_days?: number | null;
  rate_limited?: boolean;
};

function resolveRedirectUrl(result: ClickResult): string | null {
  const redirectUrl = result.redirect_url?.trim();
  if (redirectUrl) return redirectUrl;

  const websiteUrl = result.website_url?.trim();
  if (!websiteUrl) return null;

  const sessionToken = result.session_token?.trim();
  if (!sessionToken) return websiteUrl;

  const separator = websiteUrl.includes("?") ? "&" : "?";
  return `${websiteUrl}${separator}fv_ref=${sessionToken}`;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { brandSlug, affiliateCode } = await context.params;
  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");
  const device = parseDeviceType(userAgent);

  const ipHash = hashClientIp(getRequestIp(request));

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_affiliate_click", {
    p_brand_slug: brandSlug,
    p_affiliate_code: affiliateCode,
    p_device: device,
    p_referrer: referrer,
    p_user_agent: userAgent,
    p_ip_hash: ipHash,
  });

  if (error || !data) {
    return NextResponse.redirect(new URL("/browse-brands", request.url));
  }

  const result = data as ClickResult;

  if (result.rate_limited) {
    return NextResponse.redirect(new URL("/browse-brands", request.url));
  }
  const destination = resolveRedirectUrl(result);

  if (!destination) {
    return NextResponse.redirect(new URL("/browse-brands", request.url));
  }

  try {
    const redirectTarget = destination.startsWith("http")
      ? destination
      : `https://${destination}`;

    const response = NextResponse.redirect(redirectTarget, { status: 302 });

    if (result.session_token) {
      const maxAge = Math.max(1, Number(result.cookie_duration_days ?? 30)) * 24 * 60 * 60;
      response.cookies.set(FV_REF_COOKIE, result.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.redirect(new URL("/browse-brands", request.url));
  }
}
