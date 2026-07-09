import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const iconDefaults: IconProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconProtein(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M6.5 6.5h11M12 3v18M8 12h8" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function IconPetFood(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M12 10c1.5-2.5 4-2 4 1.5a3.5 3.5 0 01-7 0c0-3.5 2.5-4 4-1.5z" />
      <path d="M6.5 8.5c0-1.5 1-2.5 2-2.5s2 1 2 2.5M15.5 8.5c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
      <path d="M8 17c.8 2 2.2 3 4 3s3.2-1 4-3" />
    </svg>
  );
}

export function IconCoffee(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M7 8h10v6a4 4 0 01-4 4H9a2 2 0 01-2-2V8z" />
      <path d="M17 10h1.5a2.5 2.5 0 010 5H17M8 4v2M12 4v2M16 4v2" />
    </svg>
  );
}

export function IconSnacks(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M4 14l3-6 4 3 3-5 6 8" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
    </svg>
  );
}

export function IconSupplements(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M8 12h8M12 8v8" />
      <rect x="6" y="6" width="12" height="12" rx="6" />
    </svg>
  );
}

export function IconHoney(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M8 10h8l-1 8H9l-1-8z" />
      <path d="M10 6h4l1 4H9l1-4z" />
    </svg>
  );
}

export function IconOrganic(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M12 20V10M12 10C12 6 8 4 6 4c0 4 2 6 6 6zM12 10c0-4 4-6 6-6 0 4-2 6-6 6z" />
    </svg>
  );
}

export function IconPantry(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M5 7h14v12H5z" />
      <path d="M9 7V5h6v2M9 12h6M9 16h6" />
    </svg>
  );
}

export function IconDrinks(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M8 4h8l-2 16h-4L8 4z" />
      <path d="M7 8h10" />
    </svg>
  );
}

export function IconBakery(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M6 14a6 6 0 1112 0H6z" />
      <path d="M9 8V6M12 7V5M15 8V6" />
    </svg>
  );
}

export function IconHealth(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M12 21s-6-4.5-6-10a4 4 0 017-2.5A4 4 0 0118 11c0 5.5-6 10-6 10z" />
    </svg>
  );
}

export function IconHousehold(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" />
    </svg>
  );
}

export function IconPersonalCare(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M12 3v3M8.5 8.5l-2-2M15.5 8.5l2-2M7 14h10l-1 7H8l-1-7z" />
    </svg>
  );
}

export function IconMore(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDollarSign(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

export function IconCompass(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M16 8l-2.5 6.5L8 16l2.5-6.5L16 8z" />
    </svg>
  );
}

export function IconShoppingBag(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </svg>
  );
}

export function IconTrendingUp(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M3 17l6-6 4 4 7-7" />
      <path d="M14 8h6v6" />
    </svg>
  );
}

export function IconTrendingChart(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M3 20h18" />
      <path d="M7 16l3-4 3 2 5-7" />
    </svg>
  );
}
