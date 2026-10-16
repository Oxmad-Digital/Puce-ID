import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import { ANIMAL_STATUS, type Tone } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import type { AnimalStatus } from "@/lib/db/schema";

/* --------------------------------- Button --------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dangerSoft" | "white";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secondary: "bg-white text-ink border border-line hover:bg-surface",
  ghost: "text-brand-700 hover:bg-brand-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  dangerSoft: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  white: "bg-white text-brand-700 hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/* ---------------------------------- Badge --------------------------------- */

const tones: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  red: "bg-red-50 text-red-600 ring-red-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  gray: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
};

export function Badge({
  tone = "gray",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: AnimalStatus }) {
  const s = ANIMAL_STATUS[status];
  return (
    <Badge tone={s.tone}>
      <T {...s.label} />
    </Badge>
  );
}

/* --------------------------------- Avatar --------------------------------- */

export function Avatar({
  name,
  size = "md",
  tone = "brand",
  src,
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "brand" | "accent";
  src?: string | null;
}) {
  const dims = { sm: "size-7 text-[11px]", md: "size-9 text-xs", lg: "size-12 text-base", xl: "size-16 text-xl" }[size];
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn(dims, "shrink-0 rounded-full object-cover")} />;
  }
  return (
    <span
      className={cn(
        dims,
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        tone === "brand" ? "bg-brand-100 text-brand-700" : "bg-accent-500 text-white",
      )}
    >
      {initials(name)}
    </span>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("card", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  hintTone = "green",
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  hintTone?: "green" | "red" | "muted";
}) {
  return (
    <Card className="p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            hintTone === "green" && "text-emerald-600",
            hintTone === "red" && "text-red-500",
            hintTone === "muted" && "text-muted",
          )}
        >
          {hint}
        </p>
      )}
    </Card>
  );
}

/* ------------------------------- Page header ------------------------------ */

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: { label: ReactNode; href?: string }[];
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumb && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {b.href ? (
                  <Link href={b.href} className="hover:text-brand-700">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-ink">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {title && <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>}
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------------------------- Field --------------------------------- */

export function Field({
  label,
  hint,
  required,
  children,
  className,
  error,
}: {
  label: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="field-label">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint && <p className="field-hint">{hint}</p>}
    </label>
  );
}

export { Input, Option, Select, Textarea } from "./fields";

/* ------------------------------ Misc helpers ------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Alert({
  tone = "brand",
  children,
  className,
}: {
  tone?: "brand" | "red" | "green" | "amber";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3.5 py-3 text-xs leading-relaxed",
        tone === "brand" && "border-brand-100 bg-brand-50 text-brand-800",
        tone === "red" && "border-red-100 bg-red-50 text-red-700",
        tone === "green" && "border-emerald-100 bg-emerald-50 text-emerald-800",
        tone === "amber" && "border-amber-100 bg-amber-50 text-amber-800",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-brand-100/50", className)} />;
}

export function InfoItem({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}
