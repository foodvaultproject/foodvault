"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useRef } from "react";

export type TurnstileFieldHandle = {
  /** Clears the stored token and prompts Turnstile for a fresh one. */
  reset: () => void;
};

type TurnstileFieldProps = {
  onTokenChange: (token: string | null) => void;
  className?: string;
};

export const TurnstileField = forwardRef<TurnstileFieldHandle, TurnstileFieldProps>(
  function TurnstileField({ onTokenChange, className = "" }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    const widgetRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(ref, () => ({
      reset() {
        onTokenChange(null);
        widgetRef.current?.reset();
      },
    }));

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
);

export function isTurnstileEnabledClient() {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}
