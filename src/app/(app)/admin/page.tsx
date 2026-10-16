import Link from "next/link";
import { adminOverview } from "@/lib/data/queries";
import { resolveReport } from "@/lib/actions/animals";
import { reviewVet } from "@/lib/actions/vet";
import { requireRole } from "@/lib/session";
import { REPORT_TYPE } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import { FmtDate } from "@/components/dates";
import { formatChip } from "@/lib/utils";
import { Badge, Button, Card, CardHeader, PageHeader, StatCard } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/forms/action-form";

export const metadata = { title: "Administration" };

export default async function AdminPage() {
  await requireRole("admin");
  const data = await adminOverview();

  return (
    <>
      <PageHeader
        title={<T fr="Vue d'ensemble" mg="Topimaso ankapobeny" />}
        description={<T fr="Administration du registre Puce ID" mg="Fitantanana ny rejisitra Puce ID" />}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={<T fr="Animaux enregistrés" mg="Biby voasoratra" />}
          value={data.animals}
          hintTone="muted"
          hint={<T fr="Total registre" mg="Totalin'ny rejisitra" />}
        />
        <StatCard
          label={<T fr="Animaux disparus" mg="Biby very" />}
          value={data.lost}
          hint={<T fr="Alertes actives" mg="Fampitandremana mandeha" />}
          hintTone={data.lost ? "red" : "muted"}
        />
        <StatCard
          label={<T fr="Utilisateurs" mg="Mpampiasa" />}
          value={data.users}
          hint={<T fr="Propriétaires et vétérinaires" mg="Tompon'biby sy dokotera" />}
          hintTone="muted"
        />
        <StatCard
          label={<T fr="Vétérinaires à vérifier" mg="Dokotera hamarinina" />}
          value={data.pendingVets.length}
          hint={data.pendingVets.length ? <T fr="Action requise" mg="Mila hetsika" /> : <T fr="À jour" mg="Vaovao daholo" />}
          hintTone={data.pendingVets.length ? "red" : "green"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title={<T fr="Vétérinaires en attente" mg="Dokotera miandry" />}
            action={
              <Link href="/admin/veterinaires" className="text-xs font-semibold text-brand-600 hover:underline">
                <T fr="Tous" mg="Rehetra" />
              </Link>
            }
          />
          {data.pendingVets.length === 0 ? (
            <p className="px-5 py-6 text-center text-xs text-muted">
              <T fr="Aucune demande en attente." mg="Tsy misy fangatahana miandry." />
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {data.pendingVets.map((v) => (
                <li key={v.userId} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">Dr {v.name} · {v.clinicName}</p>
                    <p className="text-xs text-muted">
                      <T fr="N° d'ordre" mg="Laharana (Ordre)" /> {v.orderNumber} · {v.city} · {v.email} ·{" "}
                      <FmtDate value={v.createdAt} />
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ActionForm action={reviewVet.bind(null, v.userId, false)}>
                      <SubmitButton variant="ghost" size="sm">
                        <T fr="Refuser" mg="Lavina" />
                      </SubmitButton>
                    </ActionForm>
                    <ActionForm action={reviewVet.bind(null, v.userId, true)}>
                      <SubmitButton size="sm">
                        <T fr="Valider" mg="Ankatoavy" />
                      </SubmitButton>
                    </ActionForm>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title={<T fr="Doublons et contestations" mg="Mitovy roa sy fanoherana" />} />
          {data.openDisputes.length === 0 ? (
            <p className="px-5 py-6 text-center text-xs text-muted">
              <T fr="Aucun litige ouvert." mg="Tsy misy fifanolanana misokatra." />
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {data.openDisputes.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Badge tone={REPORT_TYPE[r.type].tone}>
                      <T {...REPORT_TYPE[r.type].label} />
                    </Badge>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {r.animal ? <Link href={`/animaux/${r.animal.id}`} className="hover:text-brand-700">{r.animal.name}</Link> : <T fr="Animal" mg="Biby" />}{" "}
                      {r.chipNumber && <span className="font-mono text-xs font-normal text-muted">{formatChip(r.chipNumber)}</span>}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted">{r.reporterName} · {r.reporterContact} — {r.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={resolveReport.bind(null, r.id, true)}>
                      <Button variant="ghost" size="sm">
                        <T fr="Rejeter" mg="Lavina" />
                      </Button>
                    </form>
                    <form action={resolveReport.bind(null, r.id, false)}>
                      <Button variant="secondary" size="sm">
                        <T fr="Résolu" mg="Voavaha" />
                      </Button>
                    </form>
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
