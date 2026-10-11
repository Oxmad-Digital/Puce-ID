import { reviewVet } from "@/lib/actions/vet";
import { listAllVets } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Avatar, Badge, Button, Card, PageHeader } from "@/components/ui";

export const metadata = { title: "Vétérinaires" };

const STATUS = {
  pending: { label: "En attente", tone: "amber" },
  verified: { label: "Vérifié", tone: "green" },
  rejected: { label: "Refusé", tone: "red" },
} as const;

export default async function AdminVetsPage() {
  await requireRole("admin");
  const vets = await listAllVets();
  return (
    <>
      <PageHeader title="Vétérinaires" description="Vérification des numéros d'ordre et gestion des accès" />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] text-muted">
              <th className="px-5 py-2.5 font-medium">Vétérinaire</th>
              <th className="px-3 py-2.5 font-medium">Clinique</th>
              <th className="px-3 py-2.5 font-medium">N° d&apos;ordre</th>
              <th className="px-3 py-2.5 font-medium">Inscrit le</th>
              <th className="px-3 py-2.5 font-medium">Statut</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {vets.map((v) => (
              <tr key={v.userId}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={v.name} size="sm" tone="accent" />
                    <div>
                      <p className="font-medium text-ink">Dr {v.name}</p>
                      <p className="text-[11px] text-muted">{v.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-muted">{v.clinicName}, {v.city}</td>
                <td className="px-3 py-3 font-mono text-xs">{v.orderNumber}</td>
                <td className="px-3 py-3 text-muted">{formatDate(v.createdAt)}</td>
                <td className="px-3 py-3"><Badge tone={STATUS[v.status].tone}>{STATUS[v.status].label}</Badge></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    {v.status !== "verified" && <form action={reviewVet.bind(null, v.userId, true)}><Button size="sm">Valider</Button></form>}
                    {v.status !== "rejected" && <form action={reviewVet.bind(null, v.userId, false)}><Button size="sm" variant="ghost">{v.status === "verified" ? "Suspendre" : "Refuser"}</Button></form>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
