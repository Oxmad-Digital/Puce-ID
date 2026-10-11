import { notFound } from "next/navigation";
import { findPublicChip } from "@/lib/data/queries";
import { disputeRecord } from "@/lib/actions/public";
import { formatChip } from "@/lib/utils";
import { Alert, ButtonLink, Card, Input, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "@/components/forms/action-form";

export const metadata = { title: "Contester un enregistrement" };

export default async function DisputePage({ params }: PageProps<"/puce/[numero]/contester">) {
  const { numero } = await params;
  const animal = await findPublicChip(numero);
  if (!animal) notFound();

  return (
    <Card>
      <div className="border-b border-line p-6">
        <h1 className="text-lg font-bold text-ink">Contester cet enregistrement</h1>
        <p className="mt-1 text-xs text-muted">
          Puce <span className="font-mono">{formatChip(animal.chipNumber)}</span> · {animal.species}
        </p>
      </div>
      <ActionForm
        action={disputeRecord.bind(null, animal.chipNumber)}
        className="space-y-4 p-6"
        successView={<ButtonLink href="/" variant="secondary">Retour à l&apos;accueil</ButtonLink>}
      >
        <Alert tone="amber">
          Utilisez ce formulaire si vous êtes le propriétaire légitime de cet animal, si les
          informations sont erronées ou si la puce semble enregistrée deux fois. Préparez un
          justificatif (certificat vétérinaire, carnet de santé, acte de cession).
        </Alert>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="reporterName" label="Nom complet" required>
            <Input id="reporterName" name="reporterName" />
          </FormField>
          <FormField name="reporterContact" label="Téléphone ou e-mail" required>
            <Input id="reporterContact" name="reporterContact" />
          </FormField>
        </div>
        <FormField name="description" label="Motif de la contestation" required>
          <Textarea id="description" name="description" rows={6} placeholder="Décrivez la situation…" />
        </FormField>
        <SubmitButton className="w-full">Envoyer la contestation</SubmitButton>
      </ActionForm>
    </Card>
  );
}
