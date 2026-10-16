"use client";

import { vetDeclareFound } from "@/lib/actions/animals";
import { Input, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "@/components/forms/action-form";
import { T } from "@/components/layout/lang-toggle";

export function VetFoundForm({ defaultChip }: { defaultChip?: string }) {
  return (
    <ActionForm action={vetDeclareFound} className="space-y-4" refresh={false}>
      <FormField name="chipNumber" label={<T fr="Numéro de puce" mg="Laharan'ny puce" />} required>
        <Input id="chipNumber" name="chipNumber" inputMode="numeric" defaultValue={defaultChip} className="font-mono" placeholder="450200000123456" />
      </FormField>
      <FormField name="description" label={<T fr="État de l'animal / remarques" mg="Toetry ny biby / fanamarihana" />}>
        <Textarea id="description" name="description" rows={3} />
      </FormField>
      <SubmitButton className="w-full">
        <T fr="Déclarer l'animal trouvé" mg="Ambarao fa hita ny biby" />
      </SubmitButton>
    </ActionForm>
  );
}
