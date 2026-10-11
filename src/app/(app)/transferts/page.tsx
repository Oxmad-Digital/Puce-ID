import Link from "next/link";
import { ArrowLeftRight, ArrowRight } from "lucide-react";
import { cancelTransfer, respondTransfer } from "@/lib/actions/animals";
import { listTransfers } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import { TRANSFER_STATUS } from "@/lib/labels";
import { formatChip, formatDate } from "@/lib/utils";
import { Badge, Button, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Transferts" };

export default async function TransfersPage() {
  const user = await requireUser();
  const transfers = await listTransfers(user);
  const incoming = transfers.filter((t) => t.status === "pending" && (t.toUserId === user.id || t.toEmail === user.email));
  const others = transfers.filter((t) => !incoming.includes(t));

  return (
    <>
      <PageHeader
        title="Transferts"
        description="Changements de propriétaire : un transfert n'est effectif qu'après acceptation du nouveau propriétaire."
      />

      {incoming.length > 0 && (
        <Card className="mb-6 border-brand-200">
          <CardHeader title="À accepter" description="Ces animaux vous sont proposés" />
          <ul className="divide-y divide-line">
            {incoming.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{t.animal.name} <span className="font-normal text-muted">· {t.animal.species}</span></p>
                  <p className="text-xs text-muted">Proposé par {t.fromName} · puce {formatChip(t.animal.chipNumber)} · expire le {formatDate(t.expiresAt)}</p>
                  {t.reason && <p className="mt-1 text-xs text-muted">Motif : {t.reason}</p>}
                </div>
                <div className="flex gap-2">
                  <form action={respondTransfer.bind(null, t.id, false)}><Button variant="secondary" size="sm">Refuser</Button></form>
                  <form action={respondTransfer.bind(null, t.id, true)}><Button size="sm">Accepter</Button></form>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader title="Historique des transferts" />
        {others.length === 0 ? (
          <EmptyState
            icon={<ArrowLeftRight className="size-5" />}
            title="Aucun transfert"
            description="Pour céder un animal, ouvrez sa fiche puis « Transférer la propriété »."
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
                      <span>· {formatDate(t.createdAt)}</span>
                    </p>
                  </div>
                  <Badge tone={s.tone}>{s.label}</Badge>
                  {canCancel && (
                    <form action={cancelTransfer.bind(null, t.id)}><Button variant="ghost" size="sm">Annuler</Button></form>
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
