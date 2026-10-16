import type { UserRole } from "@/lib/db/schema";

export type NavIcon =
  | "dashboard"
  | "paw"
  | "transfer"
  | "pin"
  | "settings"
  | "scan"
  | "plus"
  | "upload"
  | "log"
  | "shield"
  | "clinic"
  | "bell";

export type NavItem = { label: { fr: string; mg: string }; href: string; icon: NavIcon; exact?: boolean };

export const NAV: Record<UserRole, NavItem[]> = {
  owner: [
    { label: { fr: "Tableau de bord", mg: "Tabilao fanaraha-maso" }, href: "/tableau-de-bord", icon: "dashboard" },
    { label: { fr: "Mes animaux", mg: "Ireo bibiko" }, href: "/mes-animaux", icon: "paw" },
    { label: { fr: "Transferts", mg: "Famindrana" }, href: "/transferts", icon: "transfer" },
    { label: { fr: "Perdu / Trouvé", mg: "Very / Hita" }, href: "/signalements", icon: "pin" },
    { label: { fr: "Notifications", mg: "Fampahafantarana" }, href: "/notifications", icon: "bell" },
    { label: { fr: "Paramètres", mg: "Fikirana" }, href: "/parametres", icon: "settings" },
  ],
  vet: [
    { label: { fr: "Tableau de bord", mg: "Tabilao fanaraha-maso" }, href: "/veterinaire", icon: "dashboard", exact: true },
    { label: { fr: "Mes patients", mg: "Ireo marariko" }, href: "/veterinaire/patients", icon: "paw" },
    { label: { fr: "Scanner une puce", mg: "Hi-scan puce" }, href: "/veterinaire/scanner", icon: "scan" },
    { label: { fr: "Enregistrer un animal", mg: "Hanoratra biby" }, href: "/animaux/nouveau", icon: "plus" },
    { label: { fr: "Transferts", mg: "Famindrana" }, href: "/transferts", icon: "transfer" },
    { label: { fr: "Perdu / Trouvé", mg: "Very / Hita" }, href: "/signalements", icon: "pin" },
    { label: { fr: "Importer un CSV", mg: "Hanafatra CSV" }, href: "/veterinaire/import", icon: "upload" },
    { label: { fr: "Journal d'accès", mg: "Diarin'ny fidirana" }, href: "/veterinaire/journal", icon: "log" },
    { label: { fr: "Ma clinique", mg: "Ny toeram-pitsaboako" }, href: "/veterinaire/clinique", icon: "clinic" },
    { label: { fr: "Paramètres", mg: "Fikirana" }, href: "/parametres", icon: "settings" },
  ],
  admin: [
    { label: { fr: "Vue d'ensemble", mg: "Topimaso ankapobeny" }, href: "/admin", icon: "dashboard", exact: true },
    { label: { fr: "Animaux", mg: "Biby" }, href: "/mes-animaux", icon: "paw" },
    { label: { fr: "Cliniques", mg: "Toeram-pitsaboana" }, href: "/admin/veterinaires", icon: "shield" },
    { label: { fr: "Signalements", mg: "Filazana" }, href: "/signalements", icon: "pin" },
    { label: { fr: "Transferts", mg: "Famindrana" }, href: "/transferts", icon: "transfer" },
    { label: { fr: "Journal d'accès", mg: "Diarin'ny fidirana" }, href: "/admin/journal", icon: "log" },
    { label: { fr: "Paramètres", mg: "Fikirana" }, href: "/parametres", icon: "settings" },
  ],
};
