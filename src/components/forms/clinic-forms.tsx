"use client";

import { inviteClinic, inviteColleague, updateClinic } from "@/lib/actions/clinics";
import { Input } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "./action-form";

type ClinicValues = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  listedPublicly: boolean;
};

function ClinicFields({ values }: { values?: Omit<ClinicValues, "id"> }) {
  return (
    <>
      <FormField name="clinicName" label="Nom de la clinique" required>
        <Input id="clinicName" name="clinicName" defaultValue={values?.name} placeholder="Ex. Clinique Ambohijatovo" />
      </FormField>
      <FormField name="city" label="Ville" required>
        <Input id="city" name="city" defaultValue={values?.city} placeholder="Antananarivo" />
      </FormField>
      <FormField name="address" label="Adresse">
        <Input id="address" name="address" defaultValue={values?.address ?? ""} />
      </FormField>
      <FormField name="clinicPhone" label="Téléphone de la clinique">
        <Input id="clinicPhone" name="clinicPhone" type="tel" defaultValue={values?.phone ?? ""} />
      </FormField>
      <FormField name="clinicEmail" label="E-mail de la clinique" hint="Reçoit aussi les demandes de changement de clinique.">
        <Input id="clinicEmail" name="clinicEmail" type="email" defaultValue={values?.email ?? ""} />
      </FormField>
      <label className="flex items-center gap-2 self-end pb-2 text-xs text-muted">
        <input type="checkbox" name="listedPublicly" defaultChecked={values?.listedPublicly ?? true} className="size-4 accent-brand-600" />
        Apparaître dans l&apos;annuaire public des vétérinaires
      </label>
    </>
  );
}

export function ClinicForm({ clinic }: { clinic: ClinicValues }) {
  return (
    <ActionForm action={updateClinic.bind(null, clinic.id)} className="grid gap-4 sm:grid-cols-2">
      <ClinicFields values={clinic} />
      <div className="sm:col-span-2"><SubmitButton>Enregistrer</SubmitButton></div>
    </ActionForm>
  );
}

function VetFields() {
  return (
    <>
      <FormField name="vetName" label="Nom du vétérinaire" required>
        <Input id="vetName" name="vetName" autoComplete="off" placeholder="Prénom Nom" />
      </FormField>
      <FormField name="vetEmail" label="E-mail" required hint="Les identifiants provisoires sont envoyés à cette adresse.">
        <Input id="vetEmail" name="vetEmail" type="email" autoComplete="off" />
      </FormField>
      <FormField name="vetPhone" label="Téléphone">
        <Input id="vetPhone" name="vetPhone" type="tel" />
      </FormField>
      <FormField name="orderNumber" label="N° d'ordre" required>
        <Input id="orderNumber" name="orderNumber" />
      </FormField>
    </>
  );
}

/** Administration : inviter une nouvelle clinique et son vétérinaire responsable. */
export function InviteClinicForm() {
  return (
    <ActionForm action={inviteClinic} className="space-y-5" resetOnSuccess>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold text-ink">Clinique</legend>
        <ClinicFields />
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold text-ink">Vétérinaire responsable</legend>
        <VetFields />
      </fieldset>
      <p className="text-xs text-muted">
        Un compte vérifié est créé avec un mot de passe provisoire, envoyé par e-mail. Le vétérinaire choisira son
        propre mot de passe à la première connexion.
      </p>
      <SubmitButton className="w-full">Envoyer l&apos;invitation</SubmitButton>
    </ActionForm>
  );
}

/** Responsable de clinique : inviter un confrère. */
export function InviteColleagueForm({ clinicId, byAdmin = false }: { clinicId: string; byAdmin?: boolean }) {
  return (
    <ActionForm action={inviteColleague.bind(null, clinicId)} className="space-y-4" resetOnSuccess>
      <div className="grid gap-4 sm:grid-cols-2">
        <VetFields />
      </div>
      <label className="flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" name="manager" className="size-4 accent-brand-600" />
        Responsable de la clinique (peut modifier la clinique et inviter des confrères)
      </label>
      <p className="text-xs text-muted">
        Un mot de passe provisoire est envoyé par e-mail.
        {!byAdmin && " Le numéro d'ordre sera vérifié par l'équipe Puce ID avant l'activation des accès professionnels."}
      </p>
      <SubmitButton className="w-full">Envoyer l&apos;invitation</SubmitButton>
    </ActionForm>
  );
}
