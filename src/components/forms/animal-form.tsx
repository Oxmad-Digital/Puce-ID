"use client";

import Link from "next/link";
import type { ActionState } from "@/lib/actions/state";
import { ANIMAL_STATUS, SPECIES } from "@/lib/labels";
import type { AnimalStatus } from "@/lib/db/schema";
import { buttonClass, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ActionForm, FormField, SubmitButton } from "./action-form";
import { PhotoUpload } from "./file-upload";

export type AnimalDefaults = Partial<{
  name: string;
  species: string;
  breed: string | null;
  sex: "male" | "female" | "unknown";
  birthDate: string | null;
  color: string | null;
  status: AnimalStatus;
  chipNumber: string;
  chipImplantedAt: string | null;
  chipLocation: string | null;
  implantedByName: string | null;
  photoKey: string | null;
  ownerName: string;
  ownerPhone: string | null;
  ownerEmail: string | null;
  ownerCity: string | null;
}>;

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section id={`etape-${step}`} className="scroll-mt-24 border-t border-line p-5 first:border-t-0 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-[11px] text-white">{step}</span>
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function AnimalForm({
  action,
  defaults = {},
  mode,
  role,
  cancelHref,
}: {
  action: (prev: ActionState, form: FormData) => Promise<ActionState>;
  defaults?: AnimalDefaults;
  mode: "create" | "edit";
  role: "owner" | "vet" | "admin";
  cancelHref: string;
}) {
  const steps = ["Animal", "Puce", "Propriétaire"];
  return (
    <ActionForm action={action} refresh={false}>
      <nav className="mb-4 flex items-center gap-2 overflow-x-auto text-xs">
        {steps.map((s, i) => (
          <a key={s} href={`#etape-${i + 1}`} className="flex shrink-0 items-center gap-2">
            {i > 0 && <span className="h-px w-6 bg-line sm:w-12" />}
            <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold", i === 0 ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-700")}>{i + 1}</span>
            <span className="font-semibold text-ink">{s}</span>
          </a>
        ))}
      </nav>

      <div className="card overflow-hidden">
        <Section step={1} title="Informations sur l'animal">
          <FormField name="name" label="Nom de l'animal" required>
            <Input id="name" name="name" defaultValue={defaults.name} placeholder="Ex. Kiki" />
          </FormField>
          <FormField name="species" label="Espèce" required>
            <Select id="species" name="species" defaultValue={defaults.species ?? ""}>
              <option value="" disabled>Chien, chat, autre…</option>
              {SPECIES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </FormField>
          <FormField name="breed" label="Race">
            <Input id="breed" name="breed" defaultValue={defaults.breed ?? ""} placeholder="Ex. Européen" />
          </FormField>
          <FormField name="sex" label="Sexe">
            <Select id="sex" name="sex" defaultValue={defaults.sex ?? "unknown"}>
              <option value="male">Mâle</option>
              <option value="female">Femelle</option>
              <option value="unknown">Inconnu</option>
            </Select>
          </FormField>
          <FormField name="birthDate" label="Date de naissance">
            <Input id="birthDate" name="birthDate" type="date" defaultValue={defaults.birthDate ?? ""} />
          </FormField>
          <FormField name="color" label="Couleur / signes particuliers">
            <Input id="color" name="color" defaultValue={defaults.color ?? ""} placeholder="Ex. Tigré gris, tache blanche au cou" />
          </FormField>
          <FormField name="status" label="Statut de l'animal" className="sm:col-span-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(ANIMAL_STATUS) as AnimalStatus[]).map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" name="status" value={s} defaultChecked={(defaults.status ?? "alive") === s} className="peer sr-only" />
                  <span className="block rounded-lg border border-line py-2 text-center text-xs font-semibold text-muted transition-colors peer-checked:border-emerald-400 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300">
                    {ANIMAL_STATUS[s].label}
                  </span>
                </label>
              ))}
            </div>
          </FormField>
        </Section>

        <Section step={2} title="Puce électronique">
          <FormField name="chipNumber" label="Numéro de puce (15 chiffres)" required hint="Format ISO 11784 — 15 chiffres. 450 = indicatif Madagascar. Le numéro est vérifié pour éviter les doublons.">
            <Input id="chipNumber" name="chipNumber" inputMode="numeric" maxLength={19} defaultValue={defaults.chipNumber} placeholder="450 200 000 123 456" className="font-mono" />
          </FormField>
          <FormField name="chipImplantedAt" label="Date d'implantation">
            <Input id="chipImplantedAt" name="chipImplantedAt" type="date" defaultValue={defaults.chipImplantedAt ?? ""} />
          </FormField>
          {role !== "vet" && (
            <FormField name="implantedByName" label="Vétérinaire ayant posé la puce" hint="Laissez vide si inconnu : la fiche sera confirmée lors d'une prochaine visite.">
              <Input id="implantedByName" name="implantedByName" defaultValue={defaults.implantedByName ?? ""} placeholder="Nom du vétérinaire" />
            </FormField>
          )}
          <FormField name="chipLocation" label="Emplacement">
            <Select id="chipLocation" name="chipLocation" defaultValue={defaults.chipLocation ?? "Cou, côté gauche"}>
              <option>Cou, côté gauche</option>
              <option>Entre les omoplates</option>
              <option>Autre</option>
            </Select>
          </FormField>
          <FormField name="photoKey" label="Photo de l'animal" className="sm:col-span-2">
            <PhotoUpload name="photoKey" folder="animals" defaultKey={defaults.photoKey} label="Ajouter une photo (JPG, PNG — 8 Mo max)" />
          </FormField>
        </Section>

        <Section step={3} title="Propriétaire">
          <FormField name="ownerName" label="Nom complet" required>
            <Input id="ownerName" name="ownerName" defaultValue={defaults.ownerName} placeholder="Ex. Rasoa Andrianina" />
          </FormField>
          <FormField name="ownerPhone" label="Téléphone">
            <Input id="ownerPhone" name="ownerPhone" type="tel" defaultValue={defaults.ownerPhone ?? ""} placeholder="+261 34 00 000 00" />
          </FormField>
          <FormField name="ownerEmail" label="Email" hint={role === "vet" ? "Le propriétaire reçoit une invitation pour retrouver la fiche dans son espace." : undefined}>
            <Input id="ownerEmail" name="ownerEmail" type="email" defaultValue={defaults.ownerEmail ?? ""} placeholder="nom@exemple.mg" />
          </FormField>
          <FormField name="ownerCity" label="Ville / adresse">
            <Input id="ownerCity" name="ownerCity" defaultValue={defaults.ownerCity ?? ""} placeholder="Ex. Antananarivo" />
          </FormField>
        </Section>

        <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface/50 p-5 sm:flex-row sm:justify-end sm:p-6">
          <Link href={cancelHref} className={buttonClass("secondary")}>Annuler</Link>
          <SubmitButton>{mode === "create" ? "Enregistrer l'animal" : "Enregistrer les modifications"}</SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}

