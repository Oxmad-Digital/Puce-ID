import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { T } from "@/components/layout/lang-toggle";

/** Pages dépendantes de la session / de la base : navigation bloquante assumée (streaming via loading.tsx). */
export const instant = false;

export default function ChipLayout({ children }: LayoutProps<"/puce/[numero]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-brand-700">
        <ArrowLeft className="size-3.5" /> <T fr="Retour à la recherche" mg="Hiverina amin'ny fikarohana" />
      </Link>
      {children}
    </div>
  );
}
