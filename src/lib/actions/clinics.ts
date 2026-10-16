"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { logAccess } from "@/lib/data/queries";
import { createInvitedAccount, resetTemporaryPassword, sendInvitation } from "@/lib/invitations";
import { isClinicManager, requireUser, type CurrentUser } from "@/lib/session";
import { fieldErrorsFrom, optional, str, type ActionState } from "./state";

const { clinic, vetProfile } = schema;

function revalidateClinicPages() {
  revalidatePath("/admin/veterinaires");
  revalidatePath("/veterinaire/clinique");
}

/** Administrateur, ou responsable vérifié de la clinique concernée. */
function canManage(user: CurrentUser, clinicId: string) {
  return user.role === "admin" || (isClinicManager(user) && user.vet?.clinicId === clinicId);
}

/* -------------------------------------------------------------------------- */
/*                         Informations de la clinique                        */
/* -------------------------------------------------------------------------- */

const clinicSchema = z.object({
  name: z.string().min(2, "Indiquez le nom de la clinique"),
  city: z.string().min(2, "Indiquez la ville"),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.email("Adresse e-mail invalide").nullable(),
});

function readClinicForm(form: FormData) {
  return {
    name: str(form, "clinicName"),
    city: str(form, "city"),
    address: optional(form, "address"),
    phone: optional(form, "clinicPhone"),
    email: optional(form, "clinicEmail")?.toLowerCase() ?? null,
  };
}

export async function updateClinic(clinicId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!canManage(user, clinicId)) return { error: "Seul le responsable de la clinique peut modifier ces informations." };
  const parsed = clinicSchema.safeParse(readClinicForm(form));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues, { name: "clinicName", phone: "clinicPhone", email: "clinicEmail" }) };
  await db
    .update(clinic)
    .set({ ...parsed.data, listedPublicly: form.get("listedPublicly") === "on" })
    .where(eq(clinic.id, clinicId));
  revalidateClinicPages();
  return { ok: true, message: "Informations de la clinique mises à jour." };
}

/* -------------------------------------------------------------------------- */
/*                                 Invitations                                */
/* -------------------------------------------------------------------------- */

const vetSchema = z.object({
  vetName: z.string().min(2, "Indiquez le nom du vétérinaire"),
  vetEmail: z.email("Adresse e-mail invalide"),
  vetPhone: z.string().nullable(),
  orderNumber: z.string().min(2, "Indiquez le numéro d'ordre"),
});

function readVetForm(form: FormData) {
  return {
    vetName: str(form, "vetName"),
    vetEmail: str(form, "vetEmail").toLowerCase(),
    vetPhone: optional(form, "vetPhone"),
    orderNumber: str(form, "orderNumber"),
  };
}

const EMAIL_TAKEN = { fieldErrors: { vetEmail: "Un compte existe déjà avec cette adresse." } };

/** Compte créé mais e-mail non parti : `ok` pour rafraîchir la liste, `error` pour prévenir l'utilisateur. */
function invitationNotSent(name: string): ActionState {
  return {
    ok: true,
    error: `Le compte de ${name} a été créé, mais l'e-mail d'invitation n'a pas pu être envoyé. Réessayez plus tard avec « Renvoyer l'invitation ».`,
  };
}

/** L'administration invite une nouvelle clinique et son vétérinaire responsable (déjà vérifié). */
export async function inviteClinic(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireUser();
  if (admin.role !== "admin") return { error: "Réservé à l'administration." };

  const clinicData = clinicSchema.safeParse(readClinicForm(form));
  const vetData = vetSchema.safeParse(readVetForm(form));
  if (!clinicData.success || !vetData.success) {
    return {
      fieldErrors: {
        ...(clinicData.success ? {} : fieldErrorsFrom(clinicData.error.issues, { name: "clinicName", phone: "clinicPhone", email: "clinicEmail" })),
        ...(vetData.success ? {} : fieldErrorsFrom(vetData.error.issues)),
      },
    };
  }
  const c = clinicData.data;
  const v = vetData.data;

  const account = await createInvitedAccount({ name: v.vetName, email: v.vetEmail, phone: v.vetPhone, city: c.city, role: "vet" });
  if (!account) return EMAIL_TAKEN;

  const [created] = await db
    .insert(clinic)
    .values({ ...c, listedPublicly: form.get("listedPublicly") === "on" })
    .returning({ id: clinic.id });
  await db.insert(vetProfile).values({
    userId: account.userId,
    clinicId: created.id,
    clinicRole: "manager",
    orderNumber: v.orderNumber,
    status: "verified",
    verifiedAt: new Date(),
  });
  const sent = await sendInvitation({
    to: v.vetEmail,
    name: `Dr ${v.vetName}`,
    password: account.password,
    subject: `${c.name} est invitée sur Puce ID`,
    intro: `${c.name} (${c.city}) est invitée à rejoindre Puce ID, le registre national des animaux identifiés par puce électronique. Vous en êtes le vétérinaire responsable : vous pourrez enregistrer vos patients, lire les puces, gérer les transferts et inviter vos confrères depuis l'espace « Ma clinique ».`,
  });
  revalidateClinicPages();
  if (!sent) return invitationNotSent(`Dr ${v.vetName}`);
  await logAccess(admin.id, null, "invitation_sent", `Clinique ${c.name} — Dr ${v.vetName}`);
  return { ok: true, message: `Invitation envoyée à Dr ${v.vetName} (${v.vetEmail}).` };
}

/**
 * Le responsable d'une clinique (ou l'administration) invite un confrère.
 * Le numéro d'ordre d'un vétérinaire invité par sa clinique reste soumis à vérification.
 */
export async function inviteColleague(clinicId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!canManage(user, clinicId)) return { error: "Seul le responsable de la clinique peut inviter des confrères." };
  const parsed = vetSchema.safeParse(readVetForm(form));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  const v = parsed.data;

  const target = await db.query.clinic.findFirst({ where: eq(clinic.id, clinicId) });
  if (!target) return { error: "Clinique introuvable." };

  const account = await createInvitedAccount({ name: v.vetName, email: v.vetEmail, phone: v.vetPhone, city: target.city, role: "vet" });
  if (!account) return EMAIL_TAKEN;

  const byAdmin = user.role === "admin";
  await db.insert(vetProfile).values({
    userId: account.userId,
    clinicId,
    clinicRole: form.get("manager") === "on" ? "manager" : "member",
    orderNumber: v.orderNumber,
    status: byAdmin ? "verified" : "pending",
    verifiedAt: byAdmin ? new Date() : null,
  });
  const sent = await sendInvitation({
    to: v.vetEmail,
    name: `Dr ${v.vetName}`,
    password: account.password,
    subject: `Invitation à rejoindre ${target.name} sur Puce ID`,
    intro:
      `${byAdmin ? "L'équipe Puce ID" : `Dr ${user.name}`} vous invite à rejoindre ${target.name} (${target.city}) sur Puce ID, le registre national des animaux identifiés.` +
      (byAdmin ? "" : "\nVotre numéro d'ordre sera vérifié par notre équipe avant l'accès aux coordonnées des propriétaires et l'enregistrement de puces."),
  });
  revalidateClinicPages();
  if (!sent) return invitationNotSent(`Dr ${v.vetName}`);
  await logAccess(user.id, null, "invitation_sent", `Dr ${v.vetName} → ${target.name}`);
  return { ok: true, message: `Invitation envoyée à Dr ${v.vetName} (${v.vetEmail}).` };
}

/** Renvoie l'invitation avec un nouveau mot de passe provisoire (compte pas encore activé). */
export async function resendInvitation(userId: string): Promise<ActionState> {
  const user = await requireUser();
  const invitee = await db.query.user.findFirst({
    where: eq(schema.user.id, userId),
    with: { vetProfile: { with: { clinic: true } } },
  });
  if (!invitee?.mustChangePassword) return { error: "Ce compte est déjà activé." };
  const clinicId = invitee.vetProfile?.clinicId;
  if (user.role !== "admin" && !(clinicId && canManage(user, clinicId))) return { error: "Action non autorisée." };

  const password = await resetTemporaryPassword(invitee.id);
  const clinicName = invitee.vetProfile?.clinic.name;
  const sent = await sendInvitation({
    to: invitee.email,
    name: invitee.role === "vet" ? `Dr ${invitee.name}` : invitee.name,
    password,
    subject: "Rappel : votre invitation Puce ID",
    intro: clinicName
      ? `Vous avez été invité à rejoindre ${clinicName} sur Puce ID, le registre national des animaux identifiés. Voici un nouveau mot de passe provisoire (le précédent n'est plus valable).`
      : "Un compte Puce ID a été créé à votre nom. Voici un nouveau mot de passe provisoire (le précédent n'est plus valable).",
  });
  if (!sent) return { error: "L'e-mail d'invitation n'a pas pu être envoyé. Réessayez dans quelques minutes." };
  await logAccess(user.id, null, "invitation_sent", `Relance ${invitee.email}`);
  revalidateClinicPages();
  return { ok: true, message: `Invitation renvoyée à ${invitee.email}.` };
}

/* -------------------------------------------------------------------------- */
/*                                   Droits                                   */
/* -------------------------------------------------------------------------- */

/** Nomme un membre responsable de la clinique, ou le repasse simple membre. */
export async function setClinicRole(userId: string, role: "manager" | "member"): Promise<void> {
  const user = await requireUser();
  const member = await db.query.vetProfile.findFirst({ where: eq(vetProfile.userId, userId) });
  if (!member || !canManage(user, member.clinicId)) return;

  if (role === "member") {
    // La clinique doit conserver au moins un responsable.
    const [managers] = await db
      .select({ total: count() })
      .from(vetProfile)
      .where(and(eq(vetProfile.clinicId, member.clinicId), eq(vetProfile.clinicRole, "manager")));
    if (managers.total <= 1) return;
  }
  await db.update(vetProfile).set({ clinicRole: role }).where(eq(vetProfile.userId, userId));
  revalidateClinicPages();
}
