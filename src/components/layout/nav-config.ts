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

export type NavItem = { label: string; href: string; icon: NavIcon; exact?: boolean };

export const NAV: Record<UserRole, NavItem[]> = {
  owner: [
    { label: "Tableau de bord", href: "/tableau-de-bord", icon: "dashboard" },
    { label: "Mes animaux", href: "/mes-animaux", icon: "paw" },
    { label: "Transferts", href: "/transferts", icon: "transfer" },
    { label: "Perdu / Trouvé", href: "/signalements", icon: "pin" },
    { label: "Notifications", href: "/notifications", icon: "bell" },
    { label: "Paramètres", href: "/parametres", icon: "settings" },
  ],
  vet: [
    { label: "Tableau de bord", href: "/veterinaire", icon: "dashboard", exact: true },
    { label: "Mes patients", href: "/veterinaire/patients", icon: "paw" },
    { label: "Scanner une puce", href: "/veterinaire/scanner", icon: "scan" },
    { label: "Enregistrer un animal", href: "/animaux/nouveau", icon: "plus" },
    { label: "Transferts", href: "/transferts", icon: "transfer" },
    { label: "Perdu / Trouvé", href: "/signalements", icon: "pin" },
    { label: "Importer un CSV", href: "/veterinaire/import", icon: "upload" },
    { label: "Journal d'accès", href: "/veterinaire/journal", icon: "log" },
    { label: "Ma clinique", href: "/veterinaire/clinique", icon: "clinic" },
    { label: "Paramètres", href: "/parametres", icon: "settings" },
  ],
  admin: [
    { label: "Vue d'ensemble", href: "/admin", icon: "dashboard", exact: true },
    { label: "Animaux", href: "/mes-animaux", icon: "paw" },
    { label: "Cliniques", href: "/admin/veterinaires", icon: "shield" },
    { label: "Signalements", href: "/signalements", icon: "pin" },
    { label: "Transferts", href: "/transferts", icon: "transfer" },
    { label: "Journal d'accès", href: "/admin/journal", icon: "log" },
    { label: "Paramètres", href: "/parametres", icon: "settings" },
  ],
};
