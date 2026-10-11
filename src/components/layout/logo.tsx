import Link from "next/link";
import { cn } from "@/lib/utils";

/** Petit drapeau de Madagascar accolé au nom. */
function Flag() {
  return (
    <svg viewBox="0 0 12 9" className="h-2.5 w-3.5 rounded-[1px] shadow-sm" aria-hidden>
      <rect width="4" height="9" fill="#fff" />
      <rect x="4" width="8" height="4.5" fill="#fc3d32" />
      <rect x="4" y="4.5" width="8" height="4.5" fill="#007e3a" />
    </svg>
  );
}

export function Logo({
  href = "/",
  variant = "brand",
  inverted,
  className,
}: {
  href?: string;
  variant?: "brand" | "accent";
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-lg text-sm font-bold text-white",
          variant === "brand" ? "bg-brand-600" : "bg-accent-500",
        )}
      >
        P
      </span>
      <span className={cn("text-[15px] font-bold tracking-tight", inverted ? "text-white" : "text-ink")}>
        Puce ID
      </span>
      <Flag />
    </Link>
  );
}
