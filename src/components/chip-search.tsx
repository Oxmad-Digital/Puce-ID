import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
          placeholder="Ex. 450200000123456"
          aria-label="Numéro de puce à 15 chiffres"
          className="field-input h-11 pl-9"
        />
      </div>
      <button type="submit" className="h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700">
        Rechercher
      </button>
    </form>
  );
}
