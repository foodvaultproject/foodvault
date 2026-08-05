"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";

type TurnstileFieldProps = {
  onTokenChange: (token: string | null) => void;
  className?: string;
};

export function TurnstileField({ onTokenChange, className = "" }: TurnstileFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widgetRef = useRef<TurnstileInstance>(null);

  if (!siteKey) {
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        ref={widgetRef}
        siteKey={siteKey}
        onSuccess={(token) => onTokenChange(token)}
        onExpire={() => {
          onTokenChange(null);
          widgetRef.current?.reset();
        }}
        onError={() => {
          onTokenChange(null);
        }}
        options={{ theme: "light", size: "flexible" }}
      />
    </div>
  );
}

export function isTurnstileEnabledClient() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
