import { Search } from "lucide-react";
import { ANIMAL_STATUS } from "@/lib/labels";
import { Select } from "@/components/ui";

/** Filtres GET (recherche + statut) pour les listes d'animaux. */
export function AnimalFilters({ q, status }: { q?: string; status?: string }) {
  return (
    <form className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
        <input name="q" defaultValue={q} placeholder="Nom, n° de puce ou propriétaire…" className="field-input pl-9" />
      </div>
      <Select name="statut" defaultValue={status ?? ""} className="sm:w-44">
        <option value="">Tous les statuts</option>
        {Object.entries(ANIMAL_STATUS).map(([value, s]) => (
          <option key={value} value={value}>{s.label}</option>
        ))}
      </Select>
      <button className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Filtrer</button>
    </form>
  );
}
