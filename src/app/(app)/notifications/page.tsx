import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeftRight, Bell, Mail, MapPin } from "lucide-react";
import { listMessagesFor, listReportsFor, listTransfers } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import { REPORT_TYPE } from "@/lib/labels";
import { formatRelative } from "@/lib/utils";
import { Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Notifications" };

type Item = { id: string; icon: typeof Bell; title: string; text: string; href: string; date: Date };

export default async function NotificationsPage() {
  const user = await requireUser();
  await connection();
  const now = new Date();
  const [messages, transfers, reports] = await Promise.all([
    listMessagesFor(user.id),
    listTransfers(user),
    listReportsFor(user),
  ]);

  const items: Item[] = [
    ...messages.map((m) => ({
      id: `m-${m.id}`,
      icon: Mail,
      title: `Message au sujet de ${m.animalName}`,
      text: `${m.senderName ?? "Anonyme"} : ${m.message}`,
      href: `/animaux/${m.animalId}`,
      date: m.createdAt,
    })),
    ...transfers
      .filter((t) => t.status === "pending")
      .map((t) => ({
        id: `t-${t.id}`,
        icon: ArrowLeftRight,
        title: t.toUserId === user.id || t.toEmail === user.email ? `${t.fromName} vous propose ${t.animal.name}` : `Transfert de ${t.animal.name} en attente`,
        text: `Vers ${t.toName}`,
        href: "/transferts",
        date: t.createdAt,
      })),
    ...reports
      .filter((r) => r.status === "open")
      .map((r) => ({
        id: `r-${r.id}`,
        icon: MapPin,
        title: `${REPORT_TYPE[r.type].label} : ${r.animal?.name ?? r.species ?? "animal"}`,
        text: [r.location, r.description].filter(Boolean).join(" — "),
        href: "/signalements",
        date: r.createdAt,
      })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <>
      <PageHeader title="Notifications" description="Messages, transferts et signalements récents" />
      <Card>
        {items.length === 0 ? (
          <EmptyState icon={<Bell className="size-5" />} title="Aucune notification" description="Vous êtes à jour." />
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
                  <span className="shrink-0 text-[11px] text-subtle">{formatRelative(i.date, now)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
