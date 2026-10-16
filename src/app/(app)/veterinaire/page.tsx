import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeftRight, HeartOff, MapPin, Plus, ScanLine, Search, Upload } from "lucide-react";
import { listAccessLog, listAnimals, vetStats, vetTodo } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { ACCESS_ACTION, REPORT_TYPE, speciesLabel } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import { FmtDate, FmtRelative } from "@/components/dates";
import { cn, formatChip } from "@/lib/utils";
import { Alert, Avatar, Badge, ButtonLink, Card, CardHeader, EmptyState, Input, StatCard, StatusBadge } from "@/components/ui";

export const metadata = { title: "Espace vétérinaire" };

const QUICK_ACTIONS = [
  {
    label: { fr: "Enregistrer un animal", mg: "Hanoratra biby" },
    text: { fr: "Nouvelle fiche et pose de puce", mg: "Fiche vaovao sy fametrahana puce" },
    href: "/animaux/nouveau",
    icon: Plus,
    primary: true,
  },
  {
    label: { fr: "Initier un transfert", mg: "Hanomboka famindrana" },
    text: { fr: "Changement de propriétaire", mg: "Fiovan'ny tompony" },
    href: "/veterinaire/scanner?action=transfert",
    icon: ArrowLeftRight,
  },
  {
    label: { fr: "Déclarer un décès", mg: "Hanambara fahafatesana" },
    text: { fr: "Mettre à jour le statut", mg: "Hanavao ny toetra" },
    href: "/veterinaire/scanner?action=deces",
    icon: HeartOff,
  },
  {
    label: { fr: "Déclarer trouvé", mg: "Hanambara fa hita" },
    text: { fr: "Animal recueilli à la clinique", mg: "Biby noraisina tao amin'ny toeram-pitsaboana" },
    href: "/veterinaire/scanner?action=trouve",
    icon: MapPin,
  },
  {
    label: { fr: "Importer un CSV", mg: "Hanafatra CSV" },
    text: { fr: "Ajouter plusieurs animaux", mg: "Hampiditra biby maromaro" },
    href: "/veterinaire/import",
    icon: Upload,
  },
];

export default async function VetDashboard() {
  const user = await requireRole("vet", "admin");
  await connection();
  const now = new Date();
  const [stats, patients, todo, log] = await Promise.all([
    vetStats(user, now),
    listAnimals(user, {}, 5),
    vetTodo(user),
    listAccessLog(user.id, 4),
  ]);
  const lastName = user.name.split(" ").at(-1);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          <T fr="Espace vétérinaire" mg="Sehatra ho an'ny dokotera" />
        </h1>
        <p className="mt-1 text-sm text-muted">
          {[user.vet?.clinicName, `Dr ${lastName}`].filter(Boolean).join(" · ")}
          {user.vet && (
            <>
              {" · "}
              <T fr="N° d'ordre" mg="Laharana (Ordre)" /> {user.vet.orderNumber}
            </>
          )}
        </p>
      </div>

      {user.vet?.status === "pending" && (
        <Alert tone="amber" className="mb-6">
          <T
            fr="Votre numéro d'ordre est en cours de vérification. En attendant, la lecture des coordonnées et l'enregistrement de puces sont désactivés."
            mg="Eo am-panamarinana ny laharanao ao amin'ny Holafitra (Ordre). Mandritra izany, tsy azo atao ny mijery ny fifandraisana sy manoratra puce."
          />
        </Alert>
      )}

      <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <p className="shrink-0 text-sm font-semibold text-ink">
          <T fr="Vérifier une puce" mg="Hanamarina puce" />
        </p>
        <form action="/veterinaire/scanner" className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <Input
              name="puce"
              inputMode="numeric"
              placeholder={{ fr: "Saisir ou scanner un numéro à 15 chiffres", mg: "Soraty na scan-o ny laharana misy isa 15" }}
              className="pl-9"
            />
          </div>
          <button className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
            <T fr="Rechercher" mg="Hikaroka" />
          </button>
          <ButtonLink href="/veterinaire/scanner" variant="secondary" className="hidden sm:inline-flex">
            <ScanLine className="size-4" /> <T fr="Scanner" mg="Hi-scan" />
          </ButtonLink>
        </form>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label.fr}
            href={a.href}
            className={cn(
              "rounded-[var(--radius-card)] border p-4 transition-colors",
              a.primary ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700" : "border-line bg-white hover:border-brand-200",
            )}
          >
            <span className={cn("flex size-8 items-center justify-center rounded-lg", a.primary ? "bg-white/15" : "bg-brand-50 text-brand-600")}>
              <a.icon className="size-4" />
            </span>
            <p className={cn("mt-3 text-sm font-semibold", !a.primary && "text-ink")}>
              <T {...a.label} />
            </p>
            <p className={cn("text-[11px]", a.primary ? "text-white/70" : "text-muted")}>
              <T {...a.text} />
            </p>
          </Link>
        ))}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={<T fr="Patients suivis" mg="Marary arahina" />}
          value={stats.patients}
          hint={<T fr={`+${stats.patientsThisWeek} cette semaine`} mg={`+${stats.patientsThisWeek} amin'ity herinandro ity`} />}
        />
        <StatCard
          label={<T fr="Puces posées (mois)" mg="Puce napetraka (volana)" />}
          value={stats.chippedThisMonth}
          hint={<T fr="Depuis le 1er du mois" mg="Nanomboka ny 1 amin'ny volana" />}
          hintTone="muted"
        />
        <StatCard
          label={<T fr="Transferts en attente" mg="Famindrana miandry" />}
          value={stats.pendingTransfers}
          hint={
            stats.pendingTransfers ? (
              <T fr={`${stats.pendingTransfers} en attente`} mg={`${stats.pendingTransfers} miandry`} />
            ) : (
              <T fr="Aucun" mg="Tsy misy" />
            )
          }
          hintTone={stats.pendingTransfers ? "red" : "muted"}
        />
        <StatCard
          label={<T fr="Coordonnées consultées" mg="Fifandraisana nojerena" />}
          value={stats.contactViews}
          hint={<T fr="30 derniers jours · journalisé" mg="30 andro farany · voasoratra" />}
          hintTone="muted"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <Card className="self-start">
          <CardHeader
            title={<T fr="Patients récents" mg="Marary vao haingana" />}
            action={
              <Link href="/veterinaire/patients" className="text-xs font-semibold text-brand-600 hover:underline">
                <T fr="Voir tout" mg="Hijery rehetra" />
              </Link>
            }
          />
          {patients.length === 0 ? (
            <EmptyState
              title={<T fr="Aucun patient pour le moment" mg="Tsy mbola misy marary" />}
              description={<T fr="Les animaux que vous enregistrez apparaîtront ici." mg="Hiseho eto ireo biby soratanao." />}
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] text-muted">
                  <th className="px-5 py-2.5 font-medium">
                    <T fr="Animal" mg="Biby" />
                  </th>
                  <th className="hidden px-3 py-2.5 font-medium sm:table-cell">
                    <T fr="N° de puce" mg="Laharan'ny puce" />
                  </th>
                  <th className="hidden px-3 py-2.5 font-medium md:table-cell">
                    <T fr="Propriétaire" mg="Tompony" />
                  </th>
                  <th className="px-5 py-2.5 font-medium">
                    <T fr="Statut" mg="Toetra" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <Link href={`/animaux/${p.id}`} className="flex items-center gap-2.5 font-medium text-ink hover:text-brand-700">
                        <Avatar name={p.name} size="sm" /> {p.name}
                      </Link>
                    </td>
                    <td className="hidden px-3 py-3 font-mono text-xs text-muted sm:table-cell">{formatChip(p.chipNumber)}</td>
                    <td className="hidden px-3 py-3 text-muted md:table-cell">{p.ownerName}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title={<T fr="À traiter" mg="Hokarakaraina" />} />
            {todo.transfers.length + todo.clinicTransfers.length + todo.reports.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-muted">
                <T fr="Rien à traiter pour le moment." mg="Tsy misy hokarakaraina amin'izao." />
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {todo.transfers.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Badge tone="amber">
                        <T fr="Transfert" mg="Famindrana" />
                      </Badge>
                      <p className="mt-1 text-xs font-semibold text-ink">{t.animal.name} · {t.fromName} → {t.toName}</p>
                      <p className="text-[11px] text-muted">
                        <T fr="À confirmer avant le" mg="Hamafisina alohan'ny" /> <FmtDate value={t.expiresAt} />
                      </p>
                    </div>
                    <ButtonLink href="/transferts" variant="secondary" size="sm">
                      <T fr="Voir" mg="Hijery" />
                    </ButtonLink>
                  </li>
                ))}
                {todo.clinicTransfers.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Badge tone="brand">
                        <T fr="Nouveau patient" mg="Marary vaovao" />
                      </Badge>
                      <p className="mt-1 text-xs font-semibold text-ink">{t.animal.name}
                        {t.fromClinic && <T fr={` · depuis ${t.fromClinic.name}`} mg={` · avy amin'ny ${t.fromClinic.name}`} />}</p>
                      <p className="text-[11px] text-muted">
                        <T fr="En attente de validation par l'administration" mg="Miandry ny fankatoavan'ny mpitantana" />
                      </p>
                    </div>
                    <ButtonLink href="/transferts" variant="secondary" size="sm">
                      <T fr="Voir" mg="Hijery" />
                    </ButtonLink>
                  </li>
                ))}
                {todo.reports.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Badge tone={REPORT_TYPE[r.type].tone}>
                        <T {...REPORT_TYPE[r.type].label} />
                      </Badge>
                      <p className="mt-1 text-xs font-semibold text-ink">
                        {r.type === "duplicate" ? (
                          <T
                            fr={`Puce ${r.chipNumber?.slice(0, 10)}… déjà enregistrée`}
                            mg={`Efa voasoratra ny puce ${r.chipNumber?.slice(0, 10)}…`}
                          />
                        ) : (
                          <>
                            {r.animal?.name ?? (r.species && <T {...speciesLabel(r.species)} />)} · {r.location ?? ""}
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-muted">
                        {r.type === "duplicate" ? (
                          <T fr="Vérification requise" mg="Mila hamarinina" />
                        ) : (
                          <T fr="Contacter le propriétaire" mg="Hifandray amin'ny tompony" />
                        )}
                      </p>
                    </div>
                    <ButtonLink href={r.animal ? `/animaux/${r.animal.id}` : "/signalements"} variant="secondary" size="sm">
                      {r.type === "duplicate" ? <T fr="Examiner" mg="Handinika" /> : <T fr="Ouvrir" mg="Hanokatra" />}
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              title={<T fr="Journal d'accès récent" mg="Diarin'ny fidirana vao haingana" />}
              action={
                <Link href="/veterinaire/journal" className="text-xs font-semibold text-brand-600 hover:underline">
                  <T fr="Tout voir" mg="Hijery rehetra" />
                </Link>
              }
            />
            <ol className="space-y-3 px-5 py-4">
              {log.map((l, i) => (
                <li key={l.id} className="flex gap-2.5">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", i === 0 ? "bg-brand-600" : "bg-brand-200")} />
                  <div>
                    <p className="text-xs font-semibold text-ink"><T {...ACCESS_ACTION[l.action]} />
                      {l.animal && ` · ${l.animal.name}`}</p>
                    <p className="text-[11px] text-muted">
                      <FmtRelative value={l.createdAt} now={now} />
                    </p>
                  </div>
                </li>
              ))}
              {log.length === 0 && (
                <li className="text-xs text-muted">
                  <T fr="Aucune activité." mg="Tsy misy hetsika." />
                </li>
              )}
            </ol>
            <p className="border-t border-line px-5 py-3 text-[11px] text-muted">
              <T
                fr="Chaque consultation de coordonnées est enregistrée dans le journal d'audit."
                mg="Voasoratra ao amin'ny diarin'ny fanaraha-maso ny fijerena fifandraisana tsirairay."
              />
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
