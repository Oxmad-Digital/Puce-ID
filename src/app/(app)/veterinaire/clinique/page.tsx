import { notFound } from "next/navigation";
import { UserPlus } from "lucide-react";
import { getClinic } from "@/lib/data/queries";
import { isClinicManager, requireRole } from "@/lib/session";
import { Alert, Card, CardHeader, InfoItem, PageHeader } from "@/components/ui";
import { Modal } from "@/components/modal";
import { ClinicForm, InviteColleagueForm } from "@/components/forms/clinic-forms";
import { ClinicMembers } from "@/components/app/clinic-members";
import { T } from "@/components/layout/lang-toggle";

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
        description={
          <T
            fr={`${clinic.city} · ${clinic.members.length} vétérinaire${clinic.members.length > 1 ? "s" : ""}`}
            mg={`${clinic.city} · dokotera ${clinic.members.length}`}
          />
        }
        actions={
          manager && (
            <Modal
              trigger={
                <>
                  <UserPlus className="size-4" /> <T fr="Inviter un confrère" mg="Hanasa mpiara-miasa" />
                </>
              }
              title={<T fr="Inviter un confrère" mg="Hanasa mpiara-miasa" />}
              description={
                <T
                  fr="Il recevra un e-mail avec un mot de passe provisoire."
                  mg="Hahazo mailaka misy teny miafina vonjimaika izy."
                />
              }
              variant="primary"
            >
              <InviteColleagueForm clinicId={clinic.id} />
            </Modal>
          )
        }
      />

      {!manager && (
        <Alert tone="brand">
          <T
            fr="Seuls les responsables de la clinique peuvent modifier ses informations et inviter des confrères."
            mg="Ny tompon'andraikitry ny toeram-pitsaboana ihany no afaka manova ny fampahalalana momba azy sy manasa mpiara-miasa."
          />
        </Alert>
      )}

      <Card>
        <CardHeader
          title={<T fr="Informations" mg="Fampahalalana" />}
          description={
            <T
              fr="Visibles dans l'annuaire public si la clinique y est inscrite."
              mg="Hita ao amin'ny lisitra ho an'ny besinimaro raha voasoratra ao ny toeram-pitsaboana."
            />
          }
        />
        <div className="p-5">
          {manager ? (
            <ClinicForm clinic={clinic} />
          ) : (
            <dl className="grid gap-5 sm:grid-cols-3">
              <InfoItem label={<T fr="Adresse" mg="Adiresy" />} value={[clinic.address, clinic.city].filter(Boolean).join(", ")} />
              <InfoItem label={<T fr="Téléphone" mg="Telefaonina" />} value={clinic.phone} />
              <InfoItem label={<T fr="E-mail" mg="Mailaka" />} value={clinic.email} />
            </dl>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          title={<T fr="Équipe" mg="Ekipa" />}
          description={
            <T
              fr="Les vétérinaires vérifiés de la clinique partagent l'accès à ses patients."
              mg="Mizara ny fidirana amin'ireo marary ao aminy ireo dokotera voamarina ao amin'ny toeram-pitsaboana."
            />
          }
        />
        <ClinicMembers members={clinic.members} canManage={manager} />
      </Card>
    </div>
  );
}
