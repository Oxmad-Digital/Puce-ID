import { PawPrint, Plus } from "lucide-react";
import { animalFilterOptions, listAnimals } from "@/lib/data/queries";
import { hasFilters, parseAnimalFilters } from "@/lib/filters";
import { requireUser } from "@/lib/session";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { AnimalTable } from "@/components/app/animal-table";
import { AnimalFilters } from "@/components/app/animal-filters";

export const metadata = { title: "Mes animaux" };

export default async function MyAnimalsPage({ searchParams }: PageProps<"/mes-animaux">) {
  const user = await requireUser();
  const sp = await searchParams;
  const filters = parseAnimalFilters(sp);
  const [animals, options] = await Promise.all([
    listAnimals(user, filters),
    animalFilterOptions(user),
  ]);

  return (
    <>
      <PageHeader
        title={user.role === "admin" ? "Registre des animaux" : "Mes animaux"}
        description={`${animals.length} animal${animals.length > 1 ? "aux" : ""} ${hasFilters(filters) ? "correspondant à votre recherche" : "enregistré" + (animals.length > 1 ? "s" : "")}`}
        actions={<ButtonLink href="/animaux/nouveau"><Plus className="size-4" /> Enregistrer un animal</ButtonLink>}
      />
      <Card>
        <AnimalFilters filters={filters} options={options} basePath="/mes-animaux" />
        {animals.length ? (
          <AnimalTable animals={animals} ownerColumn={user.role !== "owner"} />
        ) : (
          <EmptyState icon={<PawPrint className="size-5" />} title="Aucun animal trouvé" description="Modifiez vos filtres ou enregistrez un nouvel animal." />
        )}
      </Card>
    </>
  );
}
