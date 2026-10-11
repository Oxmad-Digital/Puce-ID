"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/account";
import { Alert, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ActionForm, FormField, SubmitButton, useFormState } from "./action-form";
import { PasswordInput } from "./password-input";

function TermsCheckbox() {
  const { state } = useFormState();
  return (
    <div>
      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" name="terms" className="mt-0.5 size-4 rounded accent-brand-600" />
        <span>
          J&apos;accepte les <Link href="/cgu" className="font-medium text-brand-600 hover:underline">CGU</Link> et la{" "}
          <Link href="/confidentialite" className="font-medium text-brand-600 hover:underline">politique de confidentialité</Link>
        </span>
      </label>
      {state.fieldErrors?.terms && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.terms}</p>}
    </div>
  );
}

export function SignupForm({ defaultRole = "owner" }: { defaultRole?: "owner" | "vet" }) {
  const [role, setRole] = useState(defaultRole);
  return (
    <ActionForm action={signUp} className="space-y-3.5" redirectTo="/espace">
      <input type="hidden" name="role" value={role} />
      <div>
        <span className="field-label">Vous êtes</span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["owner", "Propriétaire"],
              ["vet", "Vétérinaire"],
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
      <FormField name="name" label="Nom complet">
        <Input id="name" name="name" autoComplete="name" placeholder="Ex. Rasoa Andrianina" />
      </FormField>
      <FormField name="email" label="Email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="nom@exemple.mg" />
      </FormField>
      <FormField name="phone" label="Téléphone">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+261 34 00 000 00" />
      </FormField>
      {role === "vet" && (
        <>
          <FormField name="clinicName" label="Clinique">
            <Input id="clinicName" name="clinicName" placeholder="Ex. Clinique Ambohijatovo" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField name="orderNumber" label="N° d'ordre">
              <Input id="orderNumber" name="orderNumber" placeholder="1234" />
            </FormField>
            <FormField name="city" label="Ville">
              <Input id="city" name="city" placeholder="Antananarivo" />
            </FormField>
          </div>
        </>
      )}
      <FormField name="password" label="Mot de passe">
        <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="8 caractères minimum" />
      </FormField>
      <FormField name="confirm" label="Confirmer le mot de passe">
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" placeholder="Retapez le mot de passe" />
      </FormField>
      {role === "vet" && (
        <Alert tone="brand">
          Compte vétérinaire : votre numéro d&apos;ordre sera vérifié par notre équipe avant l&apos;accès aux
          coordonnées des propriétaires et l&apos;enregistrement de puces.
        </Alert>
      )}
      <TermsCheckbox />
      <SubmitButton size="lg" className="w-full">Créer mon compte</SubmitButton>
    </ActionForm>
  );
}
