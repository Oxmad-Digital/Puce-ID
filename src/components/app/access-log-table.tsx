import Link from "next/link";
import type { listAccessLog } from "@/lib/data/queries";
import { ACCESS_ACTION } from "@/lib/labels";
import { FmtDateTime } from "@/components/dates";
import { Badge } from "@/components/ui";
import { T } from "@/components/layout/lang-toggle";

export function AccessLogTable({ rows, showActor }: { rows: Awaited<ReturnType<typeof listAccessLog>>; showActor?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] text-muted">
            <th className="px-5 py-2.5 font-medium"><T fr="Date" mg="Daty" /></th>
            {showActor && <th className="px-3 py-2.5 font-medium"><T fr="Utilisateur" mg="Mpampiasa" /></th>}
            <th className="px-3 py-2.5 font-medium"><T fr="Action" mg="Hetsika" /></th>
            <th className="px-3 py-2.5 font-medium"><T fr="Animal" mg="Biby" /></th>
            <th className="px-5 py-2.5 font-medium"><T fr="Détail" mg="Antsipiriany" /></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="whitespace-nowrap px-5 py-3 text-xs text-muted"><FmtDateTime value={r.createdAt} /></td>
              {showActor && <td className="px-3 py-3 text-xs">{r.actor?.name ?? "—"}</td>}
              <td className="px-3 py-3">
                <Badge tone={r.action === "contact_viewed" ? "amber" : "brand"}><T {...ACCESS_ACTION[r.action]} /></Badge>
              </td>
              <td className="px-3 py-3 text-xs">
                {r.animal ? <Link href={`/animaux/${r.animal.id}`} className="font-medium text-ink hover:text-brand-700">{r.animal.name}</Link> : "—"}
              </td>
              <td className="px-5 py-3 text-xs text-muted">{r.detail ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
