import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeftRight, HeartOff, MapPin, Plus, ScanLine, Search, Upload } from "lucide-react";
import { listAccessLog, listAnimals, vetStats, vetTodo } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { ACCESS_ACTION, REPORT_TYPE } from "@/lib/labels";
import { cn, formatChip, formatDate, formatRelative } from "@/lib/utils";
import { Alert, Avatar, Badge, ButtonLink, Card, CardHeader, EmptyState, StatCard, StatusBadge } from "@/components/ui";

export const metadata = { title: "Espace vétérinaire" };

const QUICK_ACTIONS = [
  { label: "Enregistrer un animal", text: "Nouvelle fiche et pose de puce", href: "/animaux/nouveau", icon: Plus, primary: true },
  { label: "Initier un transfert", text: "Changement de propriétaire", href: "/veterinaire/scanner?action=transfert", icon: ArrowLeftRight },
  { label: "Déclarer un décès", text: "Mettre à jour le statut", href: "/veterinaire/scanner?action=deces", icon: HeartOff },
  { label: "Déclarer trouvé", text: "Animal recueilli à la clinique", href: "/veterinaire/scanner?action=trouve", icon: MapPin },
  { label: "Importer un CSV", text: "Ajouter plusieurs animaux", href: "/veterinaire/import", icon: Upload },
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
        <h1 className="text-2xl font-bold tracking-tight text-ink">Espace vétérinaire</h1>
        <p className="mt-1 text-sm text-muted">
          {[user.vet?.clinicName, `Dr ${lastName}`, user.vet && `N° d'ordre ${user.vet.orderNumber}`].filter(Boolean).join(" · ")}
        </p>
      </div>

      {user.vet?.status === "pending" && (
        <Alert tone="amber" className="mb-6">
          Votre numéro d&apos;ordre est en cours de vérification. En attendant, la lecture des coordonnées et
          l&apos;enregistrement de puces sont désactivés.
        </Alert>
      )}

      <Card className="mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <p className="shrink-0 text-sm font-semibold text-ink">Vérifier une puce</p>
        <form action="/veterinaire/scanner" className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <input name="puce" inputMode="numeric" placeholder="Saisir ou scanner un numéro à 15 chiffres" className="field-input pl-9" />
          </div>
          <button className="h-10 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">Rechercher</button>
          <ButtonLink href="/veterinaire/scanner" variant="secondary" className="hidden sm:inline-flex">
            <ScanLine className="size-4" /> Scanner
          </ButtonLink>
        </form>
      </Card>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className={cn(
              "rounded-[var(--radius-card)] border p-4 transition-colors",
              a.primary ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700" : "border-line bg-white hover:border-brand-200",
            )}
          >
            <span className={cn("flex size-8 items-center justify-center rounded-lg", a.primary ? "bg-white/15" : "bg-brand-50 text-brand-600")}>
              <a.icon className="size-4" />
            </span>
            <p className={cn("mt-3 text-sm font-semibold", !a.primary && "text-ink")}>{a.label}</p>
            <p className={cn("text-[11px]", a.primary ? "text-white/70" : "text-muted")}>{a.text}</p>
          </Link>
        ))}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Patients suivis" value={stats.patients} hint={`+${stats.patientsThisWeek} cette semaine`} />
        <StatCard label="Puces posées (mois)" value={stats.chippedThisMonth} hint="Depuis le 1er du mois" hintTone="muted" />
        <StatCard label="Transferts en attente" value={stats.pendingTransfers} hint={stats.pendingTransfers ? `${stats.pendingTransfers} en attente` : "Aucun"} hintTone={stats.pendingTransfers ? "red" : "muted"} />
        <StatCard label="Coordonnées consultées" value={stats.contactViews} hint="30 derniers jours · journalisé" hintTone="muted" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
        <Card className="self-start">
          <CardHeader title="Patients récents" action={<Link href="/veterinaire/patients" className="text-xs font-semibold text-brand-600 hover:underline">Voir tout</Link>} />
          {patients.length === 0 ? (
            <EmptyState title="Aucun patient pour le moment" description="Les animaux que vous enregistrez apparaîtront ici." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] text-muted">
                  <th className="px-5 py-2.5 font-medium">Animal</th>
                  <th className="hidden px-3 py-2.5 font-medium sm:table-cell">N° de puce</th>
                  <th className="hidden px-3 py-2.5 font-medium md:table-cell">Propriétaire</th>
                  <th className="px-5 py-2.5 font-medium">Statut</th>
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
            <CardHeader title="À traiter" />
            {todo.transfers.length + todo.clinicTransfers.length + todo.reports.length === 0 ? (
              <p className="px-5 py-6 text-center text-xs text-muted">Rien à traiter pour le moment.</p>
            ) : (
              <ul className="divide-y divide-line">
                {todo.transfers.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Badge tone="amber">Transfert</Badge>
                      <p className="mt-1 text-xs font-semibold text-ink">{t.animal.name} · {t.fromName} → {t.toName}</p>
                      <p className="text-[11px] text-muted">À confirmer avant le {formatDate(t.expiresAt)}</p>
                    </div>
                    <ButtonLink href="/transferts" variant="secondary" size="sm">Voir</ButtonLink>
                  </li>
                ))}
                {todo.clinicTransfers.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Badge tone="brand">Nouveau patient</Badge>
                      <p className="mt-1 text-xs font-semibold text-ink">{t.animal.name}{t.fromClinic && ` · depuis ${t.fromClinic.name}`}</p>
                      <p className="text-[11px] text-muted">À accepter avant le {formatDate(t.expiresAt)}</p>
                    </div>
                    <ButtonLink href="/transferts" variant="secondary" size="sm">Voir</ButtonLink>
                  </li>
                ))}
                {todo.reports.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <Badge tone={REPORT_TYPE[r.type].tone}>{REPORT_TYPE[r.type].label}</Badge>
                      <p className="mt-1 text-xs font-semibold text-ink">
                        {r.type === "duplicate" ? `Puce ${r.chipNumber?.slice(0, 10)}… déjà enregistrée` : `${r.animal?.name ?? r.species} · ${r.location ?? ""}`}
                      </p>
                      <p className="text-[11px] text-muted">{r.type === "duplicate" ? "Vérification requise" : "Contacter le propriétaire"}</p>
                    </div>
                    <ButtonLink href={r.animal ? `/animaux/${r.animal.id}` : "/signalements"} variant="secondary" size="sm">
                      {r.type === "duplicate" ? "Examiner" : "Ouvrir"}
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Journal d'accès récent" action={<Link href="/veterinaire/journal" className="text-xs font-semibold text-brand-600 hover:underline">Tout voir</Link>} />
            <ol className="space-y-3 px-5 py-4">
              {log.map((l, i) => (
                <li key={l.id} className="flex gap-2.5">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", i === 0 ? "bg-brand-600" : "bg-brand-200")} />
                  <div>
                    <p className="text-xs font-semibold text-ink">{ACCESS_ACTION[l.action]}{l.animal && ` · ${l.animal.name}`}</p>
                    <p className="text-[11px] text-muted">{formatRelative(l.createdAt, now)}</p>
                  </div>
                </li>
              ))}
              {log.length === 0 && <li className="text-xs text-muted">Aucune activité.</li>}
            </ol>
            <p className="border-t border-line px-5 py-3 text-[11px] text-muted">
              Chaque consultation de coordonnées est enregistrée dans le journal d&apos;audit.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
