"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/layout/lang-toggle";

/** Recherche de puce (formulaire GET — fonctionne sans JavaScript). */
export function ChipSearch({
  action = "/",
  defaultValue,
  className,
  autoFocus,
}: {
  action?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const t = useT();
  return (
    <form action={action} className={cn("flex w-full gap-2", className)} role="search">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <input
          name="puce"
          inputMode="numeric"
          autoComplete="off"
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          placeholder={t("Ex. 450200000123456", "Ohatra : 450200000123456")}
          aria-label={t("Numéro de puce à 15 chiffres", "Laharan'ny puce misy isa 15")}
          className="field-input h-11 pl-9"
        />
      </div>
      <button type="submit" className="h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
        {t("Rechercher", "Hikaroka")}
      </button>
    </form>
  );
}
