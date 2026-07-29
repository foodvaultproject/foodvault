import { handleAuthCallback } from "@/lib/auth/handle-auth-callback";

export async function GET(request: Request) {
  return handleAuthCallback(request);
}
