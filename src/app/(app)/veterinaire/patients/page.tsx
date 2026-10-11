import { Plus, Stethoscope, Upload } from "lucide-react";
import { listAnimals } from "@/lib/data/queries";
import { requireRole } from "@/lib/session";
import type { AnimalStatus } from "@/lib/db/schema";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { AnimalTable } from "@/components/app/animal-table";
import { AnimalFilters } from "@/components/app/animal-filters";

export const metadata = { title: "Mes patients" };

export default async function PatientsPage({ searchParams }: PageProps<"/veterinaire/patients">) {
  const user = await requireRole("vet", "admin");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const status = typeof sp.statut === "string" && sp.statut ? (sp.statut as AnimalStatus) : undefined;
  const animals = await listAnimals(user, { q, status }, 200);

  return (
    <>
      <PageHeader
        title="Mes patients"
        description="Animaux que vous avez pucés ou enregistrés"
        actions={
          <>
            <ButtonLink href="/veterinaire/import" variant="secondary"><Upload className="size-4" /> Importer</ButtonLink>
            <ButtonLink href="/animaux/nouveau"><Plus className="size-4" /> Enregistrer un animal</ButtonLink>
          </>
        }
      />
      <Card>
        <AnimalFilters q={q} status={status} />
        {animals.length ? (
          <AnimalTable animals={animals} />
        ) : (
          <EmptyState icon={<Stethoscope className="size-5" />} title="Aucun patient trouvé" />
        )}
      </Card>
    </>
  );
}
