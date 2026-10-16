"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ANIMAL_STATUS, SEX_LABEL, SPECIES, SPECIES_MG } from "@/lib/labels";
import { T, useLang } from "@/components/layout/lang-toggle";
import { advancedFilterCount, hasFilters, type AnimalFilters as Filters } from "@/lib/filters";
import { Input, Select } from "@/components/ui";

type Options = {
  species: string[];
  cities: string[];
  clinics: { id: string; name: string; city: string }[];
};

/** Filtres GET (recherche, statut, puis filtres avancés repliables) pour les listes d'animaux. */
export function AnimalFilters({ filters, options, basePath }: { filters: Filters; options: Options; basePath: string }) {
  const lang = useLang();
  const t = (fr: string, mg: string) => (lang === "mg" ? mg : fr);
  const advanced = advancedFilterCount(filters);
  const species = Array.from(new Set([...SPECIES, ...options.species]));

  return (
    <form className="border-b border-line p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input
            name="q"
            defaultValue={filters.q}
            placeholder={t(
              "Nom, n° de puce, propriétaire, e-mail ou téléphone…",
              "Anarana, laharan'ny puce, tompony, mailaka na telefaonina…",
            )}
            className="field-input pl-9"
          />
        </div>
        <Select name="statut" defaultValue={filters.status ?? ""} className="sm:w-44">
          <option value="">{t("Tous les statuts", "Toetra rehetra")}</option>
          {Object.entries(ANIMAL_STATUS).map(([value, s]) => (
            <option key={value} value={value}>{s.label[lang]}</option>
          ))}
        </Select>
        <button className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
          <T fr="Filtrer" mg="Sivano" />
        </button>
      </div>

      <details open={advanced > 0} className="group mt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
          <SlidersHorizontal className="size-3.5" />
          <T fr="Filtres avancés" mg="Sivana fanampiny" />
          {advanced > 0 && ` (${advanced})`}
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="field-label"><T fr="Espèce" mg="Karazana" /></span>
            <Select name="espece" defaultValue={filters.species ?? ""}>
              <option value="">{t("Toutes", "Rehetra")}</option>
              {species.map((s) => (
                <option key={s} value={s}>
                  {t(s, SPECIES_MG[s] ?? s)}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="field-label"><T fr="Sexe" mg="Lahy sa vavy" /></span>
            <Select name="sexe" defaultValue={filters.sex ?? ""}>
              <option value="">{t("Tous", "Rehetra")}</option>
              {Object.entries(SEX_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label[lang]}</option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="field-label"><T fr="Ville du propriétaire" mg="Tanànan'ny tompony" /></span>
            <Input name="ville" defaultValue={filters.city} list="filter-cities" placeholder={{ fr: "Toutes", mg: "Rehetra" }} />
            <datalist id="filter-cities">
              {options.cities.map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
          {options.clinics.length > 0 && (
            <label className="block">
              <span className="field-label"><T fr="Clinique responsable" mg="Toeram-pitsaboana tompon'andraikitra" /></span>
              <Select name="clinique" defaultValue={filters.clinicId ?? ""}>
                <option value="">{t("Toutes", "Rehetra")}</option>
                <option value="none">{t("Sans clinique", "Tsy misy toeram-pitsaboana")}</option>
                {options.clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
                ))}
              </Select>
            </label>
          )}
          <label className="block">
            <span className="field-label"><T fr="Enregistré du" mg="Voasoratra nanomboka ny" /></span>
            <Input name="du" type="date" defaultValue={filters.from} />
          </label>
          <label className="block">
            <span className="field-label"><T fr="au" mg="ka hatramin'ny" /></span>
            <Input name="au" type="date" defaultValue={filters.to} />
          </label>
        </div>
      </details>

      {hasFilters(filters) && (
        <Link href={basePath} className="mt-3 inline-flex items-center gap-1 text-xs text-muted hover:text-brand-700">
          <X className="size-3.5" /> <T fr="Effacer les filtres" mg="Fafao ny sivana" />
        </Link>
      )}
    </form>
  );
}
