import { requireUser } from "@/lib/session";
import { Alert, Badge, ButtonLink, Card, CardHeader, InfoItem, PageHeader } from "@/components/ui";
import { LangToggle, T } from "@/components/layout/lang-toggle";
import { VET_STATUS } from "@/components/app/clinic-members";
import { PasswordForm, ProfileForm } from "@/components/forms/settings-forms";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await requireUser();
  const vet = user.vet;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={<T fr="Paramètres" mg="Fikirana" />}
        description={
          <T
            fr="Gérez votre profil, votre sécurité et vos préférences"
            mg="Tantano ny mombamomba anao, ny fiarovana ary ny safidinao"
          />
        }
      />

      <Card>
        <CardHeader title={<T fr="Profil" mg="Mombamomba" />} />
        <div className="p-5"><ProfileForm name={user.name} email={user.email} phone={user.phone} city={user.city} /></div>
      </Card>

      {vet && (
        <Card>
          <CardHeader
            title={<T fr="Exercice professionnel" mg="Asa matihanina" />}
            action={
              <Badge tone={VET_STATUS[vet.status].tone}>
                <T {...VET_STATUS[vet.status].label} />
              </Badge>
            }
          />
          <div className="p-5">
            {vet.status === "pending" && (
              <Alert tone="amber" className="mb-4">
                <T
                  fr="Notre équipe vérifie votre numéro d'ordre auprès de l'Ordre des vétérinaires. Vous serez prévenu par e-mail."
                  mg="Hamarinin'ny ekipanay any amin'ny Holafitry ny dokotera mpitsabo biby ny laharanao. Hampahafantarina amin'ny mailaka ianao."
                />
              </Alert>
            )}
            <dl className="grid gap-5 sm:grid-cols-3">
              <InfoItem label={<T fr="N° d'ordre" mg="Laharana (Ordre)" />} value={<span className="font-mono">{vet.orderNumber}</span>} />
              <InfoItem label={<T fr="Clinique" mg="Toeram-pitsaboana" />} value={`${vet.clinicName}, ${vet.city}`} />
              <InfoItem
                label={<T fr="Rôle" mg="Andraikitra" />}
                value={
                  vet.clinicRole === "manager" ? <T fr="Responsable" mg="Tompon'andraikitra" /> : <T fr="Membre" mg="Mpikambana" />
                }
              />
            </dl>
            <ButtonLink href="/veterinaire/clinique" variant="secondary" size="sm" className="mt-5">
              {vet.clinicRole === "manager" ? (
                <T fr="Gérer la clinique et l'équipe" mg="Hitantana ny toeram-pitsaboana sy ny ekipa" />
              ) : (
                <T fr="Voir la clinique" mg="Hijery ny toeram-pitsaboana" />
              )}
            </ButtonLink>
          </div>
        </Card>
      )}

      <Card id="securite">
        <CardHeader
          title={<T fr="Sécurité" mg="Fiarovana" />}
          description={
            <T
              fr="Changer votre mot de passe déconnecte vos autres appareils."
              mg="Ny fanovana ny teny miafina dia mamoaka anao amin'ireo fitaovana hafa rehetra."
            />
          }
        />
        <div className="p-5"><PasswordForm /></div>
      </Card>

      <Card>
        <CardHeader title={<T fr="Langue" mg="Fiteny" />} />
        <div className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-muted">
            <T fr="Langue de l'interface" mg="Fitenin'ny sehatra" />
          </p>
          <LangToggle />
        </div>
      </Card>
    </div>
  );
}
