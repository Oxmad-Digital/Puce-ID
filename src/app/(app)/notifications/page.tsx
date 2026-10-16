import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeftRight, Bell, Mail, MapPin } from "lucide-react";
import { listClinicTransfers, listMessagesFor, listReportsFor, listTransfers } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import { REPORT_TYPE, speciesLabel } from "@/lib/labels";
import { T } from "@/components/layout/lang-toggle";
import { FmtRelative } from "@/components/dates";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Notifications" };

type Item = { id: string; icon: typeof Bell; title: ReactNode; text: ReactNode; href: string; date: Date };

export default async function NotificationsPage() {
  const user = await requireUser();
  await connection();
  const now = new Date();
  const [messages, transfers, reports, clinicTransfers] = await Promise.all([
    listMessagesFor(user.id),
    listTransfers(user),
    listReportsFor(user),
    listClinicTransfers(user),
  ]);
  const isAdmin = user.role === "admin";
  const myClinic = user.vet?.status === "verified" ? user.vet.clinicId : null;
  const recentLimit = new Date(now.getTime() - 14 * 86400_000);

  // Transferts de dossier : l'administration ne voit que les demandes à valider ;
  // les autres voient leurs demandes en attente et celles résolues depuis moins de 14 jours.
  const clinicItems: Item[] = clinicTransfers.flatMap((t) => {
    const base = {
      id: `c-${t.id}`,
      icon: ArrowLeftRight,
      text: (
        <>
          {t.fromClinic?.name ?? <T fr="Sans clinique" mg="Tsy misy toeram-pitsaboana" />} → {t.toClinic.name}
        </>
      ),
    };
    if (t.status === "pending") {
      if (isAdmin) {
        return t.expiresAt > now
          ? [
              {
                ...base,
                title: (
                  <T
                    fr={`Transfert de dossier à valider : ${t.animal.name}`}
                    mg={`Famindrana antontan-taratasy hankatoavina : ${t.animal.name}`}
                  />
                ),
                href: "/transferts",
                date: t.createdAt,
              },
            ]
          : [];
      }
      return [
        {
          ...base,
          title: (
            <T
              fr={`Transfert de ${t.animal.name} en attente de validation par l'administration`}
              mg={`Miandry ny fankatoavan'ny mpitantana ny famindrana an'i ${t.animal.name}`}
            />
          ),
          href: `/animaux/${t.animal.id}`,
          date: t.createdAt,
        },
      ];
    }
    if (isAdmin || (t.status !== "accepted" && t.status !== "rejected") || !t.resolvedAt || t.resolvedAt < recentLimit) return [];
    const resolved = { ...base, href: `/animaux/${t.animal.id}`, date: t.resolvedAt };
    if (t.status === "accepted" && t.animal.ownerId === user.id) {
      return [
        {
          ...resolved,
          title: (
            <T
              fr={`${t.animal.name} est désormais suivi par ${t.toClinic.name}`}
              mg={`${t.toClinic.name} no manaraka an'i ${t.animal.name} manomboka izao`}
            />
          ),
        },
      ];
    }
    if (t.status === "accepted" && myClinic !== null && t.toClinic.id === myClinic) {
      return [
        { ...resolved, title: <T fr={`Nouveau patient : ${t.animal.name}`} mg={`Marary vaovao : ${t.animal.name}`} /> },
      ];
    }
    return [
      {
        ...resolved,
        href: "/transferts",
        title: (
          <T
            fr={`Transfert de ${t.animal.name} ${t.status === "accepted" ? "validé" : "refusé"}`}
            mg={`${t.status === "accepted" ? "Nankatoavina" : "Nolavina"} ny famindrana an'i ${t.animal.name}`}
          />
        ),
      },
    ];
  });

  const items: Item[] = [
    ...messages.map((m) => ({
      id: `m-${m.id}`,
      icon: Mail,
      title: <T fr={`Message au sujet de ${m.animalName}`} mg={`Hafatra momba an'i ${m.animalName}`} />,
      text: (
        <>
          {m.senderName ?? <T fr="Anonyme" mg="Tsy fantatra anarana" />} : {m.message}
        </>
      ),
      href: `/animaux/${m.animalId}`,
      date: m.createdAt,
    })),
    ...transfers
      .filter((t) => t.status === "pending")
      .map((t) => ({
        id: `t-${t.id}`,
        icon: ArrowLeftRight,
        title:
          t.toUserId === user.id || t.toEmail === user.email ? (
            <T fr={`${t.fromName} vous propose ${t.animal.name}`} mg={`Manolotra an'i ${t.animal.name} ho anao i ${t.fromName}`} />
          ) : (
            <T fr={`Transfert de ${t.animal.name} en attente`} mg={`Famindrana an'i ${t.animal.name} miandry`} />
          ),
        text: <T fr={`Vers ${t.toName}`} mg={`Ho any amin'i ${t.toName}`} />,
        href: "/transferts",
        date: t.createdAt,
      })),
    ...clinicItems,
    ...reports
      .filter((r) => r.status === "open")
      .map((r) => ({
        id: `r-${r.id}`,
        icon: MapPin,
        title: (
          <>
            <T {...REPORT_TYPE[r.type].label} /> :{" "}
            {r.animal?.name ?? (r.species ? <T {...speciesLabel(r.species)} /> : <T fr="animal" mg="biby" />)}
          </>
        ),
        text: [r.location, r.description].filter(Boolean).join(" — "),
        href: "/signalements",
        date: r.createdAt,
      })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <>
      <PageHeader
        title={<T fr="Notifications" mg="Fampahafantarana" />}
        description={
          <T
            fr="Messages, transferts (propriété et dossier) et signalements récents"
            mg="Hafatra, famindrana (fananana sy antontan-taratasy) ary filazana vao haingana"
          />
        }
      />
      <Card>
        {items.length === 0 ? (
          <EmptyState
            icon={<Bell className="size-5" />}
            title={<T fr="Aucune notification" mg="Tsy misy fampahafantarana" />}
            description={<T fr="Vous êtes à jour." mg="Efa vaovao daholo ianao." />}
          />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((i) => (
              <li key={i.id}>
                <Link href={i.href} className="flex gap-3 px-5 py-4 hover:bg-surface/60">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <i.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{i.title}</p>
                    <p className="line-clamp-2 text-xs text-muted">{i.text}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-subtle"><FmtRelative value={i.date} now={now} /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
