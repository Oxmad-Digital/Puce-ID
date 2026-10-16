import { Download } from "lucide-react";
import { requireRole } from "@/lib/session";
import { Alert, ButtonLink, Card, CardHeader, PageHeader } from "@/components/ui";
import { CsvImportForm } from "@/components/forms/csv-import-form";
import { T, type Bi } from "@/components/layout/lang-toggle";

export const metadata = { title: "Importer un CSV" };

const COLUMNS: [string, Bi, boolean][] = [
  ["nom", { fr: "Nom de l'animal", mg: "Anaran'ny biby" }, true],
  ["espece", { fr: "Chien, Chat…", mg: "Chien, Chat… (amin'ny teny frantsay)" }, true],
  ["numero_puce", { fr: "15 chiffres", mg: "Isa 15" }, true],
  ["proprietaire_nom", { fr: "Nom complet", mg: "Anarana feno" }, true],
  ["race", { fr: "Race", mg: "Fokom-biby" }, false],
  ["sexe", { fr: "M / F", mg: "M (lahy) / F (vavy)" }, false],
  ["date_naissance", { fr: "JJ/MM/AAAA", mg: "AA/VV/TTTT" }, false],
  ["couleur", { fr: "Robe, signes particuliers", mg: "Loko, mari-panondro manokana" }, false],
  ["date_pose", { fr: "JJ/MM/AAAA", mg: "AA/VV/TTTT" }, false],
  ["proprietaire_telephone", { fr: "+261…", mg: "+261…" }, false],
  ["proprietaire_email", { fr: "Pour l'invitation", mg: "Ho an'ny fanasana" }, false],
  ["proprietaire_ville", { fr: "Ville", mg: "Tanàna" }, false],
];

export default async function ImportPage() {
  const user = await requireRole("vet", "admin");
  return (
    <div className="max-w-4xl">
      <PageHeader
        title={<T fr="Importer un CSV" mg="Hanafatra CSV" />}
        description={
          <T
            fr="Ajoutez plusieurs patients en une fois depuis votre logiciel de clinique"
            mg="Ampidiro indray mandeha ireo marary maromaro avy amin'ny rindrambaikon'ny toeram-pitsaboanao"
          />
        }
        actions={
          <ButtonLink href="/modeles/import-animaux.csv" variant="secondary">
            <Download className="size-4" /> <T fr="Télécharger le modèle" mg="Haka ny modely" />
          </ButtonLink>
        }
      />
      {user.role === "vet" && user.vet?.status !== "verified" ? (
        <Alert tone="amber">
          <T
            fr="L'import sera disponible après la vérification de votre compte."
            mg="Azo atao ny fanafarana rehefa voamarina ny kaontinao."
          />
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-5"><CsvImportForm /></Card>
          <Card>
            <CardHeader
              title={<T fr="Colonnes attendues" mg="Tsanganana ilaina" />}
              description={
                <T fr="La première ligne doit contenir les en-têtes" mg="Ny andalana voalohany no misy ny lohateny" />
              }
            />
            <ul className="divide-y divide-line text-xs">
              {COLUMNS.map(([name, desc, req]) => (
                <li key={name} className="flex items-center justify-between gap-2 px-5 py-2">
                  <code className="font-mono text-brand-700">{name}{req && <span className="text-red-500">*</span>}</code>
                  <span className="text-right text-muted">
                    <T {...desc} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
