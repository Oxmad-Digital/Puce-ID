import { notFound } from "next/navigation";
import { saveAnimal } from "@/lib/actions/animals";
import { getAnimal } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import { formatChip } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import { AnimalForm } from "@/components/forms/animal-form";

export const metadata = { title: "Modifier la fiche" };

export default async function EditAnimalPage({ params }: PageProps<"/animaux/[id]/modifier">) {
  const user = await requireUser();
  const { id } = await params;
  const animal = await getAnimal(user, id);
  if (!animal || !animal.canEdit) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Modifier ${animal.name}`}
        description={`Puce ${formatChip(animal.chipNumber)}`}
        breadcrumb={[{ label: "Animaux", href: "/mes-animaux" }, { label: animal.name, href: `/animaux/${id}` }, { label: "Modifier" }]}
      />
      <AnimalForm action={saveAnimal.bind(null, animal.id)} mode="edit" role={user.role} cancelHref={`/animaux/${id}`} defaults={animal} />
    </div>
  );
}
