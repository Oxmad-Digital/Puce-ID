"use client";

import { changePassword, updateProfile, updateVetProfile } from "@/lib/actions/account";
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

export function ClinicForm(props: { clinicName: string; orderNumber: string; city: string; address: string | null; phone: string | null; listedPublicly: boolean }) {
  return (
    <ActionForm action={updateVetProfile} className="grid gap-4 sm:grid-cols-2">
      <FormField name="clinicName" label="Nom de la clinique">
        <Input id="clinicName" name="clinicName" defaultValue={props.clinicName} />
      </FormField>
      <FormField name="orderNumber" label="N° d'ordre" hint="Vérifié par l'équipe PawSafe — non modifiable.">
        <Input id="orderNumber" defaultValue={props.orderNumber} disabled className="bg-surface" />
      </FormField>
      <FormField name="address" label="Adresse">
        <Input id="address" name="address" defaultValue={props.address ?? ""} />
      </FormField>
      <FormField name="city" label="Ville">
        <Input id="city" name="city" defaultValue={props.city} />
      </FormField>
      <FormField name="clinicPhone" label="Téléphone de la clinique">
        <Input id="clinicPhone" name="clinicPhone" defaultValue={props.phone ?? ""} />
      </FormField>
      <label className="flex items-center gap-2 self-end pb-2 text-xs text-muted">
        <input type="checkbox" name="listedPublicly" defaultChecked={props.listedPublicly} className="size-4 accent-brand-600" />
        Apparaître dans l&apos;annuaire public des vétérinaires
      </label>
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
