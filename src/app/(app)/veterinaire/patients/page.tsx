import { Plus, Stethoscope, Upload } from "lucide-react";
import { animalFilterOptions, listAnimals } from "@/lib/data/queries";
import { hasFilters, parseAnimalFilters } from "@/lib/filters";
import { requireRole } from "@/lib/session";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { AnimalTable } from "@/components/app/animal-table";
import { AnimalFilters } from "@/components/app/animal-filters";

export const metadata = { title: "Mes patients" };

export default async function PatientsPage({ searchParams }: PageProps<"/veterinaire/patients">) {
  const user = await requireRole("vet", "admin");
  const sp = await searchParams;
  const filters = parseAnimalFilters(sp);
  const [animals, options] = await Promise.all([
    listAnimals(user, filters, 200),
    animalFilterOptions(user),
  ]);

  return (
    <>
      <PageHeader
        title="Mes patients"
        description={hasFilters(filters) ? `${animals.length} patient${animals.length > 1 ? "s" : ""} correspondant à votre recherche` : "Animaux que vous avez pucés ou enregistrés, et patients de votre clinique"}
        actions={
          <>
            <ButtonLink href="/veterinaire/import" variant="secondary"><Upload className="size-4" /> Importer</ButtonLink>
            <ButtonLink href="/animaux/nouveau"><Plus className="size-4" /> Enregistrer un animal</ButtonLink>
          </>
        }
      />
      <Card>
        <AnimalFilters filters={filters} options={options} basePath="/veterinaire/patients" />
        {animals.length ? (
          <AnimalTable animals={animals} />
        ) : (
          <EmptyState icon={<Stethoscope className="size-5" />} title="Aucun patient trouvé" />
        )}
      </Card>
    </>
  );
}
