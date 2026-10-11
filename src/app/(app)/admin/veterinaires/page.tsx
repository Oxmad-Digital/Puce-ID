import { Building2, Plus, UserPlus } from "lucide-react";
import { listClinicsWithMembers } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { Modal } from "@/components/modal";
import { InviteClinicForm, InviteColleagueForm } from "@/components/forms/clinic-forms";
import { ClinicMembers } from "@/components/app/clinic-members";

export const metadata = { title: "Cliniques & vétérinaires" };

export default async function AdminVetsPage() {
  await requireRole("admin");
  const clinics = await listClinicsWithMembers();
  const pending = clinics.reduce((n, c) => n + c.members.filter((m) => m.status === "pending").length, 0);

  return (
    <>
      <PageHeader
        title="Cliniques & vétérinaires"
        description={`${clinics.length} clinique${clinics.length > 1 ? "s" : ""}${pending ? ` · ${pending} numéro${pending > 1 ? "s" : ""} d'ordre à vérifier` : ""}`}
        actions={
          <Modal
            trigger={<><Plus className="size-4" /> Inviter une clinique</>}
            title="Inviter une clinique"
            description="La clinique et son vétérinaire responsable reçoivent leurs identifiants par e-mail."
            variant="primary"
          >
            <InviteClinicForm />
          </Modal>
        }
      />

      {clinics.length === 0 ? (
        <Card>
          <EmptyState icon={<Building2 className="size-5" />} title="Aucune clinique" description="Invitez une première clinique pour démarrer." />
        </Card>
      ) : (
        <div className="space-y-5">
          {clinics.map((c) => (
            <Card key={c.id}>
              <CardHeader
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {c.name}
                    {!c.listedPublicly && <Badge tone="gray">Hors annuaire</Badge>}
                  </span>
                }
                description={[c.address, c.city].filter(Boolean).join(", ") + ` · ${c.animals} animal${c.animals > 1 ? "aux suivis" : " suivi"}`}
                action={
                  <Modal
                    trigger={<><UserPlus className="size-3.5" /> Vétérinaire</>}
                    title={`Inviter un vétérinaire — ${c.name}`}
                    description="Invité par l'administration, son compte est directement vérifié."
                    size="sm"
                  >
                    <InviteColleagueForm clinicId={c.id} byAdmin />
                  </Modal>
                }
              />
              {c.members.length ? (
                <ClinicMembers members={c.members} canManage isAdmin />
              ) : (
                <p className="px-5 py-4 text-xs text-muted">Aucun vétérinaire rattaché.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
