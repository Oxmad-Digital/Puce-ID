"use client";

import { changePassword, setInitialPassword, updateProfile } from "@/lib/actions/account";
import { Input } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { PasswordInput } from "./password-input";
import { T } from "@/components/layout/lang-toggle";

export function ProfileForm({ name, email, phone, city }: { name: string; email: string; phone: string | null; city: string | null }) {
  return (
    <ActionForm action={updateProfile} className="grid gap-4 sm:grid-cols-2">
      <FormField name="name" label={<T fr="Nom complet" mg="Anarana feno" />}>
        <Input id="name" name="name" defaultValue={name} />
      </FormField>
      <FormField name="email" label={<T fr="E-mail" mg="Mailaka" />}
        hint={<T fr="Contactez-nous pour modifier votre adresse e-mail." mg="Mifandraisa aminay raha hanova ny adiresy mailakao." />}>
        <Input id="email" defaultValue={email} disabled className="bg-surface" />
      </FormField>
      <FormField name="phone" label={<T fr="Téléphone" mg="Telefaonina" />}>
        <Input id="phone" name="phone" defaultValue={phone ?? ""} />
      </FormField>
      <FormField name="city" label={<T fr="Ville" mg="Tanàna" />}>
        <Input id="city" name="city" defaultValue={city ?? ""} />
      </FormField>
      <div className="sm:col-span-2"><SubmitButton><T fr="Enregistrer" mg="Tehirizo" /></SubmitButton></div>
    </ActionForm>
  );
}

export function PasswordForm() {
  return (
    <ActionForm action={changePassword} className="grid gap-4 sm:grid-cols-3" resetOnSuccess>
      <FormField name="currentPassword" label={<T fr="Mot de passe actuel" mg="Teny miafina ankehitriny" />}>
        <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" />
      </FormField>
      <FormField name="newPassword" label={<T fr="Nouveau mot de passe" mg="Teny miafina vaovao" />}>
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" />
      </FormField>
      <FormField name="confirm" label={<T fr="Confirmer" mg="Hamafiso" />}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
      </FormField>
      <div className="sm:col-span-3"><SubmitButton variant="secondary">
          <T fr="Changer le mot de passe" mg="Hanova ny teny miafina" />
        </SubmitButton></div>
    </ActionForm>
  );
}

/** Première connexion d'un compte invité : choix du mot de passe définitif. */
export function FirstLoginForm() {
  return (
    <ActionForm action={setInitialPassword} className="space-y-4" redirectTo="/espace">
      <FormField name="newPassword" label={<T fr="Nouveau mot de passe" mg="Teny miafina vaovao" />}
        hint={<T fr="8 caractères minimum." mg="Litera 8 farafahakeliny." />}
      >
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" />
      </FormField>
      <FormField name="confirm" label={<T fr="Confirmer le mot de passe" mg="Hamafiso ny teny miafina" />}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" />
      </FormField>
      <SubmitButton size="lg" className="w-full">
        <T fr="Enregistrer et continuer" mg="Tehirizo ary tohizo" />
      </SubmitButton>
    </ActionForm>
  );
}
