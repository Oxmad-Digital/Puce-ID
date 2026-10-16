import { Building2, Plus, UserPlus } from "lucide-react";
import { listClinicsWithMembers } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import { Badge, Card, CardHeader, EmptyState, PageHeader } from "@/components/ui";
import { Modal } from "@/components/modal";
import { InviteClinicForm, InviteColleagueForm } from "@/components/forms/clinic-forms";
import { ClinicMembers } from "@/components/app/clinic-members";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Cliniques & vétérinaires" };

export default async function AdminVetsPage() {
  await requireRole("admin");
  const clinics = await listClinicsWithMembers();
  const pending = clinics.reduce((n, c) => n + c.members.filter((m) => m.status === "pending").length, 0);

  return (
    <>
      <PageHeader
        title={<T fr="Cliniques & vétérinaires" mg="Toeram-pitsaboana sy dokotera" />}
        description={
          <T
            fr={`${clinics.length} clinique${clinics.length > 1 ? "s" : ""}${pending ? ` · ${pending} numéro${pending > 1 ? "s" : ""} d'ordre à vérifier` : ""}`}
            mg={`Toeram-pitsaboana ${clinics.length}${pending ? ` · laharana (Ordre) ${pending} hamarinina` : ""}`}
          />
        }
        actions={
          <Modal
            trigger={
              <>
                <Plus className="size-4" /> <T fr="Inviter une clinique" mg="Hanasa toeram-pitsaboana" />
              </>
            }
            title={<T fr="Inviter une clinique" mg="Hanasa toeram-pitsaboana" />}
            description={
              <T
                fr="La clinique et son vétérinaire responsable reçoivent leurs identifiants par e-mail."
                mg="Mahazo ny fanondroana fidirana amin'ny mailaka ny toeram-pitsaboana sy ny dokotera tompon'andraikitra."
              />
            }
            variant="primary"
          >
            <InviteClinicForm />
          </Modal>
        }
      />

      {clinics.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Building2 className="size-5" />}
            title={<T fr="Aucune clinique" mg="Tsy misy toeram-pitsaboana" />}
            description={
              <T fr="Invitez une première clinique pour démarrer." mg="Asao ny toeram-pitsaboana voalohany hanombohana." />
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {clinics.map((c) => (
            <Card key={c.id}>
              <CardHeader
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    {c.name}
                    {!c.listedPublicly && (
                      <Badge tone="gray">
                        <T fr="Hors annuaire" mg="Tsy ao amin'ny lisitra" />
                      </Badge>
                    )}
                  </span>
                }
                description={
                  <>
                    {[c.address, c.city].filter(Boolean).join(", ")} ·{" "}
                    <T
                      fr={`${c.animals} animal${c.animals > 1 ? "aux suivis" : " suivi"}`}
                      mg={`biby ${c.animals} arahina`}
                    />
                  </>
                }
                action={
                  <Modal
                    trigger={
                      <>
                        <UserPlus className="size-3.5" /> <T fr="Vétérinaire" mg="Dokotera" />
                      </>
                    }
                    title={<T fr={`Inviter un vétérinaire — ${c.name}`} mg={`Hanasa dokotera — ${c.name}`} />}
                    description={
                      <T
                        fr="Invité par l'administration, son compte est directement vérifié."
                        mg="Satria ny mpitantana no nanasa azy, voamarina avy hatrany ny kaontiny."
                      />
                    }
                    size="sm"
                  >
                    <InviteColleagueForm clinicId={c.id} byAdmin />
                  </Modal>
                }
              />
              {c.members.length ? (
                <ClinicMembers members={c.members} canManage isAdmin />
              ) : (
                <p className="px-5 py-4 text-xs text-muted">
                  <T fr="Aucun vétérinaire rattaché." mg="Tsy misy dokotera mifandray aminy." />
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
