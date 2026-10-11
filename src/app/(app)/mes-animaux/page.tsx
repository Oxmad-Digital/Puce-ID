import { PawPrint, Plus } from "lucide-react";
import { listAnimals } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import type { AnimalStatus } from "@/lib/db/schema";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { AnimalTable } from "@/components/app/animal-table";
import { AnimalFilters } from "@/components/app/animal-filters";

export const metadata = { title: "Mes animaux" };

export default async function MyAnimalsPage({ searchParams }: PageProps<"/mes-animaux">) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const status = typeof sp.statut === "string" && sp.statut ? (sp.statut as AnimalStatus) : undefined;
  const animals = await listAnimals(user, { q, status });

  return (
    <>
      <PageHeader
        title="Mes animaux"
        description={`${animals.length} animal${animals.length > 1 ? "aux" : ""} ${q || status ? "correspondant à votre recherche" : "enregistré" + (animals.length > 1 ? "s" : "")}`}
        actions={<ButtonLink href="/animaux/nouveau"><Plus className="size-4" /> Enregistrer un animal</ButtonLink>}
      />
      <Card>
        <AnimalFilters q={q} status={status} />
        {animals.length ? (
          <AnimalTable animals={animals} ownerColumn={user.role !== "owner"} />
        ) : (
          <EmptyState icon={<PawPrint className="size-5" />} title="Aucun animal trouvé" description="Modifiez vos filtres ou enregistrez un nouvel animal." />
        )}
      </Card>
    </>
  );
}
