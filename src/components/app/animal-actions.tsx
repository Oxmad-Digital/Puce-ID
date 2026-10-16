"use client";

import { declareDeath, declareLost, initiateClinicTransfer, initiateTransfer } from "@/lib/actions/animals";
import { Input, Select, Textarea } from "@/components/ui";
import { ActionForm, FormField, SubmitButton } from "@/components/forms/action-form";
import { T, useT } from "@/components/layout/lang-toggle";

export function DeclareLostForm({ animalId }: { animalId: string }) {
  return (
    <ActionForm action={declareLost.bind(null, animalId)} className="space-y-4">
      <FormField name="location" label={<T fr="Lieu de disparition" mg="Toerana nahaverezany" />} required>
        <Input id="location" name="location" placeholder={{ fr: "Quartier, ville", mg: "Fokontany, tanàna" }} />
      </FormField>
      <FormField name="occurredAt" label={<T fr="Date" mg="Daty" />}>
        <Input id="occurredAt" name="occurredAt" type="date" />
      </FormField>
      <FormField name="description" label={<T fr="Informations utiles" mg="Fampahalalana ilaina" />}
        hint={<T fr="Collier, comportement, signes distinctifs…" mg="Rojo an-tenda, toetra, mari-panondro manokana…" />}
      >
        <Textarea id="description" name="description" rows={3} />
      </FormField>
      <SubmitButton variant="danger" className="w-full">
        <T fr="Déclarer disparu" mg="Ambarao fa very" />
      </SubmitButton>
    </ActionForm>
  );
}

export function DeclareDeathForm({ animalId }: { animalId: string }) {
  return (
    <ActionForm action={declareDeath.bind(null, animalId)} className="space-y-4">
      <FormField name="deceasedAt" label={<T fr="Date du décès" mg="Daty nahafatesana" />}>
        <Input id="deceasedAt" name="deceasedAt" type="date" />
      </FormField>
      <FormField name="note" label={<T fr="Remarque" mg="Fanamarihana" />}>
        <Textarea id="note" name="note" rows={3} />
      </FormField>
      <SubmitButton className="w-full">
        <T fr="Enregistrer le décès" mg="Soraty ny fahafatesana" />
      </SubmitButton>
    </ActionForm>
  );
}

export function TransferForm({ animalId }: { animalId: string }) {
  return (
    <ActionForm action={initiateTransfer.bind(null, animalId)} className="space-y-4" resetOnSuccess>
      <p className="text-xs text-muted">
        <T
          fr="S'il n'a pas encore de compte, le nouveau propriétaire reçoit par e-mail un accès avec mot de passe provisoire."
          mg="Raha mbola tsy manana kaonty ny tompony vaovao, dia mahazo fidirana miaraka amin'ny teny miafina vonjimaika amin'ny mailaka izy."
        />
      </p>
      <FormField name="toName" label={<T fr="Nom du nouveau propriétaire" mg="Anaran'ny tompony vaovao" />} required>
        <Input id="toName" name="toName" />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="toEmail" label={<T fr="E-mail" mg="Mailaka" />} required>
          <Input id="toEmail" name="toEmail" type="email" />
        </FormField>
        <FormField name="toPhone" label={<T fr="Téléphone" mg="Telefaonina" />}>
          <Input id="toPhone" name="toPhone" type="tel" />
        </FormField>
      </div>
      <FormField name="reason" label={<T fr="Motif" mg="Antony" />}
        hint={<T fr="Don, vente, adoption, déménagement…" mg="Fanomezana, fivarotana, fandraisana ho tezaina, famindrana trano…" />}
      >
        <Input id="reason" name="reason" />
      </FormField>
      <SubmitButton className="w-full">
        <T fr="Envoyer la demande de transfert" mg="Alefaso ny fangatahana famindrana" />
      </SubmitButton>
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
  const t = useT();
  const options = clinics.filter((c) => c.id !== currentClinicId);
  return (
    <ActionForm action={initiateClinicTransfer.bind(null, animalId)} className="space-y-4" resetOnSuccess>
      <FormField name="toClinicId" label={<T fr="Nouvelle clinique responsable" mg="Toeram-pitsaboana tompon'andraikitra vaovao" />} required>
        <Select id="toClinicId" name="toClinicId" defaultValue="">
          <option value="" disabled>{t("Choisir une clinique…", "Misafidiana toeram-pitsaboana…")}</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.city}</option>
          ))}
        </Select>
      </FormField>
      <FormField name="reason" label={<T fr="Motif" mg="Antony" />}
        hint={<T fr="Déménagement, changement de vétérinaire…" mg="Famindrana trano, fiovana dokotera…" />}
      >
        <Input id="reason" name="reason" />
      </FormField>
      <p className="text-xs text-muted">
        <T
          fr="La demande sera examinée puis validée par l'administration de Puce ID."
          mg="Hodinihina sy hankatoavin'ny mpitantana ny Puce ID ny fangatahana."
        />
      </p>
      <SubmitButton className="w-full">
        <T fr="Envoyer la demande" mg="Alefaso ny fangatahana" />
      </SubmitButton>
    </ActionForm>
  );
}
