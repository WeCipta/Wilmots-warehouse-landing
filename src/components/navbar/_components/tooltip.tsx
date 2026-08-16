import { cn } from "@/lib/utils";

export function NavTooltip({
  label,
  side,
}: {
  label: string;
  side: "left" | "right" | "top";
}) {
  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-[60] whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-tight text-black opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 mix-blend-difference",
        side === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
        side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2",
        side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2"
      )}
    >
      {label}
    </span>
  );
}
