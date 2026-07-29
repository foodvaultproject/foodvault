import {
  DEFAULT_PARTNER_OAUTH_NEXT_PATH,
  handleAuthCallback,
} from "@/lib/auth/handle-auth-callback";

export async function GET(request: Request) {
  return handleAuthCallback(request, {
    forcedAccountType: "partner",
    defaultNextPath: DEFAULT_PARTNER_OAUTH_NEXT_PATH,
  });
}
