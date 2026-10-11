import { Download } from "lucide-react";
import { requireRole } from "@/lib/session";
import { Alert, ButtonLink, Card, CardHeader, PageHeader } from "@/components/ui";
import { CsvImportForm } from "@/components/forms/csv-import-form";

export const metadata = { title: "Importer un CSV" };

const COLUMNS: [string, string, boolean][] = [
  ["nom", "Nom de l'animal", true],
  ["espece", "Chien, Chat…", true],
  ["numero_puce", "15 chiffres", true],
  ["proprietaire_nom", "Nom complet", true],
  ["race", "Race", false],
  ["sexe", "M / F", false],
  ["date_naissance", "JJ/MM/AAAA", false],
  ["couleur", "Robe, signes particuliers", false],
  ["date_pose", "JJ/MM/AAAA", false],
  ["proprietaire_telephone", "+261…", false],
  ["proprietaire_email", "Pour l'invitation", false],
  ["proprietaire_ville", "Ville", false],
];

export default async function ImportPage() {
  const user = await requireRole("vet", "admin");
  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Importer un CSV"
        description="Ajoutez plusieurs patients en une fois depuis votre logiciel de clinique"
        actions={<ButtonLink href="/modeles/import-animaux.csv" variant="secondary"><Download className="size-4" /> Télécharger le modèle</ButtonLink>}
      />
      {user.role === "vet" && user.vet?.status !== "verified" ? (
        <Alert tone="amber">L&apos;import sera disponible après la vérification de votre compte.</Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-5"><CsvImportForm /></Card>
          <Card>
            <CardHeader title="Colonnes attendues" description="La première ligne doit contenir les en-têtes" />
            <ul className="divide-y divide-line text-xs">
              {COLUMNS.map(([name, desc, req]) => (
                <li key={name} className="flex items-center justify-between gap-2 px-5 py-2">
                  <code className="font-mono text-brand-700">{name}{req && <span className="text-red-500">*</span>}</code>
                  <span className="text-right text-muted">{desc}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
