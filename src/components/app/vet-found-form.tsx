"use client";

import { vetDeclareFound } from "@/lib/actions/animals";
import { Input, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "@/components/forms/action-form";

export function VetFoundForm({ defaultChip }: { defaultChip?: string }) {
  return (
    <ActionForm action={vetDeclareFound} className="space-y-4" refresh={false}>
      <FormField name="chipNumber" label="Numéro de puce" required>
        <Input id="chipNumber" name="chipNumber" inputMode="numeric" defaultValue={defaultChip} className="font-mono" placeholder="450200000123456" />
      </FormField>
      <FormField name="description" label="État de l'animal / remarques">
        <Textarea id="description" name="description" rows={3} />
      </FormField>
      <SubmitButton className="w-full">Déclarer l&apos;animal trouvé</SubmitButton>
    </ActionForm>
  );
}
