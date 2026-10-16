"use client";

import { inviteClinic, inviteColleague, updateClinic } from "@/lib/actions/clinics";
import { Input } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { T } from "@/components/layout/lang-toggle";

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
      <FormField name="clinicName" label={<T fr="Nom de la clinique" mg="Anaran'ny toeram-pitsaboana" />} required>
        <Input id="clinicName" name="clinicName" defaultValue={values?.name} placeholder={{ fr: "Ex. Clinique Ambohijatovo", mg: "Ohatra : Clinique Ambohijatovo" }} />
      </FormField>
      <FormField name="city" label={<T fr="Ville" mg="Tanàna" />} required>
        <Input id="city" name="city" defaultValue={values?.city} placeholder="Antananarivo" />
      </FormField>
      <FormField name="address" label={<T fr="Adresse" mg="Adiresy" />}>
        <Input id="address" name="address" defaultValue={values?.address ?? ""} />
      </FormField>
      <FormField name="clinicPhone" label={<T fr="Téléphone de la clinique" mg="Telefaonin'ny toeram-pitsaboana" />}>
        <Input id="clinicPhone" name="clinicPhone" type="tel" defaultValue={values?.phone ?? ""} />
      </FormField>
      <FormField name="clinicEmail" label={<T fr="E-mail de la clinique" mg="Mailaky ny toeram-pitsaboana" />}
        hint={
          <T
            fr="Reçoit aussi les demandes de changement de clinique."
            mg="Mandray koa ny fangatahana fiovana toeram-pitsaboana."
          />
        }>
        <Input id="clinicEmail" name="clinicEmail" type="email" defaultValue={values?.email ?? ""} />
      </FormField>
      <label className="flex items-center gap-2 self-end pb-2 text-xs text-muted">
        <input type="checkbox" name="listedPublicly" defaultChecked={values?.listedPublicly ?? true} className="size-4 accent-brand-600" />
        <T
          fr="Apparaître dans l'annuaire public des vétérinaires"
          mg="Hiseho ao amin'ny lisitra ho an'ny besinimaro misy ireo dokotera mpitsabo biby"
        />
      </label>
    </>
  );
}

export function ClinicForm({ clinic }: { clinic: ClinicValues }) {
  return (
    <ActionForm action={updateClinic.bind(null, clinic.id)} className="grid gap-4 sm:grid-cols-2">
      <ClinicFields values={clinic} />
      <div className="sm:col-span-2"><SubmitButton><T fr="Enregistrer" mg="Tehirizo" /></SubmitButton></div>
    </ActionForm>
  );
}

function VetFields() {
  return (
    <>
      <FormField name="vetName" label={<T fr="Nom du vétérinaire" mg="Anaran'ny dokotera mpitsabo biby" />} required>
        <Input id="vetName" name="vetName" autoComplete="off" placeholder={{ fr: "Prénom Nom", mg: "Fanampin'anarana Anarana" }} />
      </FormField>
      <FormField name="vetEmail" label={<T fr="E-mail" mg="Mailaka" />}
        required
        hint={
          <T
            fr="Les identifiants provisoires sont envoyés à cette adresse."
            mg="Alefa amin'io adiresy io ny fanondroana fidirana vonjimaika."
          />
        }>
        <Input id="vetEmail" name="vetEmail" type="email" autoComplete="off" />
      </FormField>
      <FormField name="vetPhone" label={<T fr="Téléphone" mg="Telefaonina" />}>
        <Input id="vetPhone" name="vetPhone" type="tel" />
      </FormField>
      <FormField name="orderNumber" label={<T fr="N° d'ordre" mg="Laharana (Ordre)" />} required>
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
        <legend className="mb-3 text-sm font-semibold text-ink">
          <T fr="Clinique" mg="Toeram-pitsaboana" />
        </legend>
        <ClinicFields />
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold text-ink">
          <T fr="Vétérinaire responsable" mg="Dokotera tompon'andraikitra" />
        </legend>
        <VetFields />
      </fieldset>
      <p className="text-xs text-muted">
        <T
          fr="Un compte vérifié est créé avec un mot de passe provisoire, envoyé par e-mail. Le vétérinaire choisira son propre mot de passe à la première connexion."
          mg="Mamorona kaonty voamarina miaraka amin'ny teny miafina vonjimaika alefa amin'ny mailaka. Hisafidy ny teny miafiny manokana ny dokotera amin'ny fidirany voalohany."
        />
      </p>
      <SubmitButton className="w-full">
        <T fr="Envoyer l'invitation" mg="Alefaso ny fanasana" />
      </SubmitButton>
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
        <T
          fr="Responsable de la clinique (peut modifier la clinique et inviter des confrères)"
          mg="Tompon'andraikitry ny toeram-pitsaboana (afaka manova ny toeram-pitsaboana sy manasa mpiara-miasa)"
        />
      </label>
      <p className="text-xs text-muted">
        <T fr="Un mot de passe provisoire est envoyé par e-mail." mg="Alefa amin'ny mailaka ny teny miafina vonjimaika." />
        {!byAdmin && (
          <>
            {" "}
            <T
              fr="Le numéro d'ordre sera vérifié par l'équipe Puce ID avant l'activation des accès professionnels."
              mg="Hamarinin'ny ekipan'ny Puce ID ny laharana ao amin'ny Holafitra (Ordre) alohan'ny hampandehanana ny fidirana matihanina."
            />
          </>
        )}
      </p>
      <SubmitButton className="w-full">
        <T fr="Envoyer l'invitation" mg="Alefaso ny fanasana" />
      </SubmitButton>
    </ActionForm>
  );
}
