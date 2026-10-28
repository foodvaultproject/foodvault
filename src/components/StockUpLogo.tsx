type StockUpLogoSize = "nav" | "footer";

const SIZE_CLASSES: Record<StockUpLogoSize, string> = {
  nav: "text-[1.35rem] leading-none sm:text-[1.5rem]",
  footer: "text-[1.65rem] leading-none",
};

export function StockUpLogo({
  size = "nav",
  className = "",
}: {
  size?: StockUpLogoSize;
  className?: string;
}) {
  return (
    <span
      className={`inline-block font-bold tracking-tight text-white ${SIZE_CLASSES[size]}${
        className ? ` ${className}` : ""
      }`}
    >
      StockUp
    </span>
  );
}
