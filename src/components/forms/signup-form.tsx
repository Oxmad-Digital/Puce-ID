"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/account";
import { Alert, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ActionForm, FormField, SubmitButton, useFormState } from "./action-form";
import { PasswordInput } from "./password-input";
import { T, useLang } from "@/components/layout/lang-toggle";
import { translateMessage } from "@/lib/messages-mg";

function TermsCheckbox() {
  const { state } = useFormState();
  const lang = useLang();
  return (
    <div>
      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" name="terms" className="mt-0.5 size-4 rounded accent-brand-600" />
        <span>
          <T fr="J'accepte les" mg="Ekeko ny" />{" "}
          <Link href="/cgu" className="font-medium text-brand-600 hover:underline">
            <T fr="CGU" mg="fepetra ankapobeny" />
          </Link>{" "}
          <T fr="et la" mg="sy ny" />{" "}
          <Link href="/confidentialite" className="font-medium text-brand-600 hover:underline">
            <T fr="politique de confidentialité" mg="politika momba ny fiarovana ny tsiambaratelo" />
          </Link>
        </span>
      </label>
      {state.fieldErrors?.terms && <p className="mt-1 text-xs text-red-600">{translateMessage(state.fieldErrors.terms, lang)}</p>}
    </div>
  );
}

export function SignupForm({ defaultRole = "owner" }: { defaultRole?: "owner" | "vet" }) {
  const [role, setRole] = useState(defaultRole);
  return (
    <ActionForm action={signUp} className="space-y-3.5" redirectTo="/espace">
      <input type="hidden" name="role" value={role} />
      <div>
        <span className="field-label"><T fr="Vous êtes" mg="Ianao dia" /></span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["owner", <T key="o" fr="Propriétaire" mg="Tompon'biby" />],
              ["vet", <T key="v" fr="Vétérinaire" mg="Dokotera mpitsabo biby" />],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              aria-pressed={role === value}
              className={cn(
                "rounded-lg border py-2 text-xs font-semibold transition-colors",
                role === value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-line text-muted hover:border-brand-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <FormField name="name" label={<T fr="Nom complet" mg="Anarana feno" />}>
        <Input id="name" name="name" autoComplete="name" placeholder={{ fr: "Ex. Rasoa Andrianina", mg: "Ohatra : Rasoa Andrianina" }} />
      </FormField>
      <FormField name="email" label={<T fr="E-mail" mg="Mailaka" />}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder={{ fr: "nom@exemple.mg", mg: "anarana@ohatra.mg" }} />
      </FormField>
      <FormField name="phone" label={<T fr="Téléphone" mg="Telefaonina" />}>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+261 34 00 000 00" />
      </FormField>
      {role === "vet" && (
        <>
          <FormField name="clinicName" label={<T fr="Clinique" mg="Toeram-pitsaboana" />}>
            <Input id="clinicName" name="clinicName" placeholder={{ fr: "Ex. Clinique Ambohijatovo", mg: "Ohatra : Clinique Ambohijatovo" }} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField name="orderNumber" label={<T fr="N° d'ordre" mg="Laharana (Ordre)" />}>
              <Input id="orderNumber" name="orderNumber" placeholder="1234" />
            </FormField>
            <FormField name="city" label={<T fr="Ville" mg="Tanàna" />}>
              <Input id="city" name="city" placeholder="Antananarivo" />
            </FormField>
          </div>
        </>
      )}
      <FormField name="password" label={<T fr="Mot de passe" mg="Teny miafina" />}>
        <PasswordInput id="password" name="password" autoComplete="new-password" placeholder={{ fr: "8 caractères minimum", mg: "Litera 8 farafahakeliny" }} />
      </FormField>
      <FormField name="confirm" label={<T fr="Confirmer le mot de passe" mg="Hamafiso ny teny miafina" />}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" placeholder={{ fr: "Retapez le mot de passe", mg: "Soraty indray ny teny miafina" }} />
      </FormField>
      {role === "vet" && (
        <Alert tone="brand">
          <T
            fr="Compte vétérinaire : votre numéro d'ordre sera vérifié par notre équipe avant l'accès aux coordonnées des propriétaires et l'enregistrement de puces."
            mg="Kaonty dokotera mpitsabo biby : hamarinin'ny ekipanay ny laharanao ao amin'ny Holafitra (Ordre) alohan'ny hahazoanao mijery ny fifandraisana amin'ny tompon'biby sy manoratra puce."
          />
        </Alert>
      )}
      <TermsCheckbox />
      <SubmitButton size="lg" className="w-full"><T fr="Créer mon compte" mg="Hamorona ny kaontiko" /></SubmitButton>
    </ActionForm>
  );
}
