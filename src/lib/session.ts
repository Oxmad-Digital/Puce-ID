import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import type { ClinicRole, UserRole } from "@/lib/db/schema";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  phone: string | null;
  city: string | null;
  mustChangePassword: boolean;
  vet: {
    clinicId: string;
    clinicName: string;
    clinicRole: ClinicRole;
    orderNumber: string;
    city: string;
    status: "pending" | "verified" | "rejected";
  } | null;
};

/** Utilisateur connecté (ou null). Mémoïsé pour la durée de la requête. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const row = await db.query.user.findFirst({
    where: eq(schema.user.id, session.user.id),
    with: { vetProfile: { with: { clinic: true } } },
  });
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    role: row.role,
    phone: row.phone,
    city: row.city,
    mustChangePassword: row.mustChangePassword,
    vet: row.vetProfile
      ? {
          clinicId: row.vetProfile.clinicId,
          clinicName: row.vetProfile.clinic.name,
          clinicRole: row.vetProfile.clinicRole,
          orderNumber: row.vetProfile.orderNumber,
          city: row.vetProfile.clinic.city,
          status: row.vetProfile.status,
        }
      : null,
  };
});

export const FIRST_LOGIN_PATH = "/nouveau-mot-de-passe";

/**
 * Utilisateur connecté, sinon redirection vers /connexion.
 * Un compte invité doit d'abord remplacer son mot de passe provisoire.
 */
export async function requireUser(options: { allowTemporaryPassword?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.mustChangePassword && !options.allowTemporaryPassword) redirect(FIRST_LOGIN_PATH);
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

/** Vétérinaire dont le numéro d'ordre a été validé. */
export async function requireVerifiedVet() {
  const user = await requireRole("vet", "admin");
  if (user.role === "vet" && user.vet?.status !== "verified") redirect("/veterinaire");
  return user;
}

/** Vétérinaire vérifié, responsable de sa clinique (ou administrateur). */
export function isClinicManager(user: CurrentUser) {
  return user.vet?.status === "verified" && user.vet.clinicRole === "manager";
}

export function homeFor(role: UserRole) {
  if (role === "vet") return "/veterinaire";
  if (role === "admin") return "/admin";
  return "/tableau-de-bord";
}
