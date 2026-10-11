import { notFound } from "next/navigation";
import { UserPlus } from "lucide-react";
import { getClinic } from "@/lib/data/queries";
import { isClinicManager, requireRole } from "@/lib/session";
import { Alert, Card, CardHeader, InfoItem, PageHeader } from "@/components/ui";
import { Modal } from "@/components/modal";
import { ClinicForm, InviteColleagueForm } from "@/components/forms/clinic-forms";
import { ClinicMembers } from "@/components/app/clinic-members";

export const metadata = { title: "Ma clinique" };

export default async function ClinicPage() {
  const user = await requireRole("vet");
  if (!user.vet) notFound();
  const clinic = await getClinic(user.vet.clinicId);
  if (!clinic) notFound();
  const manager = isClinicManager(user);

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={clinic.name}
        description={`${clinic.city} · ${clinic.members.length} vétérinaire${clinic.members.length > 1 ? "s" : ""}`}
        actions={
          manager && (
            <Modal
              trigger={<><UserPlus className="size-4" /> Inviter un confrère</>}
              title="Inviter un confrère"
              description="Il recevra un e-mail avec un mot de passe provisoire."
              variant="primary"
            >
              <InviteColleagueForm clinicId={clinic.id} />
            </Modal>
          )
        }
      />

      {!manager && (
        <Alert tone="brand">
          Seuls les responsables de la clinique peuvent modifier ses informations et inviter des confrères.
        </Alert>
      )}

      <Card>
        <CardHeader title="Informations" description="Visibles dans l'annuaire public si la clinique y est inscrite." />
        <div className="p-5">
          {manager ? (
            <ClinicForm clinic={clinic} />
          ) : (
            <dl className="grid gap-5 sm:grid-cols-3">
              <InfoItem label="Adresse" value={[clinic.address, clinic.city].filter(Boolean).join(", ")} />
              <InfoItem label="Téléphone" value={clinic.phone} />
              <InfoItem label="E-mail" value={clinic.email} />
            </dl>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Équipe"
          description="Les vétérinaires vérifiés de la clinique partagent l'accès à ses patients."
        />
        <ClinicMembers members={clinic.members} canManage={manager} />
      </Card>
    </div>
  );
}
