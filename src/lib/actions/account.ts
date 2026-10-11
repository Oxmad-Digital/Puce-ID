"use server";

import { headers } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { fieldErrorsFrom, optional, str, type ActionState } from "./state";

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
    await db.update(schema.user).set({ role: "vet" }).where(eq(schema.user.id, userId));
    await db.insert(schema.vetProfile).values({
      userId,
      clinicName: d.clinicName!,
      orderNumber: d.orderNumber!,
      city: d.city!,
      phone: d.phone,
    });
  }

  await claimRecords(userId, d.email);
  return { ok: true };
}

/** Rattache au nouveau compte les animaux et transferts saisis avec son e-mail. */
async function claimRecords(userId: string, email: string) {
  await db
    .update(schema.animal)
    .set({ ownerId: userId })
    .where(and(eq(schema.animal.ownerEmail, email), isNull(schema.animal.ownerId)));
  await db
    .update(schema.transfer)
    .set({ toUserId: userId })
    .where(and(eq(schema.transfer.toEmail, email), isNull(schema.transfer.toUserId)));
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

export async function updateVetProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== "vet") return { error: "Réservé aux vétérinaires." };
  const clinicName = str(form, "clinicName");
  const city = str(form, "city");
  if (clinicName.length < 2) return { fieldErrors: { clinicName: "Indiquez le nom de la clinique" } };
  if (city.length < 2) return { fieldErrors: { city: "Indiquez la ville" } };
  await db
    .update(schema.vetProfile)
    .set({
      clinicName,
      city,
      address: optional(form, "address"),
      phone: optional(form, "clinicPhone"),
      listedPublicly: form.get("listedPublicly") === "on",
    })
    .where(eq(schema.vetProfile.userId, user.id));
  return { ok: true, message: "Informations de la clinique mises à jour." };
}

export async function changePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireUser();
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
  return { ok: true, message: "Mot de passe modifié. Vos autres sessions ont été déconnectées." };
}
