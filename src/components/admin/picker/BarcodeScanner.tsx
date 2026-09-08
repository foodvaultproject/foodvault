"use client";

import { useEffect, useId, useRef, useState } from "react";
import { normalizeScanCode } from "@/lib/admin/wms-shared";

type Props = {
  onScan: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
};

export function playScanErrorSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 196;
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio can be blocked until a user gesture.
  }
}

export function playScanSuccessSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio can be blocked until a user gesture.
  }
}

export function BarcodeScanner({
  onScan,
  disabled = false,
  placeholder = "Scan or type barcode",
  autoFocus = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScan = useRef({ code: "", at: 0 });
  const [manual, setManual] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraHost = useRef<HTMLDivElement>(null);
  const cameraId = useId().replace(/:/g, "");

  function emit(raw: string) {
    const code = normalizeScanCode(raw);
    if (!code || disabled) return;
    const now = Date.now();
    if (code === lastScan.current.code && now - lastScan.current.at < 1200) return;
    lastScan.current = { code, at: now };
    onScan(code);
  }

  useEffect(() => {
    if (!autoFocus || disabled) return;
    inputRef.current?.focus();
  }, [autoFocus, disabled]);

  useEffect(() => {
    if (!cameraOn || disabled) return;
    let cancelled = false;
    let scanner: { stop: () => Promise<void> } | null = null;

    async function start() {
      setCameraError(null);
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled || !cameraHost.current) return;
        const instance = new Html5Qrcode(cameraId);
        scanner = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 240, height: 140 } },
          (decoded) => emit(decoded),
          () => undefined
        );
      } catch (error) {
        if (!cancelled) {
          setCameraError(error instanceof Error ? error.message : "Camera scanner unavailable.");
          setCameraOn(false);
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
      void scanner?.stop().catch(() => undefined);
    };
  }, [cameraOn, disabled]);

  return (
    <div className="space-y-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          emit(manual);
          setManual("");
        }}
        className="flex gap-2"
      >
        <input
          ref={inputRef}
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
          className="min-h-12 flex-1 rounded-xl border border-border bg-white px-3 text-base"
        />
        <button
          type="submit"
          disabled={disabled || !manual.trim()}
          className="rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:bg-slate-300"
        >
          Enter
        </button>
      </form>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setCameraOn((value) => !value)}
        className="text-xs font-bold text-primary"
      >
        {cameraOn ? "Close camera" : "Use camera scanner"}
      </button>
      {cameraOn ? (
        <div
          id={cameraId}
          ref={cameraHost}
          className="min-h-48 overflow-hidden rounded-xl border border-border bg-black"
        />
      ) : null}
      {cameraError ? <p className="text-xs font-medium text-red-600">{cameraError}</p> : null}
    </div>
  );
}
