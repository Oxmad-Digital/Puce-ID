import { PawPrint, Plus } from "lucide-react";
import { animalFilterOptions, listAnimals } from "@/lib/data/queries";
import { hasFilters, parseAnimalFilters } from "@/lib/filters";
import { requireUser } from "@/lib/session";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { AnimalTable } from "@/components/app/animal-table";
import { AnimalFilters } from "@/components/app/animal-filters";
import { T } from "@/components/layout/lang-toggle";

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
        title={
          user.role === "admin" ? (
            <T fr="Registre des animaux" mg="Rejisitry ny biby" />
          ) : (
            <T fr="Mes animaux" mg="Ireo bibiko" />
          )
        }
        description={
          <T
            fr={`${animals.length} animal${animals.length > 1 ? "aux" : ""} ${hasFilters(filters) ? "correspondant à votre recherche" : "enregistré" + (animals.length > 1 ? "s" : "")}`}
            mg={`Biby ${animals.length} ${hasFilters(filters) ? "mifanaraka amin'ny fikarohanao" : "voasoratra"}`}
          />
        }
        actions={
          <ButtonLink href="/animaux/nouveau">
            <Plus className="size-4" /> <T fr="Enregistrer un animal" mg="Hanoratra biby" />
          </ButtonLink>
        }
      />
      <Card>
        <AnimalFilters filters={filters} options={options} basePath="/mes-animaux" />
        {animals.length ? (
          <AnimalTable animals={animals} ownerColumn={user.role !== "owner"} />
        ) : (
          <EmptyState
            icon={<PawPrint className="size-5" />}
            title={<T fr="Aucun animal trouvé" mg="Tsy nisy biby hita" />}
            description={
              <T fr="Modifiez vos filtres ou enregistrez un nouvel animal." mg="Ovay ny sivana na soraty biby vaovao." />
            }
          />
        )}
      </Card>
    </>
  );
}
