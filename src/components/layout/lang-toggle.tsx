"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const LANGS = ["fr", "mg"] as const;
export type Lang = (typeof LANGS)[number];

const listeners = new Set<() => void>();

function readLang(): Lang {
  return document.cookie.match(/(?:^|; )lang=(fr|mg)/)?.[1] === "mg" ? "mg" : "fr";
}

function writeLang(next: Lang) {
  document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.lang = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Langue choisie (cookie `lang`). Rendu serveur en français, puis mis à jour côté client. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, readLang, () => "fr" as Lang);
}

/** Texte bilingue. */
export type Bi = { fr: string; mg: string };

/** Texte bilingue qui suit le sélecteur FR / MG. */
export function T({ fr, mg }: Bi) {
  return useLang() === "mg" ? mg : fr;
}

/** Bloc entier par langue (pages de texte long). */
export function ByLang({ fr, mg }: { fr: ReactNode; mg: ReactNode }) {
  return useLang() === "mg" ? mg : fr;
}

/** `t(fr, mg)` pour les attributs (placeholder, aria-label…) des composants client. */
export function useT() {
  const lang = useLang();
  return (fr: string, mg: string) => (lang === "mg" ? mg : fr);
}

/** Libellé bilingue, ou chaîne déjà traduite. */
export function pick(text: string | Bi, lang: Lang) {
  return typeof text === "string" ? text : text[lang];
}

/** Bascule FR / MG — la préférence est conservée dans un cookie `lang`. */
export function LangToggle({ inverted }: { inverted?: boolean }) {
  const router = useRouter();
  const lang = useLang();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full p-0.5 text-[11px] font-semibold",
        inverted ? "bg-white/10" : "bg-brand-50",
      )}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => {
            writeLang(l);
            router.refresh();
          }}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            lang === l
              ? "bg-brand-600 text-white"
              : inverted
                ? "text-white/70 hover:text-white"
                : "text-muted hover:text-brand-700",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
