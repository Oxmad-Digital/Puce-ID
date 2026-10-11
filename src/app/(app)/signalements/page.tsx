import Link from "next/link";
import { MapPin } from "lucide-react";
import { resolveReport } from "@/lib/actions/animals";
import { listReportsFor } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import { REPORT_TYPE } from "@/lib/labels";
import { formatChip, formatDate } from "@/lib/utils";
import { Badge, Button, ButtonLink, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { Modal } from "@/components/modal";
import { LostFoundForm } from "@/components/forms/lost-found-form";
import { VetFoundForm } from "@/components/app/vet-found-form";

export const metadata = { title: "Perdu / Trouvé" };

export default async function ReportsPage() {
  const user = await requireUser();
  const reports = await listReportsFor(user);
  const open = reports.filter((r) => r.status === "open");
  const closed = reports.filter((r) => r.status !== "open");
  const verifiedVet = user.role === "vet" && user.vet?.status === "verified";

  return (
    <>
      <PageHeader
        title="Perdu / Trouvé"
        description="Signalements concernant vos animaux ou que vous avez émis."
        actions={
          <>
            <ButtonLink href="/perdu-trouve" variant="secondary">Annonces publiques</ButtonLink>
            {verifiedVet ? (
              <Modal trigger="Déclarer trouvé" title="Animal recueilli à la clinique" description="Le propriétaire est prévenu par e-mail." variant="primary">
                <VetFoundForm />
              </Modal>
            ) : (
              <Modal trigger="Nouveau signalement" title="Signaler un animal" variant="primary">
                <LostFoundForm defaultName={user.name} defaultContact={user.phone ?? user.email} />
              </Modal>
            )}
          </>
        }
      />

      <Card className="mb-6">
        <CardHeader title={`En cours (${open.length})`} />
        {open.length === 0 ? (
          <EmptyState icon={<MapPin className="size-5" />} title="Aucun signalement en cours" />
        ) : (
          <ul className="divide-y divide-line">
            {open.map((r) => (
              <ReportRow key={r.id} report={r} canResolve />
            ))}
          </ul>
        )}
      </Card>

      {closed.length > 0 && (
        <Card>
          <CardHeader title="Clôturés" />
          <ul className="divide-y divide-line">
            {closed.map((r) => (
              <ReportRow key={r.id} report={r} />
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

function ReportRow({
  report: r,
  canResolve,
}: {
  report: Awaited<ReturnType<typeof listReportsFor>>[number];
  canResolve?: boolean;
}) {
  const t = REPORT_TYPE[r.type];
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <Badge tone={t.tone} className="self-start sm:self-center">{t.label}</Badge>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          {r.animal ? <Link href={`/animaux/${r.animal.id}`} className="hover:text-brand-700">{r.animal.name}</Link> : (r.species ?? "Animal non identifié")}
          {r.chipNumber && <span className="ml-2 font-mono text-xs font-normal text-muted">{formatChip(r.chipNumber)}</span>}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
          {[r.location, formatDate(r.occurredAt ?? r.createdAt), r.reporterName].filter(Boolean).join(" · ")}
          {r.description && ` — ${r.description}`}
        </p>
      </div>
      {canResolve && (
        <div className="flex gap-2">
          <form action={resolveReport.bind(null, r.id, true)}><Button variant="ghost" size="sm">Ignorer</Button></form>
          <form action={resolveReport.bind(null, r.id, false)}><Button variant="secondary" size="sm">Marquer résolu</Button></form>
        </div>
      )}
    </li>
  );
}
