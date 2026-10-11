import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { Alert, Badge, Card, CardHeader, PageHeader } from "@/components/ui";
import { LangToggle } from "@/components/layout/lang-toggle";
import { ClinicForm, PasswordForm, ProfileForm } from "@/components/forms/settings-forms";

export const metadata = { title: "Paramètres" };

const VET_STATUS = {
  pending: { label: "Vérification en cours", tone: "amber" },
  verified: { label: "Vérifié", tone: "green" },
  rejected: { label: "Refusé", tone: "red" },
} as const;

export default async function SettingsPage() {
  const user = await requireUser();
  const clinic =
    user.role === "vet"
      ? await db.query.vetProfile.findFirst({ where: eq(schema.vetProfile.userId, user.id) })
      : null;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="Paramètres" description="Gérez votre profil, votre sécurité et vos préférences" />

      <Card>
        <CardHeader title="Profil" />
        <div className="p-5"><ProfileForm name={user.name} email={user.email} phone={user.phone} city={user.city} /></div>
      </Card>

      {clinic && (
        <Card>
          <CardHeader
            title="Clinique"
            action={<Badge tone={VET_STATUS[clinic.status].tone}>{VET_STATUS[clinic.status].label}</Badge>}
          />
          <div className="p-5">
            {clinic.status === "pending" && (
              <Alert tone="amber" className="mb-4">
                Notre équipe vérifie votre numéro d&apos;ordre auprès de l&apos;Ordre des vétérinaires. Vous serez prévenu par e-mail.
              </Alert>
            )}
            <ClinicForm {...clinic} />
          </div>
        </Card>
      )}

      <Card id="securite">
        <CardHeader title="Sécurité" description="Changer votre mot de passe déconnecte vos autres appareils." />
        <div className="p-5"><PasswordForm /></div>
      </Card>

      <Card>
        <CardHeader title="Langue" />
        <div className="flex items-center justify-between gap-4 p-5">
          <p className="text-sm text-muted">Langue de l&apos;interface</p>
          <LangToggle />
        </div>
      </Card>
    </div>
  );
}
