import type { AnimalStatus } from "@/lib/db/schema";

export type AnimalFilters = {
  q?: string;
  status?: AnimalStatus;
  species?: string;
  sex?: "male" | "female" | "unknown";
  /** Ville du propriétaire. */
  city?: string;
  /** Clinique responsable ("none" = sans clinique). */
  clinicId?: string;
  /** Période d'enregistrement (AAAA-MM-JJ). */
  from?: string;
  to?: string;
};

type SearchParams = Record<string, string | string[] | undefined>;

const STATUSES = ["alive", "lost", "found", "deceased"] as const;
const SEXES = ["male", "female", "unknown"] as const;
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

/** Lit les filtres de liste d'animaux depuis l'URL (paramètres en français). */
export function parseAnimalFilters(sp: SearchParams): AnimalFilters {
  const get = (key: string) => {
    const v = sp[key];
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };
  const status = get("statut");
  const sex = get("sexe");
  const clinic = get("clinique");
  const from = get("du");
  const to = get("au");
  return {
    q: get("q"),
    status: STATUSES.find((s) => s === status),
    species: get("espece"),
    sex: SEXES.find((s) => s === sex),
    city: get("ville"),
    clinicId: clinic && (clinic === "none" || isUuid(clinic)) ? clinic : undefined,
    from: from && isDate(from) ? from : undefined,
    to: to && isDate(to) ? to : undefined,
  };
}

/** Filtres avancés actifs (hors recherche texte et statut). */
export function advancedFilterCount(f: AnimalFilters) {
  return [f.species, f.sex, f.city, f.clinicId, f.from, f.to].filter(Boolean).length;
}

export function hasFilters(f: AnimalFilters) {
  return Boolean(f.q || f.status) || advancedFilterCount(f) > 0;
}
