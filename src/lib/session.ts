import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import type { UserRole } from "@/lib/db/schema";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  phone: string | null;
  city: string | null;
  vet: {
    clinicName: string;
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
    with: { vetProfile: true },
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
    vet: row.vetProfile
      ? {
          clinicName: row.vetProfile.clinicName,
          orderNumber: row.vetProfile.orderNumber,
          city: row.vetProfile.city,
          status: row.vetProfile.status,
        }
      : null,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
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

export function homeFor(role: UserRole) {
  if (role === "vet") return "/veterinaire";
  if (role === "admin") return "/admin";
  return "/tableau-de-bord";
}
