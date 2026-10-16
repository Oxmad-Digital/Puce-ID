"use client";

import { useState } from "react";
import { declareLostFound } from "@/lib/actions/public";
import { SPECIES, SPECIES_MG } from "@/lib/labels";
import { T, useT } from "@/components/layout/lang-toggle";
import { Input, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { PhotoUpload } from "./file-upload";

export function LostFoundForm({
  defaultType = "found",
  defaultChip,
  defaultName,
  defaultContact,
}: {
  defaultType?: "lost" | "found";
  defaultChip?: string;
  defaultName?: string;
  defaultContact?: string;
}) {
  const [type, setType] = useState(defaultType);
  const t = useT();
  return (
    <ActionForm action={declareLostFound} className="space-y-4" resetOnSuccess>
      <input type="hidden" name="type" value={type} />
      <div className="inline-flex rounded-lg bg-surface p-1 ring-1 ring-line">
        {(
          [
            ["found", <T key="f" fr="J'ai trouvé un animal" mg="Nahita biby aho" />],
            ["lost", <T key="l" fr="J'ai perdu mon animal" mg="Very ny bibiko" />],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={cn(
              "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
              type === value ? "bg-white text-brand-700 shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="chipNumber" label={<T fr="Numéro de puce (si connu)" mg="Laharan'ny puce (raha fantatra)" />}
          hint={<T fr="15 chiffres, lisible par tout vétérinaire." mg="Isa 15, azon'ny dokotera mpitsabo biby rehetra vakiana." />}>
          <Input id="chipNumber" name="chipNumber" inputMode="numeric" defaultValue={defaultChip} placeholder="450200000123456" />
        </FormField>
        <FormField name="species" label={<T fr="Espèce" mg="Karazana" />} required>
          <Select id="species" name="species" defaultValue="">
            <option value="" disabled>{t("Choisir…", "Misafidiana…")}</option>
            {SPECIES.map((s) => (
              <option key={s} value={s}>
                {t(s, SPECIES_MG[s] ?? s)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField name="location" label={
            type === "found" ? (
              <T fr="Lieu où il a été trouvé" mg="Toerana nahitana azy" />
            ) : (
              <T fr="Lieu de disparition" mg="Toerana nahaverezany" />
            )
          } required>
          <Input id="location" name="location" placeholder={{ fr: "Quartier, ville", mg: "Fokontany, tanàna" }} />
        </FormField>
        <FormField name="occurredAt" label={<T fr="Date" mg="Daty" />} required>
          <Input id="occurredAt" name="occurredAt" type="date" />
        </FormField>
      </div>
      <FormField name="description" label={<T fr="Description" mg="Famaritana" />} required>
        <Textarea id="description" name="description" placeholder={{ fr: "Couleur, taille, collier, comportement…", mg: "Loko, habe, rojo an-tenda, toetra…" }} />
      </FormField>
      <FormField name="photoKey" label={<T fr="Photo" mg="Sary" />}>
        <PhotoUpload name="photoKey" folder="reports" />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="reporterName" label={<T fr="Votre nom" mg="Ny anaranao" />} required>
          <Input id="reporterName" name="reporterName" defaultValue={defaultName} />
        </FormField>
        <FormField name="reporterContact" label={<T fr="Téléphone ou e-mail" mg="Telefaonina na mailaka" />}
          required
          hint={<T fr="Affiché sur l'annonce pour être contacté." mg="Aseho amin'ny filazana mba hahafahana mifandray aminao." />}>
          <Input id="reporterContact" name="reporterContact" defaultValue={defaultContact} />
        </FormField>
      </div>
      <SubmitButton className="w-full sm:w-auto">
        <T fr="Publier le signalement" mg="Avoahy ny filazana" />
      </SubmitButton>
    </ActionForm>
  );
}
