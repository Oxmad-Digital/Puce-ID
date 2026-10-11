"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const LANGS = ["fr", "mg"] as const;
type Lang = (typeof LANGS)[number];

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

/** Bascule FR / MG — la préférence est conservée dans un cookie `lang`. */
export function LangToggle({ inverted }: { inverted?: boolean }) {
  const router = useRouter();
  const lang = useSyncExternalStore(subscribe, readLang, () => "fr" as Lang);

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
