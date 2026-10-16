import type { AnimalStatus, ReportType, TransferStatus } from "@/lib/db/schema";

/** Libellé bilingue (affiché avec <T {...label} />). */
type Bi = { fr: string; mg: string };

export const ANIMAL_STATUS: Record<AnimalStatus, { label: Bi; tone: Tone }> = {
  alive: { label: { fr: "Vivant", mg: "Velona" }, tone: "green" },
  lost: { label: { fr: "Disparu", mg: "Very" }, tone: "red" },
  found: { label: { fr: "Trouvé", mg: "Hita" }, tone: "blue" },
  deceased: { label: { fr: "Décédé", mg: "Maty" }, tone: "gray" },
};

export const SEX_LABEL: Record<"male" | "female" | "unknown", Bi> = {
  male: { fr: "Mâle", mg: "Lahy" },
  female: { fr: "Femelle", mg: "Vavy" },
  unknown: { fr: "Inconnu", mg: "Tsy fantatra" },
};

/** Espèces : la valeur française est stockée en base, `mg` sert à l'affichage. */
export const SPECIES = ["Chien", "Chat", "Furet", "Lapin", "Oiseau", "Bovin", "Équidé", "Autre"];

export const SPECIES_MG: Record<string, string> = {
  Chien: "Alika",
  Chat: "Saka",
  Furet: "Furet",
  Lapin: "Bitro",
  Oiseau: "Vorona",
  Bovin: "Omby",
  Équidé: "Soavaly",
  Autre: "Hafa",
};

/** Emplacement de la puce : valeur française stockée en base. */
export const CHIP_LOCATION_MG: Record<string, string> = {
  "Cou, côté gauche": "Tenda, ankavia",
  "Entre les omoplates": "Eo anelanelan'ny soroka",
  Autre: "Hafa",
};

export function speciesLabel(species: string): Bi {
  return { fr: species, mg: SPECIES_MG[species] ?? species };
}

export const REPORT_TYPE: Record<ReportType, { label: Bi; tone: Tone }> = {
  lost: { label: { fr: "Perdu", mg: "Very" }, tone: "red" },
  found: { label: { fr: "Trouvé", mg: "Hita" }, tone: "blue" },
  duplicate: { label: { fr: "Doublon", mg: "Mitovy roa" }, tone: "red" },
  dispute: { label: { fr: "Contestation", mg: "Fanoherana" }, tone: "amber" },
};

export const TRANSFER_STATUS: Record<TransferStatus, { label: Bi; tone: Tone }> = {
  pending: { label: { fr: "En attente", mg: "Miandry" }, tone: "amber" },
  accepted: { label: { fr: "Accepté", mg: "Nekena" }, tone: "green" },
  rejected: { label: { fr: "Refusé", mg: "Nolavina" }, tone: "red" },
  cancelled: { label: { fr: "Annulé", mg: "Nofoanana" }, tone: "gray" },
};

export const OWNERSHIP_EVENT: Record<"registration" | "birth" | "adoption" | "transfer" | "chip", Bi> = {
  registration: { fr: "Enregistrement", mg: "Fisoratana" },
  birth: { fr: "Naissance", mg: "Fahaterahana" },
  adoption: { fr: "Adoption", mg: "Fandraisana ho tezaina" },
  transfer: { fr: "Transfert", mg: "Famindrana" },
  chip: { fr: "Puce posée", mg: "Puce napetraka" },
};

export const ACCESS_ACTION: Record<
  | "chip_search"
  | "contact_viewed"
  | "animal_registered"
  | "animal_updated"
  | "chip_implanted"
  | "death_declared"
  | "found_declared"
  | "transfer_initiated"
  | "clinic_transfer_initiated"
  | "invitation_sent"
  | "csv_import",
  Bi
> = {
  chip_search: { fr: "Recherche de puce", mg: "Fikarohana puce" },
  contact_viewed: { fr: "Coordonnées consultées", mg: "Nojerena ny fifandraisana" },
  animal_registered: { fr: "Animal enregistré", mg: "Biby voasoratra" },
  animal_updated: { fr: "Fiche modifiée", mg: "Fiche novaina" },
  chip_implanted: { fr: "Puce posée", mg: "Puce napetraka" },
  death_declared: { fr: "Décès déclaré", mg: "Fahafatesana nambara" },
  found_declared: { fr: "Animal déclaré trouvé", mg: "Biby nambara fa hita" },
  transfer_initiated: { fr: "Transfert initié", mg: "Famindrana natomboka" },
  clinic_transfer_initiated: { fr: "Changement de clinique", mg: "Fiovan'ny toeram-pitsaboana" },
  invitation_sent: { fr: "Invitation envoyée", mg: "Fanasana nalefa" },
  csv_import: { fr: "Import CSV", mg: "Fanafarana CSV" },
};

export type Tone = "green" | "red" | "blue" | "gray" | "amber" | "brand";
