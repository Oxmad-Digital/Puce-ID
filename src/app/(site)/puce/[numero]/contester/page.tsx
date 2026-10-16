import { notFound } from "next/navigation";
import { findPublicChip } from "@/lib/data/queries";
import { disputeRecord } from "@/lib/actions/public";
import { formatChip } from "@/lib/utils";
import { speciesLabel } from "@/lib/labels";
import { Alert, ButtonLink, Card, Input, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "@/components/forms/action-form";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Contester un enregistrement" };

export default async function DisputePage({ params }: PageProps<"/puce/[numero]/contester">) {
  const { numero } = await params;
  const animal = await findPublicChip(numero);
  if (!animal) notFound();

  return (
    <Card>
      <div className="border-b border-line p-6">
        <h1 className="text-lg font-bold text-ink">
          <T fr="Contester cet enregistrement" mg="Hanohitra ity fisoratana ity" />
        </h1>
        <p className="mt-1 text-xs text-muted">
          Puce <span className="font-mono">{formatChip(animal.chipNumber)}</span> · <T {...speciesLabel(animal.species)} />
        </p>
      </div>
      <ActionForm
        action={disputeRecord.bind(null, animal.chipNumber)}
        className="space-y-4 p-6"
        successView={
          <ButtonLink href="/" variant="secondary">
            <T fr="Retour à l'accueil" mg="Hiverina amin'ny fandraisana" />
          </ButtonLink>
        }
      >
        <Alert tone="amber">
          <T
            fr="Utilisez ce formulaire si vous êtes le propriétaire légitime de cet animal, si les informations sont erronées ou si la puce semble enregistrée deux fois. Préparez un justificatif (certificat vétérinaire, carnet de santé, acte de cession)."
            mg="Ampiasao ity taratasy ity raha ianao no tena tompon'ity biby ity, raha diso ny fampahalalana, na raha toa voasoratra indroa ny puce. Omano porofo (taratasy avy amin'ny dokotera, karine fahasalamana, taratasy fanomezana na fivarotana)."
          />
        </Alert>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="reporterName" label={<T fr="Nom complet" mg="Anarana feno" />} required>
            <Input id="reporterName" name="reporterName" />
          </FormField>
          <FormField name="reporterContact" label={<T fr="Téléphone ou e-mail" mg="Telefaonina na mailaka" />} required>
            <Input id="reporterContact" name="reporterContact" />
          </FormField>
        </div>
        <FormField name="description" label={<T fr="Motif de la contestation" mg="Antony anoherana" />} required>
          <Textarea id="description" name="description" rows={6} placeholder={{ fr: "Décrivez la situation…", mg: "Lazalazao ny zava-misy…" }} />
        </FormField>
        <SubmitButton className="w-full">
          <T fr="Envoyer la contestation" mg="Alefaso ny fanoherana" />
        </SubmitButton>
      </ActionForm>
    </Card>
  );
}
