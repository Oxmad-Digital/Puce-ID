import Link from "next/link";
import type { ReactNode } from "react";
import type { Animal } from "@/lib/db/schema";
import { formatChip } from "@/lib/utils";
import { FmtDate } from "@/components/dates";
import { Avatar, StatusBadge } from "@/components/ui";
import { T } from "@/components/layout/lang-toggle";
import { speciesLabel } from "@/lib/labels";

/** Tableau d'animaux (desktop) / liste compacte (mobile), commun propriétaire & vétérinaire. */
export function AnimalTable({
  animals,
  ownerColumn = true,
  action,
}: {
  animals: Animal[];
  ownerColumn?: boolean;
  /** Contenu facultatif d'une colonne « Action » (hors du lien vers la fiche). */
  action?: (a: Animal) => ReactNode;
}) {
  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-line text-[11px] font-medium text-muted">
            <th className="px-5 py-2.5 font-medium"><T fr="Animal" mg="Biby" /></th>
            <th className="px-3 py-2.5 font-medium"><T fr="N° de puce" mg="Laharan'ny puce" /></th>
            <th className="px-3 py-2.5 font-medium"><T fr="Espèce" mg="Karazana" /></th>
            {ownerColumn && <th className="px-3 py-2.5 font-medium"><T fr="Propriétaire" mg="Tompony" /></th>}
            <th className="px-3 py-2.5 font-medium"><T fr="Enregistré le" mg="Daty nanoratana" /></th>
            <th className="px-5 py-2.5 font-medium"><T fr="Statut" mg="Toetra" /></th>
            {action && <th className="px-5 py-2.5 font-medium"><T fr="Action" mg="Hetsika" /></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {animals.map((a) => (
            <tr key={a.id} className="group hover:bg-surface/60">
              <td className="px-5 py-3">
                <Link href={`/animaux/${a.id}`} className="flex items-center gap-2.5 font-medium text-ink group-hover:text-brand-700">
                  <Avatar name={a.name} size="sm" src={a.photoKey ? `/api/files/${a.photoKey}` : null} />
                  {a.name}
                </Link>
              </td>
              <td className="px-3 py-3 font-mono text-xs text-muted">{formatChip(a.chipNumber)}</td>
              <td className="px-3 py-3 text-muted"><T {...speciesLabel(a.species)} /></td>
              {ownerColumn && <td className="px-3 py-3 text-muted">{a.ownerName}</td>}
              <td className="px-3 py-3 text-muted"><FmtDate value={a.createdAt} /></td>
              <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
              {action && <td className="px-5 py-3">{action(a)}</td>}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {animals.map((a) => (
          <li key={a.id} className={action ? "flex items-center gap-2 pr-4" : undefined}>
            <Link href={`/animaux/${a.id}`} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
              <Avatar name={a.name} size="sm" src={a.photoKey ? `/api/files/${a.photoKey}` : null} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{a.name}</p>
                <p className="truncate font-mono text-[11px] text-muted">{formatChip(a.chipNumber)}</p>
              </div>
              <StatusBadge status={a.status} />
            </Link>
            {action?.(a)}
          </li>
        ))}
      </ul>
    </>
  );
}
