"use client";

import { formatAge, formatDate, formatDateTime, formatRelative, formatShortDate } from "@/lib/utils";
import { useLang } from "@/components/layout/lang-toggle";

type DateValue = string | Date | null | undefined;

/** Dates affichées dans la langue choisie (FR / MG). */
export function FmtDate({ value }: { value: DateValue }) {
  return formatDate(value, useLang());
}

export function FmtShortDate({ value }: { value: DateValue }) {
  return formatShortDate(value, useLang());
}

export function FmtDateTime({ value }: { value: DateValue }) {
  return formatDateTime(value, useLang());
}

export function FmtRelative({ value, now }: { value: string | Date; now: Date }) {
  return formatRelative(value, now, useLang());
}

export function FmtAge({ birth, now }: { birth: string | null | undefined; now: Date }) {
  return formatAge(birth, now, useLang());
}
