import { saveAnimal } from "@/lib/actions/animals";
import { homeFor, requireUser } from "@/lib/session";
import { Alert, ButtonLink, PageHeader } from "@/components/ui";
import { AnimalForm } from "@/components/forms/animal-form";

export const metadata = { title: "Enregistrer un animal" };

export default async function NewAnimalPage({ searchParams }: PageProps<"/animaux/nouveau">) {
  const user = await requireUser();
  const { puce } = await searchParams;
  const chipNumber = typeof puce === "string" ? puce : undefined;
  const pendingVet = user.role === "vet" && user.vet?.status !== "verified";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Enregistrer un animal"
        description="Renseignez l'animal, sa puce et son propriétaire"
        breadcrumb={[{ label: "Tableau de bord", href: homeFor(user.role) }, { label: "Enregistrer un animal" }]}
      />
      {pendingVet ? (
        <Alert tone="amber">
          Votre numéro d&apos;ordre est en cours de vérification. L&apos;enregistrement d&apos;animaux sera disponible dès
          la validation de votre compte. <ButtonLink href="/parametres" variant="ghost" size="sm">Voir mon profil</ButtonLink>
        </Alert>
      ) : (
        <AnimalForm
          action={saveAnimal.bind(null, null)}
          mode="create"
          role={user.role}
          cancelHref={homeFor(user.role)}
          defaults={
            user.role === "owner"
              ? { chipNumber, ownerName: user.name, ownerEmail: user.email, ownerPhone: user.phone, ownerCity: user.city }
              : { chipNumber }
          }
        />
      )}
    </div>
  );
}
