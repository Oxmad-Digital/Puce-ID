import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Chemin de l'app qui redirige vers le fichier R2 (utilisable dans <img src>). */
export function fileHref(key: string | null | undefined) {
  return key ? `/api/files/${key}` : null;
}

/** Ne garde que les chiffres d'un numéro de puce saisi. */
export function normalizeChip(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidChip(value: string) {
  return /^\d{15}$/.test(normalizeChip(value));
}

/** 450200000123456 → "450 200 000 123 456" */
export function formatChip(value: string) {
  return normalizeChip(value).replace(/(\d{3})(?=\d)/g, "$1 ");
}

/** Masque partiel pour l'affichage public : 450 200 000 ••• 456 */
export function maskChip(value: string) {
  const d = normalizeChip(value);
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ••• ${d.slice(12)}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const shortFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function toDate(value: string | Date) {
  return typeof value === "string" ? new Date(value) : value;
}

export function formatDate(value: string | Date | null | undefined) {
  return value ? dateFmt.format(toDate(value)) : "—";
}

export function formatShortDate(value: string | Date | null | undefined) {
  return value ? shortFmt.format(toDate(value)) : "—";
}

export function formatDateTime(value: string | Date | null | undefined) {
  return value ? dateTimeFmt.format(toDate(value)) : "—";
}

/** "il y a 2 h", "hier", "14 août" — `now` est passé pour rester déterministe au rendu. */
export function formatRelative(value: string | Date, now: Date) {
  const d = toDate(value);
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return "hier";
  if (diff < 7 * 86400) return `il y a ${Math.floor(diff / 86400)} j`;
  return formatShortDate(d);
}

/** Âge lisible à partir d'une date de naissance. */
export function formatAge(birth: string | null | undefined, now: Date) {
  if (!birth) return null;
  const b = new Date(birth);
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 12) return `${Math.max(months, 0)} mois`;
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? "s" : ""}`;
}
