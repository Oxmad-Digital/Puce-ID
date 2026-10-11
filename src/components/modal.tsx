"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { buttonClass } from "@/components/ui";

/** Fenêtre modale native (<dialog>) avec bouton déclencheur. */
export function Modal({
  trigger,
  title,
  description,
  children,
  variant = "secondary",
  size = "md",
  className,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: Parameters<typeof buttonClass>[0];
  size?: Parameters<typeof buttonClass>[1];
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className={buttonClass(variant, size, className)} onClick={() => ref.current?.showModal()}>
        {trigger}
      </button>
      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl p-0 shadow-2xl backdrop:bg-brand-950/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
          </div>
          <button type="button" aria-label="Fermer" onClick={() => ref.current?.close()} className="rounded-lg p-1 text-muted hover:bg-surface">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </dialog>
    </>
  );
}
