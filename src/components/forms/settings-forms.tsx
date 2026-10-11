"use client";

import { changePassword, setInitialPassword, updateProfile } from "@/lib/actions/account";
import { Input } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { PasswordInput } from "./password-input";

export function ProfileForm({ name, email, phone, city }: { name: string; email: string; phone: string | null; city: string | null }) {
  return (
    <ActionForm action={updateProfile} className="grid gap-4 sm:grid-cols-2">
      <FormField name="name" label="Nom complet">
        <Input id="name" name="name" defaultValue={name} />
      </FormField>
      <FormField name="email" label="Email" hint="Contactez-nous pour modifier votre adresse e-mail.">
        <Input id="email" defaultValue={email} disabled className="bg-surface" />
      </FormField>
      <FormField name="phone" label="Téléphone">
        <Input id="phone" name="phone" defaultValue={phone ?? ""} />
      </FormField>
      <FormField name="city" label="Ville">
        <Input id="city" name="city" defaultValue={city ?? ""} />
      </FormField>
      <div className="sm:col-span-2"><SubmitButton>Enregistrer</SubmitButton></div>
    </ActionForm>
  );
}

export function PasswordForm() {
  return (
    <ActionForm action={changePassword} className="grid gap-4 sm:grid-cols-3" resetOnSuccess>
      <FormField name="currentPassword" label="Mot de passe actuel">
        <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" />
      </FormField>
      <FormField name="newPassword" label="Nouveau mot de passe">
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" />
      </FormField>
      <FormField name="confirm" label="Confirmer">
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
      </FormField>
      <div className="sm:col-span-3"><SubmitButton variant="secondary">Changer le mot de passe</SubmitButton></div>
    </ActionForm>
  );
}

/** Première connexion d'un compte invité : choix du mot de passe définitif. */
export function FirstLoginForm() {
  return (
    <ActionForm action={setInitialPassword} className="space-y-4" redirectTo="/espace">
      <FormField name="newPassword" label="Nouveau mot de passe" hint="8 caractères minimum.">
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" />
      </FormField>
      <FormField name="confirm" label="Confirmer le mot de passe">
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
      </FormField>
      <SubmitButton size="lg" className="w-full">Enregistrer et continuer</SubmitButton>
    </ActionForm>
  );
}
