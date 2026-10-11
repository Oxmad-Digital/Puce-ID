import Link from "next/link";
import type { Animal } from "@/lib/db/schema";
import { formatChip, formatDate } from "@/lib/utils";
import { Avatar, StatusBadge } from "@/components/ui";

/** Tableau d'animaux (desktop) / liste compacte (mobile), commun propriétaire & vétérinaire. */
export function AnimalTable({ animals, ownerColumn = true }: { animals: Animal[]; ownerColumn?: boolean }) {
  return (
    <>
      <table className="hidden w-full text-left text-sm md:table">
        <thead>
          <tr className="border-b border-line text-[11px] font-medium text-muted">
            <th className="px-5 py-2.5 font-medium">Animal</th>
            <th className="px-3 py-2.5 font-medium">N° de puce</th>
            <th className="px-3 py-2.5 font-medium">Espèce</th>
            {ownerColumn && <th className="px-3 py-2.5 font-medium">Propriétaire</th>}
            <th className="px-3 py-2.5 font-medium">Enregistré le</th>
            <th className="px-5 py-2.5 font-medium">Statut</th>
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
              <td className="px-3 py-3 text-muted">{a.species}</td>
              {ownerColumn && <td className="px-3 py-3 text-muted">{a.ownerName}</td>}
              <td className="px-3 py-3 text-muted">{formatDate(a.createdAt)}</td>
              <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {animals.map((a) => (
          <li key={a.id}>
            <Link href={`/animaux/${a.id}`} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={a.name} size="sm" src={a.photoKey ? `/api/files/${a.photoKey}` : null} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{a.name}</p>
                <p className="truncate font-mono text-[11px] text-muted">{formatChip(a.chipNumber)}</p>
              </div>
              <StatusBadge status={a.status} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
