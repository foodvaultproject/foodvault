import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAppMode,
  requestHost,
  requestSiteOrigin,
  STOCKUP_ORIGIN,
  stockupLinkBounce,
  stockupSafePath,
} from "@/lib/app-mode";
import { ensureAuthenticatedSession } from "@/lib/auth/session-completion";
import {
  AUTH_CHECK_EMAIL_PATH,
  stockupSessionHandoffUrl,
  type AuthConfirmLinkType,
} from "@/lib/auth/email-verification";
import {
  AFFILIATE_LOGIN_PATH,
  getAccountTypeFromMetadata,
  LOGIN_PATH,
  PARTNER_LOGIN_PATH,
  RESET_PASSWORD_PATH,
} from "@/lib/auth";

function loginPathForAccount(account: string | null) {
  if (account === "partner") return PARTNER_LOGIN_PATH;
  if (account === "affiliate") return AFFILIATE_LOGIN_PATH;
  return LOGIN_PATH;
}

function isAuthConfirmLinkType(value: string | null): value is AuthConfirmLinkType {
  return value === "signup" || value === "invite" || value === "magiclink" || value === "recovery";
}

function isStockupConfirm(request: Request, brand: string | null) {
  return brand === "stockup" || getAppMode(requestHost(request)) === "stockup";
}

function confirmOrigin(request: Request, stockup: boolean) {
  return stockup ? STOCKUP_ORIGIN : requestSiteOrigin(request);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function confirmClickPage(params: {
  action: string;
  tokenHash: string;
  type: string;
  next: string;
  account: string;
  brand: string;
  handoff: string;
  stockup: boolean;
}) {
  const title = params.stockup ? "Complete StockUp sign-in" : "Complete FoodVault sign-in";
  const brandName = params.stockup ? "StockUp" : "FoodVault";
  const accent = params.stockup ? "#10B981" : "#5B21B6";
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f8fafc;color:#111827;">
    <main style="max-width:28rem;margin:12vh auto;padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${accent};">${escapeHtml(brandName)}</p>
      <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;">Confirm your email</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4b5563;">
        Click below to finish signing in. This extra step keeps email scanners from using your one-time link.
      </p>
      <form method="post" action="${escapeHtml(params.action)}">
        <input type="hidden" name="token_hash" value="${escapeHtml(params.tokenHash)}" />
        <input type="hidden" name="type" value="${escapeHtml(params.type)}" />
        <input type="hidden" name="next" value="${escapeHtml(params.next)}" />
        <input type="hidden" name="account" value="${escapeHtml(params.account)}" />
        <input type="hidden" name="brand" value="${escapeHtml(params.brand)}" />
        <input type="hidden" name="handoff" value="${escapeHtml(params.handoff)}" />
        <button type="submit" style="display:inline-block;width:100%;padding:12px 18px;border:0;border-radius:8px;background:${accent};color:#ffffff;font-size:15px;font-weight:700;cursor:pointer;">
          Click to complete sign-in
        </button>
      </form>
    </main>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function readConfirmParams(request: Request) {
  const url = new URL(request.url);
  if (request.method === "POST") {
    const form = await request.formData();
    const read = (key: string) => {
      const fromForm = form.get(key);
      return typeof fromForm === "string" && fromForm.trim()
        ? fromForm
        : url.searchParams.get(key);
    };
    return {
      tokenHash: read("token_hash"),
      type: read("type"),
      next: read("next"),
      account: read("account"),
      brand: read("brand"),
      handoff: read("handoff"),
    };
  }

  return {
    tokenHash: url.searchParams.get("token_hash"),
    type: url.searchParams.get("type"),
    next: url.searchParams.get("next"),
    account: url.searchParams.get("account"),
    brand: url.searchParams.get("brand"),
    handoff: url.searchParams.get("handoff"),
  };
}

async function completeAuthConfirm(request: Request) {
  const bounce = stockupLinkBounce(request);
  if (bounce) {
    return NextResponse.redirect(bounce);
  }

  const params = await readConfirmParams(request);
  const stockup = isStockupConfirm(request, params.brand);
  const origin = confirmOrigin(request, stockup);
  const loginPath = loginPathForAccount(params.account);
  const tokenHash = params.tokenHash;
  const type = params.type;

  if (!tokenHash || !isAuthConfirmLinkType(type)) {
    return NextResponse.redirect(`${origin}${loginPath}?error=verification_invalid`);
  }

  if (request.method !== "POST") {
    const onStockUpHost = getAppMode(requestHost(request)) === "stockup";
    const actionOrigin = stockup
      ? onStockUpHost
        ? requestSiteOrigin(request)
        : STOCKUP_ORIGIN
      : requestSiteOrigin(request);
    return confirmClickPage({
      action: `${actionOrigin}/auth/confirm`,
      tokenHash,
      type,
      next: stockup ? stockupSafePath(params.next) : (params.next ?? ""),
      account: params.account ?? "",
      brand: stockup ? "stockup" : params.brand ?? "",
      handoff: params.handoff ?? "",
      stockup,
    });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (verifyError) {
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/forgot-password?error=reset_link_invalid`);
    }

    const checkEmailUrl = new URL(`${origin}${AUTH_CHECK_EMAIL_PATH}`);
    if (params.account) {
      checkEmailUrl.searchParams.set("account", params.account);
    }
    checkEmailUrl.searchParams.set("error", "verification_failed");
    if (stockup) {
      checkEmailUrl.searchParams.set("brand", "stockup");
    }
    return NextResponse.redirect(checkEmailUrl.toString());
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(`${origin}${loginPath}?error=verification_failed`);
  }

  if (type === "recovery") {
    const resetPath =
      params.next && params.next.startsWith("/") && !params.next.startsWith("//")
        ? params.next
        : RESET_PASSWORD_PATH;

    return NextResponse.redirect(`${origin}${resetPath}`);
  }

  const resolvedAccountType = getAccountTypeFromMetadata(user.user_metadata);
  if (params.account && params.account !== resolvedAccountType) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}${loginPathForAccount(params.account)}?error=wrong_account_type`
    );
  }

  const signupMode =
    typeof user.user_metadata?.signup_mode === "string"
      ? user.user_metadata.signup_mode
      : "";
  const stockupAccount = signupMode === "stockup" || stockup;
  const landedOnStockUp = getAppMode(requestHost(request)) === "stockup";

  if (stockupAccount && !landedOnStockUp && params.handoff !== "1") {
    const handoff = await stockupSessionHandoffUrl(user.email);
    if (handoff) {
      return NextResponse.redirect(handoff);
    }
    return NextResponse.redirect(`${STOCKUP_ORIGIN}/`);
  }

  const completion = await ensureAuthenticatedSession(supabase, user, {
    expectedAccountType: resolvedAccountType,
    nextPath: stockupAccount ? stockupSafePath(params.next) : params.next,
  });
  if (completion.error) {
    const checkEmailUrl = new URL(
      `${stockupAccount ? STOCKUP_ORIGIN : origin}${AUTH_CHECK_EMAIL_PATH}`
    );
    checkEmailUrl.searchParams.set("account", resolvedAccountType);
    checkEmailUrl.searchParams.set("email", user.email);
    checkEmailUrl.searchParams.set("error", "verification_setup_failed");
    if (stockupAccount) {
      checkEmailUrl.searchParams.set("brand", "stockup");
    }
    return NextResponse.redirect(checkEmailUrl.toString());
  }

  const redirectPath = stockupAccount
    ? stockupSafePath(completion.redirectPath)
    : completion.redirectPath;
  const redirectOrigin = stockupAccount ? STOCKUP_ORIGIN : origin;
  return NextResponse.redirect(`${redirectOrigin}${redirectPath}`);
}

export async function GET(request: Request) {
  return completeAuthConfirm(request);
}

export async function POST(request: Request) {
  return completeAuthConfirm(request);
}
