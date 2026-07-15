type ScatterKind =
  | "apple"
  | "bottle"
  | "cup"
  | "blender"
  | "utensils"
  | "bread"
  | "fridge"
  | "pan"
  | "glass"
  | "bag";

type ScatterIcon = {
  id: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  opacity: number;
  kind: ScatterKind;
};

const SCATTER_ICONS: ScatterIcon[] = [
  { id: "a1", x: 2, y: 4, size: 56, rotate: -12, opacity: 0.16, kind: "apple" },
  { id: "a2", x: 14, y: 18, size: 44, rotate: 8, opacity: 0.12, kind: "cup" },
  { id: "a3", x: 28, y: 6, size: 52, rotate: 15, opacity: 0.14, kind: "bottle" },
  { id: "a4", x: 42, y: 22, size: 48, rotate: -6, opacity: 0.11, kind: "utensils" },
  { id: "a5", x: 58, y: 8, size: 60, rotate: 10, opacity: 0.13, kind: "blender" },
  { id: "a6", x: 72, y: 16, size: 40, rotate: -18, opacity: 0.12, kind: "bread" },
  { id: "a7", x: 88, y: 4, size: 64, rotate: 4, opacity: 0.1, kind: "fridge" },
  { id: "a8", x: 96, y: 28, size: 48, rotate: 22, opacity: 0.13, kind: "pan" },
  { id: "a9", x: 6, y: 38, size: 44, rotate: -10, opacity: 0.15, kind: "glass" },
  { id: "a10", x: 22, y: 48, size: 52, rotate: 6, opacity: 0.11, kind: "bag" },
  { id: "a11", x: 38, y: 42, size: 36, rotate: -14, opacity: 0.1, kind: "apple" },
  { id: "a12", x: 52, y: 52, size: 40, rotate: 12, opacity: 0.12, kind: "cup" },
  { id: "a13", x: 66, y: 44, size: 44, rotate: -8, opacity: 0.11, kind: "bottle" },
  { id: "a14", x: 80, y: 54, size: 48, rotate: 16, opacity: 0.12, kind: "utensils" },
  { id: "a15", x: 92, y: 46, size: 56, rotate: -4, opacity: 0.13, kind: "pan" },
  { id: "a16", x: 4, y: 62, size: 52, rotate: -20, opacity: 0.11, kind: "blender" },
  { id: "a17", x: 18, y: 72, size: 44, rotate: 14, opacity: 0.12, kind: "bread" },
  { id: "a18", x: 32, y: 68, size: 60, rotate: -6, opacity: 0.1, kind: "fridge" },
  { id: "a19", x: 48, y: 78, size: 48, rotate: 18, opacity: 0.13, kind: "glass" },
  { id: "a20", x: 62, y: 66, size: 40, rotate: -12, opacity: 0.11, kind: "bag" },
  { id: "a21", x: 76, y: 74, size: 52, rotate: 8, opacity: 0.12, kind: "apple" },
  { id: "a22", x: 90, y: 68, size: 44, rotate: -16, opacity: 0.1, kind: "cup" },
  { id: "a23", x: 10, y: 88, size: 48, rotate: 6, opacity: 0.11, kind: "bottle" },
  { id: "a24", x: 26, y: 92, size: 56, rotate: -8, opacity: 0.12, kind: "utensils" },
  { id: "a25", x: 44, y: 90, size: 40, rotate: 20, opacity: 0.1, kind: "pan" },
  { id: "a26", x: 60, y: 86, size: 52, rotate: -14, opacity: 0.11, kind: "blender" },
  { id: "a27", x: 78, y: 90, size: 44, rotate: 10, opacity: 0.12, kind: "bread" },
  { id: "a28", x: 94, y: 84, size: 48, rotate: -6, opacity: 0.1, kind: "fridge" },
  { id: "a29", x: 50, y: 32, size: 36, rotate: 24, opacity: 0.09, kind: "glass" },
  { id: "a30", x: 34, y: 58, size: 44, rotate: -22, opacity: 0.1, kind: "bag" },
  { id: "a31", x: 70, y: 30, size: 40, rotate: 12, opacity: 0.11, kind: "apple" },
  { id: "a32", x: 16, y: 56, size: 52, rotate: -10, opacity: 0.1, kind: "cup" },
  { id: "a33", x: 86, y: 58, size: 36, rotate: 16, opacity: 0.09, kind: "bottle" },
  { id: "a34", x: 54, y: 14, size: 44, rotate: -18, opacity: 0.11, kind: "utensils" },
  { id: "a35", x: 2, y: 26, size: 40, rotate: 8, opacity: 0.1, kind: "pan" },
];

function ScatterIconSvg({ kind, size }: { kind: ScatterKind; size: number }) {
  const stroke = "rgba(255,255,255,0.95)";
  const sw = 1.6;

  if (kind === "apple") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 4c1.5-2 4-2.5 5-1.5-.5 1.5-1.5 2.5-3 3"
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M12 6.5c-3.5 0-6 3-6 6.5s2.5 6.5 6 6.5 6-3 6-6.5-2.5-6.5-6-6.5z"
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
        />
      </svg>
    );
  }

  if (kind === "bottle") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M10 3h4v3l2 4v10H8V10l2-4V3z"
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
          strokeLinejoin="round"
        />
        <path d="M8 14h8" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "cup") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h10v8a4 4 0 01-8 0V8z" stroke={stroke} strokeWidth={sw} fill="none" />
        <path
          d="M15 10h2a2 2 0 010 4h-2"
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
        />
        <path d="M7 20h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "blender") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="3" width="8" height="5" rx="1" stroke={stroke} strokeWidth={sw} fill="none" />
        <path d="M9 8h6v10a3 3 0 01-6 0V8z" stroke={stroke} strokeWidth={sw} fill="none" />
        <path d="M7 21h10" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "utensils") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4v8a2 2 0 004 0V4M8 12v8" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <path
          d="M16 4v16M14 4c0 2 1.5 3 2 4 1.5 1 2 2 2 4"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }

  if (kind === "bread") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 14c0-4 3.5-7 8-7s8 3 8 7-3.5 5-8 5-8-1-8-5z" stroke={stroke} strokeWidth={sw} fill="none" />
        <path d="M8 12h.01M12 11h.01M16 12h.01" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "fridge") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="3" width="12" height="18" rx="1.5" stroke={stroke} strokeWidth={sw} fill="none" />
        <path d="M6 11h12M9 7v2M9 14v3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "pan") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="13" r="6" stroke={stroke} strokeWidth={sw} fill="none" />
        <path d="M16 13h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "glass") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M8 4h8l-2 14H10L8 4z"
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
          strokeLinejoin="round"
        />
        <path d="M9 10h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 8h10l-1 10H8L7 8z"
        stroke={stroke}
        strokeWidth={sw}
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 016 0v2" stroke={stroke} strokeWidth={sw} fill="none" />
    </svg>
  );
}

export function PartnerBenefitsScatterIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {SCATTER_ICONS.map((icon) => (
        <div
          key={icon.id}
          className="absolute"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            transform: `rotate(${icon.rotate}deg)`,
            opacity: icon.opacity,
          }}
        >
          <ScatterIconSvg kind={icon.kind} size={icon.size} />
        </div>
      ))}
    </div>
  );
}
