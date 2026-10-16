import { notFound } from "next/navigation";
import { saveAnimal } from "@/lib/actions/animals";
import { getAnimal } from "@/lib/data/queries";
import { requireUser } from "@/lib/session";
import { formatChip } from "@/lib/utils";
import { PageHeader } from "@/components/ui";
import { AnimalForm } from "@/components/forms/animal-form";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Modifier la fiche" };

export default async function EditAnimalPage({ params }: PageProps<"/animaux/[id]/modifier">) {
  const user = await requireUser();
  const { id } = await params;
  const animal = await getAnimal(user, id);
  if (!animal || !animal.canEdit) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={<T fr={`Modifier ${animal.name}`} mg={`Hanova an'i ${animal.name}`} />}
        description={`Puce ${formatChip(animal.chipNumber)}`}
        breadcrumb={[
          { label: <T fr="Animaux" mg="Biby" />, href: "/mes-animaux" },
          { label: animal.name, href: `/animaux/${id}` },
          { label: <T fr="Modifier" mg="Hanova" /> },
        ]}
      />
      <AnimalForm action={saveAnimal.bind(null, animal.id)} mode="edit" role={user.role} cancelHref={`/animaux/${id}`} defaults={animal} />
    </div>
  );
}
