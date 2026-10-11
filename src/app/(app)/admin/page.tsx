import Link from "next/link";
import { adminOverview } from "@/lib/data/queries";
import { resolveReport } from "@/lib/actions/animals";
import { reviewVet } from "@/lib/actions/vet";
import { requireRole } from "@/lib/session";
import { REPORT_TYPE } from "@/lib/labels";
import { formatChip, formatDate } from "@/lib/utils";
import { Badge, Button, Card, CardHeader, PageHeader, StatCard } from "@/components/ui";

export const metadata = { title: "Administration" };

export default async function AdminPage() {
  await requireRole("admin");
  const data = await adminOverview();

  return (
    <>
      <PageHeader title="Vue d'ensemble" description="Administration du registre Puce ID" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Animaux enregistrés" value={data.animals} hintTone="muted" hint="Total registre" />
        <StatCard label="Animaux disparus" value={data.lost} hint="Alertes actives" hintTone={data.lost ? "red" : "muted"} />
        <StatCard label="Utilisateurs" value={data.users} hint="Propriétaires et vétérinaires" hintTone="muted" />
        <StatCard label="Vétérinaires à vérifier" value={data.pendingVets.length} hint={data.pendingVets.length ? "Action requise" : "À jour"} hintTone={data.pendingVets.length ? "red" : "green"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Vétérinaires en attente" action={<Link href="/admin/veterinaires" className="text-xs font-semibold text-brand-600 hover:underline">Tous</Link>} />
          {data.pendingVets.length === 0 ? (
            <p className="px-5 py-6 text-center text-xs text-muted">Aucune demande en attente.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.pendingVets.map((v) => (
                <li key={v.userId} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">Dr {v.name} · {v.clinicName}</p>
                    <p className="text-xs text-muted">N° d&apos;ordre {v.orderNumber} · {v.city} · {v.email} · {formatDate(v.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={reviewVet.bind(null, v.userId, false)}><Button variant="ghost" size="sm">Refuser</Button></form>
                    <form action={reviewVet.bind(null, v.userId, true)}><Button size="sm">Valider</Button></form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Doublons et contestations" />
          {data.openDisputes.length === 0 ? (
            <p className="px-5 py-6 text-center text-xs text-muted">Aucun litige ouvert.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.openDisputes.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Badge tone={REPORT_TYPE[r.type].tone}>{REPORT_TYPE[r.type].label}</Badge>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {r.animal ? <Link href={`/animaux/${r.animal.id}`} className="hover:text-brand-700">{r.animal.name}</Link> : "Animal"}{" "}
                      {r.chipNumber && <span className="font-mono text-xs font-normal text-muted">{formatChip(r.chipNumber)}</span>}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted">{r.reporterName} · {r.reporterContact} — {r.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={resolveReport.bind(null, r.id, true)}><Button variant="ghost" size="sm">Rejeter</Button></form>
                    <form action={resolveReport.bind(null, r.id, false)}><Button variant="secondary" size="sm">Résolu</Button></form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
