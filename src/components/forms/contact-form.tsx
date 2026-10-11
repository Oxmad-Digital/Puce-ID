"use client";

import { sendContactForm } from "@/lib/actions/public";
import { Input, Select, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "./action-form";

export function ContactForm() {
  return (
    <ActionForm action={sendContactForm} className="space-y-4" resetOnSuccess>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="name" label="Nom complet" required>
          <Input id="name" name="name" />
        </FormField>
        <FormField name="email" label="E-mail" required>
          <Input id="email" name="email" type="email" />
        </FormField>
        <FormField name="phone" label="Téléphone">
          <Input id="phone" name="phone" placeholder="+261 34 00 000 00" />
        </FormField>
        <FormField name="subject" label="Sujet" required>
          <Select id="subject" name="subject" defaultValue="Question générale">
            <option>Question générale</option>
            <option>Compte vétérinaire</option>
            <option>Erreur dans une fiche</option>
            <option>Données personnelles</option>
            <option>Partenariat</option>
          </Select>
        </FormField>
      </div>
      <FormField name="message" label="Message" required>
        <Textarea id="message" name="message" rows={6} />
      </FormField>
      <SubmitButton>Envoyer</SubmitButton>
    </ActionForm>
  );
}
