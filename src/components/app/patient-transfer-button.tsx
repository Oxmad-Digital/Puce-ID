import { Building2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { ClinicTransferForm } from "@/components/app/animal-actions";
import { T } from "@/components/layout/lang-toggle";

/** Bouton « Transférer le dossier » de la liste des patients : ouvre le formulaire de changement de clinique. */
export function PatientTransferButton({
  animalId,
  animalName,
  currentClinicId,
  clinics,
}: {
  animalId: string;
  animalName: string;
  currentClinicId: string | null;
  clinics: { id: string; name: string; city: string }[];
}) {
  return (
    <Modal
      trigger={
        <>
          <Building2 className="size-3.5" /> <T fr="Transférer le dossier" mg="Afindrao ny antontan-taratasy" />
        </>
      }
      title={
        <T
          fr={`Transférer le dossier de ${animalName}`}
          mg={`Afindrao ny antontan-taratasin'i ${animalName}`}
        />
      }
      description={
        <T
          fr="La clinique choisie suivra l'animal et pourra mettre à jour sa fiche."
          mg="Ny toeram-pitsaboana voafidy no hanaraka ny biby ary afaka hanavao ny fiche-ny."
        />
      }
      size="sm"
    >
      <ClinicTransferForm animalId={animalId} currentClinicId={currentClinicId} clinics={clinics} />
    </Modal>
  );
}
