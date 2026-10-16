"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { useT, type Bi } from "@/components/layout/lang-toggle";

export function PasswordInput({
  placeholder,
  ...props
}: Omit<ComponentProps<"input">, "placeholder"> & { placeholder?: Bi }) {
  const [visible, setVisible] = useState(false);
  const t = useT();
  return (
    <div className="relative">
      <input
        {...props}
        placeholder={placeholder && t(placeholder.fr, placeholder.mg)}
        type={visible ? "text" : "password"}
        className={cn("field-input pr-20", props.className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-600 hover:text-brand-800"
      >
        {visible ? t("Masquer", "Afeno") : t("Afficher", "Asehoy")}
      </button>
    </div>
  );
}
