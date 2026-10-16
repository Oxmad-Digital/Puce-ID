import { Mail, PawPrint, Plus } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { listAnimals, listMessagesFor, ownerStats } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { FmtRelative } from "@/components/dates";
import { ButtonLink, Card, CardHeader, EmptyState, Input, PageHeader, StatCard } from "@/components/ui";
import { AnimalTable } from "@/components/app/animal-table";
import { T } from "@/components/layout/lang-toggle";

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
        title={<T fr="Tableau de bord" mg="Tabilao fanaraha-maso" />}
        description={<T fr="Vue d'ensemble de vos animaux enregistrés" mg="Topimaso ankapobeny ireo bibinao voasoratra" />}
        actions={
          <>
            <form action="/mes-animaux" className="hidden sm:block">
              <Input name="q" placeholder={{ fr: "Rechercher un animal, une puce…", mg: "Hikaroka biby, puce…" }} className="h-10 w-64" />
            </form>
            <ButtonLink href="/animaux/nouveau">
              <Plus className="size-4" /> <T fr="Enregistrer un animal" mg="Hanoratra biby" />
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={<T fr="Animaux enregistrés" mg="Biby voasoratra" />}
          value={stats.animals}
          hint={<T fr="Dans le registre national" mg="Ao amin'ny rejisitra nasionaly" />}
          hintTone="muted"
        />
        <StatCard
          label={<T fr="Puces actives" mg="Puce mandeha" />}
          value={stats.activeChips}
          hint={<T fr="Animaux vivants identifiés" mg="Biby velona voamarika" />}
          hintTone="muted"
        />
        <StatCard
          label={<T fr="Transferts en attente" mg="Famindrana miandry" />}
          value={stats.pendingTransfers}
          hint={
            stats.pendingTransfers ? <T fr="À confirmer" mg="Mila hamafisina" /> : <T fr="Aucun en cours" mg="Tsy misy amin'izao" />
          }
          hintTone={stats.pendingTransfers ? "red" : "muted"}
        />
        <StatCard
          label={<T fr="Signalements ouverts" mg="Filazana misokatra" />}
          value={stats.openReports}
          hint={
            stats.openReports ? (
              <T fr="Animal perdu ou trouvé" mg="Biby very na hita" />
            ) : (
              <T fr="Tout va bien" mg="Milamina ny zava-drehetra" />
            )
          }
          hintTone={stats.openReports ? "red" : "green"}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader
            title={<T fr="Animaux récents" mg="Biby vao haingana" />}
            action={
              <Link href="/mes-animaux" className="text-xs font-semibold text-brand-600 hover:underline">
                <T fr="Voir tout" mg="Hijery rehetra" />
              </Link>
            }
          />
          {animals.length ? (
            <AnimalTable animals={animals} ownerColumn={false} />
          ) : (
            <EmptyState
              icon={<PawPrint className="size-5" />}
              title={<T fr="Aucun animal pour le moment" mg="Tsy mbola misy biby" />}
              description={
                <T
                  fr="Enregistrez votre premier animal ou demandez à votre vétérinaire de le faire lors de la pose de la puce."
                  mg="Soraty ny bibinao voalohany na angataho amin'ny dokoteranao ny hanao izany rehefa mametraka ny puce izy."
                />
              }
              action={
                <ButtonLink href="/animaux/nouveau">
                  <T fr="Enregistrer un animal" mg="Hanoratra biby" />
                </ButtonLink>
              }
            />
          )}
        </Card>

        <Card>
          <CardHeader
            title={<T fr="Messages reçus" mg="Hafatra voaray" />}
            description={
              <T
                fr="Envoyés anonymement par des personnes ayant scanné une puce"
                mg="Nalefan'ireo olona nanao scan puce, tsy nampiseho anarana"
              />
            }
          />
          {messages.length ? (
            <ul className="divide-y divide-line">
              {messages.slice(0, 4).map((m) => (
                <li key={m.id} className="px-5 py-3">
                  <p className="text-xs font-semibold text-ink">
                    {m.senderName ?? <T fr="Anonyme" mg="Tsy fantatra anarana" />} · <span className="text-brand-700">{m.animalName}</span>
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">{m.message}</p>
                  <p className="mt-1 text-[11px] text-subtle"><FmtRelative value={m.createdAt} now={now} /> · {m.senderContact}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Mail className="size-5" />} title={<T fr="Aucun message" mg="Tsy misy hafatra" />} />
          )}
        </Card>
      </div>
    </>
  );
}
