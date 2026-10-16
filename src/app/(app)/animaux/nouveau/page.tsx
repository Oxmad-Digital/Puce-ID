import { saveAnimal } from "@/lib/actions/animals";
import { homeFor, requireUser } from "@/lib/session";
import { Alert, ButtonLink, PageHeader } from "@/components/ui";
import { AnimalForm } from "@/components/forms/animal-form";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Enregistrer un animal" };

export default async function NewAnimalPage({ searchParams }: PageProps<"/animaux/nouveau">) {
  const user = await requireUser();
  const { puce } = await searchParams;
  const chipNumber = typeof puce === "string" ? puce : undefined;
  const pendingVet = user.role === "vet" && user.vet?.status !== "verified";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={<T fr="Enregistrer un animal" mg="Hanoratra biby" />}
        description={<T fr="Renseignez l'animal, sa puce et son propriétaire" mg="Fenoy ny mombamomba ny biby, ny puce-ny ary ny tompony" />}
        breadcrumb={[
          { label: <T fr="Tableau de bord" mg="Tabilao fanaraha-maso" />, href: homeFor(user.role) },
          { label: <T fr="Enregistrer un animal" mg="Hanoratra biby" /> },
        ]}
      />
      {pendingVet ? (
        <Alert tone="amber">
          <T
            fr="Votre numéro d'ordre est en cours de vérification. L'enregistrement d'animaux sera disponible dès la validation de votre compte."
            mg="Eo am-panamarinana ny laharanao ao amin'ny Holafitra (Ordre). Afaka manoratra biby ianao rehefa voamarina ny kaontinao."
          />{" "}
          <ButtonLink href="/parametres" variant="ghost" size="sm">
            <T fr="Voir mon profil" mg="Hijery ny mombamomba ahy" />
          </ButtonLink>
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
