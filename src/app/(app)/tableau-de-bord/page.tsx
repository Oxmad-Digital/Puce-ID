import { Mail, PawPrint, Plus } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { listAnimals, listMessagesFor, ownerStats } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { formatRelative } from "@/lib/utils";
import { ButtonLink, Card, CardHeader, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { AnimalTable } from "@/components/app/animal-table";

export const metadata = { title: "Tableau de bord" };

export default async function OwnerDashboard() {
  const user = await requireRole("owner", "admin");
  await connection();
  const now = new Date();
  const [stats, animals, messages] = await Promise.all([
    ownerStats(user.id),
    listAnimals(user, {}, 6),
    listMessagesFor(user.id),
  ]);

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de vos animaux enregistrés"
        actions={
          <>
            <form action="/mes-animaux" className="hidden sm:block">
              <input name="q" placeholder="Rechercher un animal, une puce…" className="field-input h-10 w-64" />
            </form>
            <ButtonLink href="/animaux/nouveau"><Plus className="size-4" /> Enregistrer un animal</ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Animaux enregistrés" value={stats.animals} hint="Dans le registre national" hintTone="muted" />
        <StatCard label="Puces actives" value={stats.activeChips} hint="Animaux vivants identifiés" hintTone="muted" />
        <StatCard label="Transferts en attente" value={stats.pendingTransfers} hint={stats.pendingTransfers ? "À confirmer" : "Aucun en cours"} hintTone={stats.pendingTransfers ? "red" : "muted"} />
        <StatCard label="Signalements ouverts" value={stats.openReports} hint={stats.openReports ? "Animal perdu ou trouvé" : "Tout va bien"} hintTone={stats.openReports ? "red" : "green"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader title="Animaux récents" action={<Link href="/mes-animaux" className="text-xs font-semibold text-brand-600 hover:underline">Voir tout</Link>} />
          {animals.length ? (
            <AnimalTable animals={animals} ownerColumn={false} />
          ) : (
            <EmptyState
              icon={<PawPrint className="size-5" />}
              title="Aucun animal pour le moment"
              description="Enregistrez votre premier animal ou demandez à votre vétérinaire de le faire lors de la pose de la puce."
              action={<ButtonLink href="/animaux/nouveau">Enregistrer un animal</ButtonLink>}
            />
          )}
        </Card>

        <Card>
          <CardHeader title="Messages reçus" description="Envoyés anonymement par des personnes ayant scanné une puce" />
          {messages.length ? (
            <ul className="divide-y divide-line">
              {messages.slice(0, 4).map((m) => (
                <li key={m.id} className="px-5 py-3">
                  <p className="text-xs font-semibold text-ink">
                    {m.senderName ?? "Anonyme"} · <span className="text-brand-700">{m.animalName}</span>
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">{m.message}</p>
                  <p className="mt-1 text-[11px] text-subtle">{formatRelative(m.createdAt, now)} · {m.senderContact}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Mail className="size-5" />} title="Aucun message" />
          )}
        </Card>
      </div>
    </>
  );
}
