"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { pick, useLang, type Bi } from "@/components/layout/lang-toggle";

/** `placeholder` accepte un texte bilingue { fr, mg }. */
type WithPlaceholder<P> = Omit<P, "placeholder"> & { placeholder?: string | Bi };

export function Input({ placeholder, ...props }: WithPlaceholder<ComponentProps<"input">>) {
  const lang = useLang();
  return (
    <input
      {...props}
      placeholder={placeholder && pick(placeholder, lang)}
      className={cn("field-input", props.className)}
    />
  );
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cn("field-input pr-8", props.className)} />;
}

/** <option> bilingue, utilisable depuis un composant serveur. */
export function Option({ fr, mg, ...props }: Omit<ComponentProps<"option">, "children"> & Bi) {
  return <option {...props}>{pick({ fr, mg }, useLang())}</option>;
}

export function Textarea({ placeholder, ...props }: WithPlaceholder<ComponentProps<"textarea">>) {
  const lang = useLang();
  return (
    <textarea
      rows={4}
      {...props}
      placeholder={placeholder && pick(placeholder, lang)}
      className={cn("field-input resize-y", props.className)}
    />
  );
}
