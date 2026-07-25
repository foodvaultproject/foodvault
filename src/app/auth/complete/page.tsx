import { Suspense } from "react";
import { AuthCompleteRedirect } from "@/components/auth/AuthCompleteRedirect";

function AuthCompleteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-page px-4">
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<AuthCompleteFallback />}>
      <AuthCompleteRedirect />
    </Suspense>
  );
}
