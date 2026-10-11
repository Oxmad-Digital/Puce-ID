import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { findPublicChip } from "@/lib/data/queries";
import { contactOwner } from "@/lib/actions/public";
import { formatChip } from "@/lib/utils";
import { Avatar, ButtonLink, Card, Input, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "@/components/forms/action-form";

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
          <h1 className="text-lg font-bold text-ink">Contacter le propriétaire</h1>
          <p className="text-xs text-muted">
            {animal.species} · puce <span className="font-mono">{formatChip(animal.chipNumber)}</span>
          </p>
        </div>
      </div>
      <ActionForm
        action={contactOwner.bind(null, animal.chipNumber)}
        className="space-y-4 p-6"
        successView={<ButtonLink href="/" variant="secondary">Retour à l&apos;accueil</ButtonLink>}
      >
        <div className="flex gap-2 rounded-lg bg-brand-50 p-3 text-xs text-brand-800">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          Votre message est relayé par PawSafe. Le propriétaire reçoit vos coordonnées pour vous
          répondre, mais les siennes restent confidentielles.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="senderName" label="Votre nom">
            <Input id="senderName" name="senderName" placeholder="Ex. Hery Randria" />
          </FormField>
          <FormField name="senderContact" label="Téléphone ou e-mail" required>
            <Input id="senderContact" name="senderContact" placeholder="+261 34 00 000 00" />
          </FormField>
        </div>
        <FormField name="message" label="Message" required hint="Où et quand avez-vous vu l'animal ? Est-il en sécurité ?">
          <Textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Bonjour, j'ai trouvé votre animal près du marché d'Analakely…"
          />
        </FormField>
        <SubmitButton className="w-full">Envoyer le message</SubmitButton>
      </ActionForm>
    </Card>
  );
}
