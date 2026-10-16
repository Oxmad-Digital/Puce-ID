import { Plus, Stethoscope, Upload } from "lucide-react";
import type { Animal } from "@/lib/db/schema";
import { animalFilterOptions, listActiveClinics, listAnimals, pendingClinicTransferAnimalIds } from "@/lib/data/queries";
import { hasFilters, parseAnimalFilters } from "@/lib/filters";
import { requireRole } from "@/lib/session";
import { ButtonLink, Card, EmptyState, PageHeader } from "@/components/ui";
import { AnimalTable } from "@/components/app/animal-table";
import { AnimalFilters } from "@/components/app/animal-filters";
import { PatientTransferButton } from "@/components/app/patient-transfer-button";
import { T } from "@/components/layout/lang-toggle";

export const metadata = { title: "Mes patients" };

export default async function PatientsPage({ searchParams }: PageProps<"/veterinaire/patients">) {
  const user = await requireRole("vet", "admin");
  const sp = await searchParams;
  const filters = parseAnimalFilters(sp);
  const [animals, options, clinics] = await Promise.all([
    listAnimals(user, filters, 200),
    animalFilterOptions(user),
    listActiveClinics(),
  ]);
  const pending = await pendingClinicTransferAnimalIds(animals.map((a) => a.id));

  // Même règle que la fiche animal (canChangeClinic), revérifiée côté serveur par initiateClinicTransfer.
  const myClinic = user.vet?.status === "verified" ? user.vet.clinicId : null;
  const canChangeClinic = (a: Animal) => {
    const isClinicVet = myClinic !== null && a.clinicId === myClinic;
    const canEdit = isClinicVet || a.implantedByVetId === user.id || a.registeredById === user.id;
    return user.role === "admin" || a.ownerId === user.id || isClinicVet || (a.clinicId === null && canEdit);
  };

  return (
    <>
      <PageHeader
        title={<T fr="Mes patients" mg="Ireo marariko" />}
        description={
          hasFilters(filters) ? (
            <T
              fr={`${animals.length} patient${animals.length > 1 ? "s" : ""} correspondant à votre recherche`}
              mg={`Marary ${animals.length} mifanaraka amin'ny fikarohanao`}
            />
          ) : (
            <T
              fr="Animaux que vous avez pucés ou enregistrés, et patients de votre clinique"
              mg="Biby nasianao puce na nosoratanao, ary ireo marary ao amin'ny toeram-pitsaboanao"
            />
          )
        }
        actions={
          <>
            <ButtonLink href="/veterinaire/import" variant="secondary">
              <Upload className="size-4" /> <T fr="Importer" mg="Hanafatra" />
            </ButtonLink>
            <ButtonLink href="/animaux/nouveau">
              <Plus className="size-4" /> <T fr="Enregistrer un animal" mg="Hanoratra biby" />
            </ButtonLink>
          </>
        }
      />
      <Card>
        <AnimalFilters filters={filters} options={options} basePath="/veterinaire/patients" />
        {animals.length ? (
          <AnimalTable
            animals={animals}
            action={(a) =>
              a.status !== "deceased" && !pending.has(a.id) && canChangeClinic(a) ? (
                <PatientTransferButton animalId={a.id} animalName={a.name} currentClinicId={a.clinicId} clinics={clinics} />
              ) : null
            }
          />
        ) : (
          <EmptyState icon={<Stethoscope className="size-5" />} title={<T fr="Aucun patient trouvé" mg="Tsy nisy marary hita" />} />
        )}
      </Card>
    </>
  );
}
