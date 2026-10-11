"use client";

import { declareDeath, declareLost, initiateClinicTransfer, initiateTransfer } from "@/lib/actions/animals";
import { Input, Select, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "@/components/forms/action-form";

export function DeclareLostForm({ animalId }: { animalId: string }) {
  return (
    <ActionForm action={declareLost.bind(null, animalId)} className="space-y-4">
      <FormField name="location" label="Lieu de disparition" required>
        <Input id="location" name="location" placeholder="Quartier, ville" />
      </FormField>
      <FormField name="occurredAt" label="Date">
        <Input id="occurredAt" name="occurredAt" type="date" />
      </FormField>
      <FormField name="description" label="Informations utiles" hint="Collier, comportement, signes distinctifs…">
        <Textarea id="description" name="description" rows={3} />
      </FormField>
      <SubmitButton variant="danger" className="w-full">Déclarer disparu</SubmitButton>
    </ActionForm>
  );
}

export function DeclareDeathForm({ animalId }: { animalId: string }) {
  return (
    <ActionForm action={declareDeath.bind(null, animalId)} className="space-y-4">
      <FormField name="deceasedAt" label="Date du décès">
        <Input id="deceasedAt" name="deceasedAt" type="date" />
      </FormField>
      <FormField name="note" label="Remarque">
        <Textarea id="note" name="note" rows={3} />
      </FormField>
      <SubmitButton className="w-full">Enregistrer le décès</SubmitButton>
    </ActionForm>
  );
}

export function TransferForm({ animalId }: { animalId: string }) {
  return (
    <ActionForm action={initiateTransfer.bind(null, animalId)} className="space-y-4" resetOnSuccess>
      <p className="text-xs text-muted">
        S&apos;il n&apos;a pas encore de compte, le nouveau propriétaire reçoit par e-mail un accès avec mot de passe provisoire.
      </p>
      <FormField name="toName" label="Nom du nouveau propriétaire" required>
        <Input id="toName" name="toName" />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="toEmail" label="Email" required>
          <Input id="toEmail" name="toEmail" type="email" />
        </FormField>
        <FormField name="toPhone" label="Téléphone">
          <Input id="toPhone" name="toPhone" type="tel" />
        </FormField>
      </div>
      <FormField name="reason" label="Motif" hint="Don, vente, adoption, déménagement…">
        <Input id="reason" name="reason" />
      </FormField>
      <SubmitButton className="w-full">Envoyer la demande de transfert</SubmitButton>
    </ActionForm>
  );
}

export function ClinicTransferForm({
  animalId,
  currentClinicId,
  clinics,
}: {
  animalId: string;
  currentClinicId: string | null;
  clinics: { id: string; name: string; city: string }[];
}) {
  const options = clinics.filter((c) => c.id !== currentClinicId);
  return (
    <ActionForm action={initiateClinicTransfer.bind(null, animalId)} className="space-y-4" resetOnSuccess>
      <FormField name="toClinicId" label="Nouvelle clinique responsable" required>
        <Select id="toClinicId" name="toClinicId" defaultValue="">
          <option value="" disabled>Choisir une clinique…</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
          ))}
        </Select>
      </FormField>
      <FormField name="reason" label="Motif" hint="Déménagement, changement de vétérinaire…">
        <Input id="reason" name="reason" />
      </FormField>
      <p className="text-xs text-muted">La clinique choisie est prévenue par e-mail et doit accepter la demande.</p>
      <SubmitButton className="w-full">Envoyer la demande</SubmitButton>
    </ActionForm>
  );
}
