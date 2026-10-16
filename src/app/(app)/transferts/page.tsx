import Link from "next/link";
import { ArrowLeftRight, ArrowRight, Building2 } from "lucide-react";
import {
  cancelClinicTransfer,
  cancelTransfer,
  respondClinicTransfer,
  respondTransfer,
} from "@/lib/actions/animals";
import { listClinicTransfers, listTransfers } from "@/lib/data/queries";
import { connection } from "next/server";
import { requireUser } from "@/lib/session";
import { TRANSFER_STATUS, speciesLabel } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import { FmtDate } from "@/components/dates";
import { formatChip } from "@/lib/utils";
import { Badge, Button, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Transferts" };

export default async function TransfersPage() {
  const user = await requireUser();
  const [transfers, clinicTransfers] = await Promise.all([listTransfers(user), listClinicTransfers(user)]);
  await connection();
  const now = new Date();
  const incoming = transfers.filter((t) => t.status === "pending" && (t.toUserId === user.id || t.toEmail === user.email));
  const others = transfers.filter((t) => !incoming.includes(t));
  const myClinic = user.vet?.status === "verified" ? user.vet.clinicId : null;
  // Les transferts de dossier entre cliniques sont validés uniquement par l'administration.
  const incomingClinic = user.role === "admin" ? clinicTransfers.filter((t) => t.status === "pending") : [];
  const otherClinic = clinicTransfers.filter((t) => !incomingClinic.includes(t));

  return (
    <>
      <PageHeader
        title={<T fr="Transferts" mg="Famindrana" />}
        description={
          <T
            fr="Un changement de propriétaire est effectif après acceptation du nouveau propriétaire ; un transfert de dossier vers une autre clinique, après validation par l'administration."
            mg="Manan-kery ny fiovan'ny tompony rehefa neken'ny tompony vaovao ; ny famindrana antontan-taratasy any amin'ny toeram-pitsaboana hafa kosa, rehefa nankatoavin'ny mpitantana."
          />
        }
      />

      {incoming.length > 0 && (
        <Card className="mb-6 border-brand-200">
          <CardHeader
            title={<T fr="À accepter" mg="Hekena" />}
            description={<T fr="Ces animaux vous sont proposés" mg="Atolotra anao ireto biby ireto" />}
          />
          <ul className="divide-y divide-line">
            {incoming.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {t.animal.name}{" "}
                    <span className="font-normal text-muted">
                      · <T {...speciesLabel(t.animal.species)} />
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    <T fr="Proposé par" mg="Natolotr'i" /> {t.fromName} · puce {formatChip(t.animal.chipNumber)} ·{" "}
                    <T fr="expire le" mg="lany daty amin'ny" /> <FmtDate value={t.expiresAt} />
                  </p>
                  {t.reason && (
                    <p className="mt-1 text-xs text-muted">
                      <T fr="Motif" mg="Antony" /> : {t.reason}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <form action={respondTransfer.bind(null, t.id, false)}>
                    <Button variant="secondary" size="sm">
                      <T fr="Refuser" mg="Lavina" />
                    </Button>
                  </form>
                  <form action={respondTransfer.bind(null, t.id, true)}>
                    <Button size="sm">
                      <T fr="Accepter" mg="Ekeo" />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {incomingClinic.length > 0 && (
        <Card className="mb-6 border-brand-200">
          <CardHeader
            title={<T fr="Transferts de dossier à valider" mg="Famindrana antontan-taratasy hankatoavina" />}
            description={
              <T
                fr="Changements de clinique responsable en attente de validation"
                mg="Fiovana toeram-pitsaboana tompon'andraikitra miandry fankatoavana"
              />
            }
          />
          <ul className="divide-y divide-line">
            {incomingClinic.map((t) => {
              const expired = t.expiresAt < now;
              return (
                <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/animaux/${t.animal.id}`} className="text-sm font-semibold text-ink hover:text-brand-700">
                      {t.animal.name}{" "}
                      <span className="font-normal text-muted">
                        · <T {...speciesLabel(t.animal.species)} />
                      </span>
                    </Link>
                    <p className="text-xs text-muted">
                      {t.fromClinic ? (
                        <T fr={`Depuis ${t.fromClinic.name}`} mg={`Avy amin'ny ${t.fromClinic.name}`} />
                      ) : (
                        <T fr="Sans clinique jusqu'ici" mg="Tsy nisy toeram-pitsaboana hatramin'izao" />
                      )}{" "}
                      → {t.toClinic.name} · puce {formatChip(t.animal.chipNumber)} ·{" "}
                      {expired ? <T fr="expirée le" mg="lany daty tamin'ny" /> : <T fr="expire le" mg="lany daty amin'ny" />}{" "}
                      <FmtDate value={t.expiresAt} />
                    </p>
                    {t.reason && (
                      <p className="mt-1 text-xs text-muted">
                        <T fr="Motif" mg="Antony" /> : {t.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {expired && (
                      <Badge tone="gray">
                        <T fr="Expirée" mg="Lany daty" />
                      </Badge>
                    )}
                    <form action={respondClinicTransfer.bind(null, t.id, false)}>
                      <Button variant="secondary" size="sm">
                        <T fr="Refuser" mg="Lavina" />
                      </Button>
                    </form>
                    {!expired && (
                      <form action={respondClinicTransfer.bind(null, t.id, true)}>
                        <Button size="sm">
                          <T fr="Valider" mg="Ankatoavy" />
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader title={<T fr="Historique des transferts de propriété" mg="Tantaran'ny famindrana fananana" />} />
        {others.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="size-5" />}
            title={<T fr="Aucun transfert" mg="Tsy misy famindrana" />}
            description={
              <T
                fr="Pour céder un animal, ouvrez sa fiche puis « Transférer la propriété »."
                mg="Raha hanome biby, sokafy ny fiche-ny ary tsindrio ny « Hamindra ny fananana »."
              />
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {others.map((t) => {
              const s = TRANSFER_STATUS[t.status];
              const canCancel = t.status === "pending" && (t.initiatedById === user.id || t.fromUserId === user.id || user.role === "admin");
              return (
                <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Link href={`/animaux/${t.animal.id}`} className="text-sm font-semibold text-ink hover:text-brand-700">{t.animal.name}</Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      {t.fromName} <ArrowRight className="size-3" /> {t.toName}
                      <span>
                        · <FmtDate value={t.createdAt} />
                      </span>
                    </p>
                  </div>
                  <Badge tone={s.tone}>
                    <T {...s.label} />
                  </Badge>
                  {canCancel && (
                    <form action={cancelTransfer.bind(null, t.id)}>
                      <Button variant="ghost" size="sm">
                        <T fr="Annuler" mg="Hanafoana" />
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader title={<T fr="Changements de clinique" mg="Fiovana toeram-pitsaboana" />} />
        {otherClinic.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-5" />}
            title={<T fr="Aucun changement de clinique" mg="Tsy misy fiovana toeram-pitsaboana" />}
            description={
              <T
                fr="Pour confier un animal à une autre clinique, ouvrez sa fiche puis « Changer de clinique »."
                mg="Raha hametraka biby eo ambany fanaraha-mason'ny toeram-pitsaboana hafa, sokafy ny fiche-ny ary tsindrio ny « Hanova toeram-pitsaboana »."
              />
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {otherClinic.map((t) => {
              const s = TRANSFER_STATUS[t.status];
              const canCancel =
                t.status === "pending" &&
                (t.initiatedById === user.id || (myClinic !== null && t.fromClinic?.id === myClinic) || user.role === "admin");
              return (
                <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <Link href={`/animaux/${t.animal.id}`} className="text-sm font-semibold text-ink hover:text-brand-700">{t.animal.name}</Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                      {t.fromClinic?.name ?? <T fr="Sans clinique" mg="Tsy misy toeram-pitsaboana" />} <ArrowRight className="size-3" /> {t.toClinic.name}
                      <span>
                        · <FmtDate value={t.createdAt} />
                      </span>
                    </p>
                  </div>
                  <Badge tone={s.tone}>
                    <T {...s.label} />
                  </Badge>
                  {canCancel && (
                    <form action={cancelClinicTransfer.bind(null, t.id)}>
                      <Button variant="ghost" size="sm">
                        <T fr="Annuler" mg="Hanafoana" />
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}
