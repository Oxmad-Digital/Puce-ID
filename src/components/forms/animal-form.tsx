"use client";

import Link from "next/link";
import type { ActionState } from "@/lib/actions/state";
import { ANIMAL_STATUS, SPECIES, SPECIES_MG } from "@/lib/labels";
import { T, useT } from "@/components/layout/lang-toggle";
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

function Section({ step, title, children }: { step: number; title: React.ReactNode; children: React.ReactNode }) {
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
  const t = useT();
  const steps = [t("Animal", "Biby"), t("Puce", "Puce"), t("Propriétaire", "Tompony")];
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
        <Section step={1} title={<T fr="Informations sur l'animal" mg="Mombamomba ny biby" />}>
          <FormField name="name" label={<T fr="Nom de l'animal" mg="Anaran'ny biby" />} required>
            <Input id="name" name="name" defaultValue={defaults.name} placeholder={{ fr: "Ex. Kiki", mg: "Ohatra : Kiki" }} />
          </FormField>
          <FormField name="species" label={<T fr="Espèce" mg="Karazana" />} required>
            <Select id="species" name="species" defaultValue={defaults.species ?? ""}>
              <option value="" disabled>{t("Chien, chat, autre…", "Alika, saka, hafa…")}</option>
              {SPECIES.map((s) => (
                <option key={s} value={s}>
                  {t(s, SPECIES_MG[s] ?? s)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField name="breed" label={<T fr="Race" mg="Fokom-biby" />}>
            <Input id="breed" name="breed" defaultValue={defaults.breed ?? ""} placeholder={{ fr: "Ex. Européen", mg: "Ohatra : Eoropeanina" }} />
          </FormField>
          <FormField name="sex" label={<T fr="Sexe" mg="Lahy sa vavy" />}>
            <Select id="sex" name="sex" defaultValue={defaults.sex ?? "unknown"}>
              <option value="male">{t("Mâle", "Lahy")}</option>
              <option value="female">{t("Femelle", "Vavy")}</option>
              <option value="unknown">{t("Inconnu", "Tsy fantatra")}</option>
            </Select>
          </FormField>
          <FormField name="birthDate" label={<T fr="Date de naissance" mg="Daty nahaterahana" />}>
            <Input id="birthDate" name="birthDate" type="date" defaultValue={defaults.birthDate ?? ""} />
          </FormField>
          <FormField name="color" label={<T fr="Couleur / signes particuliers" mg="Loko / mari-panondro manokana" />}>
            <Input id="color" name="color" defaultValue={defaults.color ?? ""} placeholder={{ fr: "Ex. Tigré gris, tache blanche au cou", mg: "Ohatra : Vandana volondavenona, misy pentina fotsy amin'ny tenda" }} />
          </FormField>
          <FormField name="status" label={<T fr="Statut de l'animal" mg="Toetry ny biby" />} className="sm:col-span-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(ANIMAL_STATUS) as AnimalStatus[]).map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" name="status" value={s} defaultChecked={(defaults.status ?? "alive") === s} className="peer sr-only" />
                  <span className="block rounded-lg border border-line py-2 text-center text-xs font-semibold text-muted transition-colors peer-checked:border-emerald-400 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-300">
                    <T {...ANIMAL_STATUS[s].label} />
                  </span>
                </label>
              ))}
            </div>
          </FormField>
        </Section>

        <Section step={2} title={<T fr="Puce électronique" mg="Puce elektronika" />}>
          <FormField name="chipNumber" label={<T fr="Numéro de puce (15 chiffres)" mg="Laharan'ny puce (isa 15)" />}
            required
            hint={
              <T
                fr="Format ISO 11784 — 15 chiffres. 450 = indicatif Madagascar. Le numéro est vérifié pour éviter les doublons."
                mg="Endrika ISO 11784 — isa 15. 450 = kaody an'i Madagasikara. Hamarinina ny laharana mba hialana amin'ny mitovy roa."
              />
            }>
            <Input id="chipNumber" name="chipNumber" inputMode="numeric" maxLength={19} defaultValue={defaults.chipNumber} placeholder="450 200 000 123 456" className="font-mono" />
          </FormField>
          <FormField name="chipImplantedAt" label={<T fr="Date d'implantation" mg="Daty nametrahana" />}>
            <Input id="chipImplantedAt" name="chipImplantedAt" type="date" defaultValue={defaults.chipImplantedAt ?? ""} />
          </FormField>
          {role !== "vet" && (
            <FormField name="implantedByName" label={<T fr="Vétérinaire ayant posé la puce" mg="Dokotera nametraka ny puce" />}
              hint={
                <T
                  fr="Laissez vide si inconnu : la fiche sera confirmée lors d'une prochaine visite."
                  mg="Avelao ho foana raha tsy fantatra : hamarinina ny fiche amin'ny fitsidihana manaraka."
                />
              }>
              <Input id="implantedByName" name="implantedByName" defaultValue={defaults.implantedByName ?? ""} placeholder={{ fr: "Nom du vétérinaire", mg: "Anaran'ny dokotera" }} />
            </FormField>
          )}
          <FormField name="chipLocation" label={<T fr="Emplacement" mg="Toerana napetrahana" />}>
            <Select id="chipLocation" name="chipLocation" defaultValue={defaults.chipLocation ?? "Cou, côté gauche"}>
              <option value="Cou, côté gauche">{t("Cou, côté gauche", "Tenda, ankavia")}</option>
              <option value="Entre les omoplates">{t("Entre les omoplates", "Eo anelanelan'ny soroka")}</option>
              <option value="Autre">{t("Autre", "Hafa")}</option>
            </Select>
          </FormField>
          <FormField name="photoKey" label={<T fr="Photo de l'animal" mg="Sarin'ny biby" />} className="sm:col-span-2">
            <PhotoUpload name="photoKey" folder="animals" defaultKey={defaults.photoKey} label={t("Ajouter une photo (JPG, PNG — 8 Mo max)", "Hampiditra sary (JPG, PNG — 8 Mo farafahabetsany)")} />
          </FormField>
        </Section>

        <Section step={3} title={<T fr="Propriétaire" mg="Tompony" />}>
          <FormField name="ownerName" label={<T fr="Nom complet" mg="Anarana feno" />} required>
            <Input id="ownerName" name="ownerName" defaultValue={defaults.ownerName} placeholder={{ fr: "Ex. Rasoa Andrianina", mg: "Ohatra : Rasoa Andrianina" }} />
          </FormField>
          <FormField name="ownerPhone" label={<T fr="Téléphone" mg="Telefaonina" />}>
            <Input id="ownerPhone" name="ownerPhone" type="tel" defaultValue={defaults.ownerPhone ?? ""} placeholder="+261 34 00 000 00" />
          </FormField>
          <FormField name="ownerEmail" label={<T fr="E-mail" mg="Mailaka" />}
            hint={
              role === "vet" ? (
                <T
                  fr="Le propriétaire reçoit une invitation pour retrouver la fiche dans son espace."
                  mg="Mahazo fanasana ny tompony mba hahitany ny fiche ao amin'ny kaontiny."
                />
              ) : undefined
            }>
            <Input id="ownerEmail" name="ownerEmail" type="email" defaultValue={defaults.ownerEmail ?? ""} placeholder={{ fr: "nom@exemple.mg", mg: "anarana@ohatra.mg" }} />
          </FormField>
          <FormField name="ownerCity" label={<T fr="Ville / adresse" mg="Tanàna / adiresy" />}>
            <Input id="ownerCity" name="ownerCity" defaultValue={defaults.ownerCity ?? ""} placeholder={{ fr: "Ex. Antananarivo", mg: "Ohatra : Antananarivo" }} />
          </FormField>
        </Section>

        <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface/50 p-5 sm:flex-row sm:justify-end sm:p-6">
          <Link href={cancelHref} className={buttonClass("secondary")}>
            <T fr="Annuler" mg="Hanafoana" />
          </Link>
          <SubmitButton>
            {mode === "create" ? (
              <T fr="Enregistrer l'animal" mg="Soraty ny biby" />
            ) : (
              <T fr="Enregistrer les modifications" mg="Tehirizo ny fanovana" />
            )}
          </SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}

