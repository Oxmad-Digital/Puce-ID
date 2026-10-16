"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { mailConfigured } from "@/lib/mail";
import { requireUser } from "@/lib/session";
import { fieldErrorsFrom, str, type ActionState } from "./state";

const signUpSchema = z
  .object({
    role: z.enum(["owner", "vet"]),
    name: z.string().min(2, "Indiquez votre nom complet"),
    email: z.email("Adresse e-mail invalide"),
    phone: z.string().min(6, "Indiquez un numéro de téléphone"),
    password: z.string().min(8, "8 caractères minimum"),
    confirm: z.string(),
    terms: z.literal("on", { error: "Vous devez accepter les CGU" }),
    clinicName: z.string().optional(),
    orderNumber: z.string().optional(),
    city: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Les mots de passe ne correspondent pas",
  })
  .refine((d) => d.role === "owner" || (d.clinicName && d.clinicName.length > 1), {
    path: ["clinicName"],
    message: "Indiquez le nom de votre clinique",
  })
  .refine((d) => d.role === "owner" || (d.orderNumber && d.orderNumber.length > 1), {
    path: ["orderNumber"],
    message: "Indiquez votre numéro d'ordre",
  })
  .refine((d) => d.role === "owner" || (d.city && d.city.length > 1), {
    path: ["city"],
    message: "Indiquez votre ville d'exercice",
  });

export async function signUp(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    role: str(form, "role") || "owner",
    name: str(form, "name"),
    email: str(form, "email").toLowerCase(),
    phone: str(form, "phone"),
    password: str(form, "password"),
    confirm: str(form, "confirm"),
    terms: str(form, "terms") || undefined,
    clinicName: str(form, "clinicName") || undefined,
    orderNumber: str(form, "orderNumber") || undefined,
    city: str(form, "city") || undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  const d = parsed.data;

  let userId: string;
  try {
    const res = await auth.api.signUpEmail({
      body: { name: d.name, email: d.email, password: d.password, phone: d.phone, city: d.city },
      headers: await headers(),
    });
    userId = res.user.id;
  } catch (e) {
    if (e instanceof APIError && /exist/i.test(e.message)) {
      return { fieldErrors: { email: "Un compte existe déjà avec cette adresse." } };
    }
    console.error(e);
    return { error: "La création du compte a échoué. Réessayez dans un instant." };
  }

  if (d.role === "vet") {
    // Un vétérinaire qui s'inscrit seul crée sa clinique et en devient responsable.
    await db.update(schema.user).set({ role: "vet" }).where(eq(schema.user.id, userId));
    const [clinic] = await db
      .insert(schema.clinic)
      .values({ name: d.clinicName!, city: d.city!, phone: d.phone, email: d.email })
      .returning({ id: schema.clinic.id });
    await db.insert(schema.vetProfile).values({
      userId,
      clinicId: clinic.id,
      clinicRole: "manager",
      orderNumber: d.orderNumber!,
    });
  }

  // Pas de claimRecords ici : l'adresse e-mail n'est pas vérifiée à l'inscription, n'importe qui pourrait
  // récupérer les animaux d'un propriétaire. À rétablir quand la vérification d'e-mail sera activée.
  // Les comptes invités restent rattachés (createInvitedAccount) : leur adresse est prouvée par l'invitation.
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().min(2, "Indiquez votre nom"),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: str(form, "name"),
    phone: str(form, "phone") || undefined,
    city: str(form, "city") || undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  await db
    .update(schema.user)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(schema.user.id, user.id));
  return { ok: true, message: "Profil mis à jour." };
}

export async function changePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const currentPassword = str(form, "currentPassword");
  const newPassword = str(form, "newPassword");
  if (newPassword.length < 8) return { fieldErrors: { newPassword: "8 caractères minimum" } };
  if (newPassword !== str(form, "confirm")) {
    return { fieldErrors: { confirm: "Les mots de passe ne correspondent pas" } };
  }
  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch {
    return { fieldErrors: { currentPassword: "Mot de passe actuel incorrect" } };
  }
  await db.update(schema.user).set({ mustChangePassword: false }).where(eq(schema.user.id, user.id));
  return { ok: true, message: "Mot de passe modifié. Vos autres sessions ont été déconnectées." };
}

/** Première connexion d'un compte invité : remplace le mot de passe provisoire. */
export async function setInitialPassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser({ allowTemporaryPassword: true });
  if (!user.mustChangePassword) return { ok: true };

  const newPassword = str(form, "newPassword");
  if (newPassword.length < 8) return { fieldErrors: { newPassword: "8 caractères minimum" } };
  if (newPassword !== str(form, "confirm")) {
    return { fieldErrors: { confirm: "Les mots de passe ne correspondent pas" } };
  }

  const credential = await db.query.account.findFirst({
    where: and(eq(schema.account.userId, user.id), eq(schema.account.providerId, "credential")),
  });
  if (!credential?.password) return { error: "Compte introuvable. Contactez le support." };
  if (await verifyPassword({ hash: credential.password, password: newPassword })) {
    return { fieldErrors: { newPassword: "Choisissez un mot de passe différent du mot de passe provisoire" } };
  }

  await db
    .update(schema.account)
    .set({ password: await hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(schema.account.id, credential.id));
  await db
    .update(schema.user)
    .set({ mustChangePassword: false, emailVerified: true, updatedAt: new Date() })
    .where(eq(schema.user.id, user.id));
  return { ok: true, message: "Mot de passe enregistré. Bienvenue sur Puce ID !" };
}

/**
 * Le formulaire « mot de passe oublié » vérifie d'abord que le service d'e-mail est configuré :
 * better-auth répond toujours « envoyé » (anti-énumération), même quand l'e-mail ne peut pas partir.
 */
export async function passwordResetAvailable() {
  return mailConfigured();
}
