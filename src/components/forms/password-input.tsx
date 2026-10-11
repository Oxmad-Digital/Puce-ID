"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function PasswordInput(props: ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("field-input pr-20", props.className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-600 hover:text-brand-800"
      >
        {visible ? "Masquer" : "Afficher"}
      </button>
    </div>
  );
}
