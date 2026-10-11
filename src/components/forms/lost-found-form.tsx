"use client";

import { useState } from "react";
import { declareLostFound } from "@/lib/actions/public";
import { SPECIES } from "@/lib/labels";
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
  return (
    <ActionForm action={declareLostFound} className="space-y-4" resetOnSuccess>
      <input type="hidden" name="type" value={type} />
      <div className="inline-flex rounded-lg bg-surface p-1 ring-1 ring-line">
        {(
          [
            ["found", "J'ai trouvé un animal"],
            ["lost", "J'ai perdu mon animal"],
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
        <FormField name="chipNumber" label="Numéro de puce (si connu)" hint="15 chiffres, lisible par tout vétérinaire.">
          <Input id="chipNumber" name="chipNumber" inputMode="numeric" defaultValue={defaultChip} placeholder="450200000123456" />
        </FormField>
        <FormField name="species" label="Espèce" required>
          <Select id="species" name="species" defaultValue="">
            <option value="" disabled>Choisir…</option>
            {SPECIES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </FormField>
        <FormField name="location" label={type === "found" ? "Lieu où il a été trouvé" : "Lieu de disparition"} required>
          <Input id="location" name="location" placeholder="Quartier, ville" />
        </FormField>
        <FormField name="occurredAt" label="Date" required>
          <Input id="occurredAt" name="occurredAt" type="date" />
        </FormField>
      </div>
      <FormField name="description" label="Description" required>
        <Textarea id="description" name="description" placeholder="Couleur, taille, collier, comportement…" />
      </FormField>
      <FormField name="photoKey" label="Photo">
        <PhotoUpload name="photoKey" folder="reports" />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="reporterName" label="Votre nom" required>
          <Input id="reporterName" name="reporterName" defaultValue={defaultName} />
        </FormField>
        <FormField name="reporterContact" label="Téléphone ou e-mail" required hint="Affiché sur l'annonce pour être contacté.">
          <Input id="reporterContact" name="reporterContact" defaultValue={defaultContact} />
        </FormField>
      </div>
      <SubmitButton className="w-full sm:w-auto">Publier le signalement</SubmitButton>
    </ActionForm>
  );
}
