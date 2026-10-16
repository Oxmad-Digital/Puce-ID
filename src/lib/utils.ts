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

/** Langue d'affichage des dates ("fr" par défaut). */
type Lang = "fr" | "mg";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const shortFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const dateTimeFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const MG_MONTHS = [
  "Janoary", "Febroary", "Martsa", "Aprily", "Mey", "Jona",
  "Jolay", "Aogositra", "Septambra", "Oktobra", "Novambra", "Desambra",
];

function toDate(value: string | Date) {
  return typeof value === "string" ? new Date(value) : value;
}

function mgDate(d: Date, { year = true, short = false } = {}) {
  const month = short ? MG_MONTHS[d.getMonth()].slice(0, 3) : MG_MONTHS[d.getMonth()];
  return `${d.getDate()} ${month}${year ? ` ${d.getFullYear()}` : ""}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(value: string | Date | null | undefined, lang: Lang = "fr") {
  if (!value) return "—";
  return lang === "mg" ? mgDate(toDate(value)) : dateFmt.format(toDate(value));
}

export function formatShortDate(value: string | Date | null | undefined, lang: Lang = "fr") {
  if (!value) return "—";
  return lang === "mg" ? mgDate(toDate(value), { year: false, short: true }) : shortFmt.format(toDate(value));
}

export function formatDateTime(value: string | Date | null | undefined, lang: Lang = "fr") {
  if (!value) return "—";
  const d = toDate(value);
  return lang === "mg"
    ? `${mgDate(d, { year: false, short: true })}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
    : dateTimeFmt.format(d);
}

/** "il y a 2 h", "hier", "14 août" — `now` est passé pour rester déterministe au rendu. */
export function formatRelative(value: string | Date, now: Date, lang: Lang = "fr") {
  const d = toDate(value);
  const diff = (now.getTime() - d.getTime()) / 1000;
  const mg = lang === "mg";
  if (diff < 60) return mg ? "izao vao" : "à l'instant";
  if (diff < 3600) return mg ? `${Math.floor(diff / 60)} min lasa` : `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return mg ? `${Math.floor(diff / 3600)} ora lasa` : `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return mg ? "omaly" : "hier";
  if (diff < 7 * 86400) return mg ? `${Math.floor(diff / 86400)} andro lasa` : `il y a ${Math.floor(diff / 86400)} j`;
  return formatShortDate(d, lang);
}

/** Âge lisible à partir d'une date de naissance. */
export function formatAge(birth: string | null | undefined, now: Date, lang: Lang = "fr") {
  if (!birth) return null;
  const b = new Date(birth);
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 12) return lang === "mg" ? `${Math.max(months, 0)} volana` : `${Math.max(months, 0)} mois`;
  const years = Math.floor(months / 12);
  return lang === "mg" ? `${years} taona` : `${years} an${years > 1 ? "s" : ""}`;
}
