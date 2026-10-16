import Link from "next/link";
import { MapPin } from "lucide-react";
import { resolveReport } from "@/lib/actions/animals";
import { listReportsFor } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import { REPORT_TYPE, speciesLabel } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import { FmtDate } from "@/components/dates";
import { formatChip } from "@/lib/utils";
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
        title={<T fr="Perdu / Trouvé" mg="Very / Hita" />}
        description={
          <T
            fr="Signalements concernant vos animaux ou que vous avez émis."
            mg="Filazana momba ny bibinao na izay nalefanao."
          />
        }
        actions={
          <>
            <ButtonLink href="/perdu-trouve" variant="secondary">
              <T fr="Annonces publiques" mg="Filazana ho an'ny besinimaro" />
            </ButtonLink>
            {verifiedVet ? (
              <Modal
                trigger={<T fr="Déclarer trouvé" mg="Ambarao fa hita" />}
                title={<T fr="Animal recueilli à la clinique" mg="Biby noraisina tao amin'ny toeram-pitsaboana" />}
                description={<T fr="Le propriétaire est prévenu par e-mail." mg="Ampahafantarina amin'ny mailaka ny tompony." />}
                variant="primary"
              >
                <VetFoundForm />
              </Modal>
            ) : (
              <Modal
                trigger={<T fr="Nouveau signalement" mg="Filazana vaovao" />}
                title={<T fr="Signaler un animal" mg="Hanambara biby" />}
                variant="primary"
              >
                <LostFoundForm defaultName={user.name} defaultContact={user.phone ?? user.email} />
              </Modal>
            )}
          </>
        }
      />

      <Card className="mb-6">
        <CardHeader title={<T fr={`En cours (${open.length})`} mg={`Mbola misokatra (${open.length})`} />} />
        {open.length === 0 ? (
          <EmptyState icon={<MapPin className="size-5" />} title={<T fr="Aucun signalement en cours" mg="Tsy misy filazana misokatra" />} />
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
          <CardHeader title={<T fr="Clôturés" mg="Voakatona" />} />
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
      <Badge tone={t.tone} className="self-start sm:self-center">
        <T {...t.label} />
      </Badge>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">
          {r.animal ? <Link href={`/animaux/${r.animal.id}`} className="hover:text-brand-700">{r.animal.name}</Link> : r.species ? (
            <T {...speciesLabel(r.species)} />
          ) : (
            <T fr="Animal non identifié" mg="Biby tsy fantatra" />
          )}
          {r.chipNumber && <span className="ml-2 font-mono text-xs font-normal text-muted">{formatChip(r.chipNumber)}</span>}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
          {[r.location, <FmtDate key="date" value={r.occurredAt ?? r.createdAt} />, r.reporterName]
            .filter(Boolean)
            .flatMap((part, i) => (i ? [" · ", part] : [part]))}
          {r.description && ` — ${r.description}`}
        </p>
      </div>
      {canResolve && (
        <div className="flex gap-2">
          <form action={resolveReport.bind(null, r.id, true)}>
            <Button variant="ghost" size="sm">
              <T fr="Ignorer" mg="Tsy raharahiana" />
            </Button>
          </form>
          <form action={resolveReport.bind(null, r.id, false)}>
            <Button variant="secondary" size="sm">
              <T fr="Marquer résolu" mg="Voavaha" />
            </Button>
          </form>
        </div>
      )}
    </li>
  );
}
