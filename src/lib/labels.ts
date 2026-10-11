import type { AnimalStatus, ReportType, TransferStatus } from "@/lib/db/schema";

export const ANIMAL_STATUS: Record<AnimalStatus, { label: string; tone: Tone }> = {
  alive: { label: "Vivant", tone: "green" },
  lost: { label: "Disparu", tone: "red" },
  found: { label: "Trouvé", tone: "blue" },
  deceased: { label: "Décédé", tone: "gray" },
};

export const SEX_LABEL = { male: "Mâle", female: "Femelle", unknown: "Inconnu" } as const;

export const SPECIES = ["Chien", "Chat", "Furet", "Lapin", "Oiseau", "Bovin", "Équidé", "Autre"];

export const REPORT_TYPE: Record<ReportType, { label: string; tone: Tone }> = {
  lost: { label: "Perdu", tone: "red" },
  found: { label: "Trouvé", tone: "blue" },
  duplicate: { label: "Doublon", tone: "red" },
  dispute: { label: "Contestation", tone: "amber" },
};

export const TRANSFER_STATUS: Record<TransferStatus, { label: string; tone: Tone }> = {
  pending: { label: "En attente", tone: "amber" },
  accepted: { label: "Accepté", tone: "green" },
  rejected: { label: "Refusé", tone: "red" },
  cancelled: { label: "Annulé", tone: "gray" },
};

export const OWNERSHIP_EVENT = {
  registration: "Enregistrement",
  birth: "Naissance",
  adoption: "Adoption",
  transfer: "Transfert",
  chip: "Puce posée",
} as const;

export const ACCESS_ACTION = {
  chip_search: "Recherche de puce",
  contact_viewed: "Coordonnées consultées",
  animal_registered: "Animal enregistré",
  animal_updated: "Fiche modifiée",
  chip_implanted: "Puce posée",
  death_declared: "Décès déclaré",
  found_declared: "Animal déclaré trouvé",
  transfer_initiated: "Transfert initié",
  clinic_transfer_initiated: "Changement de clinique",
  invitation_sent: "Invitation envoyée",
  csv_import: "Import CSV",
} as const;

export type Tone = "green" | "red" | "blue" | "gray" | "amber" | "brand";
