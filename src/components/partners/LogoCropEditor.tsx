"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  DEFAULT_LOGO_CROP,
  getCroppedLogoBlob,
  type LogoCropSettings,
} from "@/lib/partner-logo-crop";

type LogoCropEditorProps = {
  imageSrc: string;
  initialCrop?: LogoCropSettings;
  onCancel: () => void;
  onSave: (result: {
    croppedBlob: Blob;
    previewUrl: string;
    crop: LogoCropSettings;
  }) => void;
};

export function LogoCropEditor({
  imageSrc,
  initialCrop = DEFAULT_LOGO_CROP,
  onCancel,
  onSave,
}: LogoCropEditorProps) {
  const [crop, setCrop] = useState({ x: initialCrop.x, y: initialCrop.y });
  const [zoom, setZoom] = useState(initialCrop.zoom);
  const [croppedAreaPercentages, setCroppedAreaPercentages] = useState<Area | null>(
    initialCrop.areaPercent ?? null
  );
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((area: Area, pixels: Area) => {
    setCroppedAreaPercentages(area);
    setCroppedAreaPixels(pixels);
  }, []);

  function handleReset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPercentages(null);
  }

  async function handleSave() {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const croppedBlob = await getCroppedLogoBlob(
        imageSrc,
        croppedAreaPixels,
        0,
        croppedAreaPercentages ?? undefined
      );
      const previewUrl = URL.createObjectURL(croppedBlob);
      onSave({
        croppedBlob,
        previewUrl,
        crop: {
          zoom,
          x: crop.x,
          y: crop.y,
          ...(croppedAreaPercentages ? { areaPercent: croppedAreaPercentages } : {}),
        },
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-crop-title"
    >
      <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 id="logo-crop-title" className="text-lg font-bold text-foreground">
            Adjust Your Logo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Move and zoom your logo until it fits nicely inside the circular frame. This
            version will be displayed throughout FoodVault.
          </p>
        </div>

        <div className="relative h-72 bg-[#111827] sm:h-80">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            roundCropAreaPixels
            initialCroppedAreaPercentages={initialCrop.areaPercent}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="space-y-4 border-b border-border px-5 py-4 sm:px-6">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-primary"
            aria-label="Logo zoom"
          />
          <p className="text-xs text-muted-foreground">
            Drag the image to reposition. Use the slider or mouse wheel to zoom.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:opacity-60"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !croppedAreaPixels}
            className="fv-btn-primary inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-[transform,box-shadow] duration-150 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Logo"}
          </button>
        </div>
      </div>
    </div>
  );
}
