"use client";

import { sendContactForm } from "@/lib/actions/public";
import { Input, Select, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { T, useT } from "@/components/layout/lang-toggle";

const SUBJECTS = [
  ["Question générale", "Fanontaniana ankapobeny"],
  ["Compte vétérinaire", "Kaonty dokotera mpitsabo biby"],
  ["Erreur dans une fiche", "Fahadisoana amin'ny fiche iray"],
  ["Données personnelles", "Angona manokana"],
  ["Partenariat", "Fiaraha-miasa"],
] as const;

export function ContactForm() {
  const t = useT();
  return (
    <ActionForm action={sendContactForm} className="space-y-4" resetOnSuccess>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="name" label={<T fr="Nom complet" mg="Anarana feno" />} required>
          <Input id="name" name="name" />
        </FormField>
        <FormField name="email" label={<T fr="E-mail" mg="Mailaka" />} required>
          <Input id="email" name="email" type="email" />
        </FormField>
        <FormField name="phone" label={<T fr="Téléphone" mg="Telefaonina" />}>
          <Input id="phone" name="phone" placeholder="+261 34 00 000 00" />
        </FormField>
        <FormField name="subject" label={<T fr="Sujet" mg="Lohahevitra" />} required>
          <Select id="subject" name="subject" defaultValue="Question générale">
            {SUBJECTS.map(([fr, mg]) => (
              <option key={fr} value={fr}>
                {t(fr, mg)}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <FormField name="message" label={<T fr="Message" mg="Hafatra" />} required>
        <Textarea id="message" name="message" rows={6} />
      </FormField>
      <SubmitButton><T fr="Envoyer" mg="Alefaso" /></SubmitButton>
    </ActionForm>
  );
}
