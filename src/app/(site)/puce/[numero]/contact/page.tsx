import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { findPublicChip } from "@/lib/data/queries";
import { contactOwner } from "@/lib/actions/public";
import { formatChip } from "@/lib/utils";
import { speciesLabel } from "@/lib/labels";
import { Avatar, ButtonLink, Card, Input, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "@/components/forms/action-form";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Contacter le propriétaire" };

export default async function ContactOwnerPage({ params }: PageProps<"/puce/[numero]/contact">) {
  const { numero } = await params;
  const animal = await findPublicChip(numero);
  if (!animal) notFound();

  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-line p-6">
        <Avatar name={animal.name} size="lg" />
        <div>
          <h1 className="text-lg font-bold text-ink">
            <T fr="Contacter le propriétaire" mg="Hifandray amin'ny tompony" />
          </h1>
          <p className="text-xs text-muted">
            <T {...speciesLabel(animal.species)} /> · puce <span className="font-mono">{formatChip(animal.chipNumber)}</span>
          </p>
        </div>
      </div>
      <ActionForm
        action={contactOwner.bind(null, animal.chipNumber)}
        className="space-y-4 p-6"
        successView={
          <ButtonLink href="/" variant="secondary">
            <T fr="Retour à l'accueil" mg="Hiverina amin'ny fandraisana" />
          </ButtonLink>
        }
      >
        <div className="flex gap-2 rounded-lg bg-brand-50 p-3 text-xs text-brand-800">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          <T
            fr="Votre message est relayé par Puce ID. Le propriétaire reçoit vos coordonnées pour vous répondre, mais les siennes restent confidentielles."
            mg="Ny Puce ID no mampita ny hafatrao. Raisin'ny tompony ny fifandraisana aminao mba hamaliany anao, fa mijanona ho tsiambaratelo kosa ny azy."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="senderName" label={<T fr="Votre nom" mg="Ny anaranao" />}>
            <Input id="senderName" name="senderName" placeholder={{ fr: "Ex. Hery Randria", mg: "Ohatra : Hery Randria" }} />
          </FormField>
          <FormField name="senderContact" label={<T fr="Téléphone ou e-mail" mg="Telefaonina na mailaka" />} required>
            <Input id="senderContact" name="senderContact" placeholder="+261 34 00 000 00" />
          </FormField>
        </div>
        <FormField name="message" label={<T fr="Message" mg="Hafatra" />}
          required
          hint={<T fr="Où et quand avez-vous vu l'animal ? Est-il en sécurité ?" mg="Taiza ary oviana no nahitanao ilay biby ? Azo antoka ve ny fiarovana azy ?" />}
        >
          <Textarea
            id="message"
            name="message"
            rows={5}
            placeholder={{
              fr: "Bonjour, j'ai trouvé votre animal près du marché d'Analakely…",
              mg: "Manao ahoana, nahita ny bibinao teo akaikin'ny tsenan'Analakely aho…",
            }}
          />
        </FormField>
        <SubmitButton className="w-full">
          <T fr="Envoyer le message" mg="Alefaso ny hafatra" />
        </SubmitButton>
      </ActionForm>
    </Card>
  );
}
