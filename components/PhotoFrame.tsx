import { Icon, type IconName } from "./Icons";

export function PhotoFrame({
  icon = "shield",
  variant = "navy",
  className = "",
  label,
}: {
  icon?: IconName;
  variant?: "navy" | "blue" | "light";
  className?: string;
  label?: string;
}) {
  const bg =
    variant === "navy"
      ? "bg-[radial-gradient(circle_at_30%_20%,#152c62,#0a1730_60%)]"
      : variant === "blue"
        ? "bg-[radial-gradient(circle_at_70%_30%,#3f7cff,#0a1730_65%)]"
        : "bg-[radial-gradient(circle_at_30%_20%,#dde4f4,#c5d0e8_70%)]";

  const iconColor = variant === "light" ? "text-navy-700/40" : "text-white/15";
  const ring = variant === "light" ? "ring-1 ring-inset ring-navy-900/10" : "";

  return (
    <div
      role="img"
      aria-label={label}
      className={`photo-zoom relative isolate flex items-center justify-center overflow-hidden ${bg} ${ring} ${className}`}
    >
      <div className="photo-fill absolute inset-0 opacity-40 mix-blend-overlay [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_14px)]" />
      <Icon name={icon} className={`h-[38%] w-[38%] ${iconColor}`} />
    </div>
  );
}
