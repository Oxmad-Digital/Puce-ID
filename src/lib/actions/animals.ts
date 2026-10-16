"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { logAccess } from "@/lib/data/queries";
import { createInvitedAccount, findOrInviteOwner, sendInvitation } from "@/lib/invitations";
import { appUrl, sendMail } from "@/lib/mail";
import { deleteObject } from "@/lib/r2";
import { requireUser, type CurrentUser } from "@/lib/session";
import { isValidChip, normalizeChip } from "@/lib/utils";
import { fieldErrorsFrom, optional, str, type ActionState } from "./state";

const { animal, ownershipHistory, report, transfer, clinicTransfer, document } = schema;

const today = () => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/*                         Création / modification                            */
/* -------------------------------------------------------------------------- */

const animalSchema = z.object({
  name: z.string().min(1, "Indiquez le nom de l'animal").max(80),
  species: z.string().min(1, "Choisissez l'espèce"),
  breed: z.string().max(80).nullable(),
  sex: z.enum(["male", "female", "unknown"]),
  birthDate: z.string().nullable(),
  color: z.string().max(200).nullable(),
  status: z.enum(["alive", "lost", "found", "deceased"]),
  chipNumber: z.string().refine(isValidChip, "Le numéro de puce doit comporter exactement 15 chiffres"),
  chipImplantedAt: z.string().nullable(),
  chipLocation: z.string().nullable(),
  implantedByName: z.string().nullable(),
  photoKey: z.string().nullable(),
  ownerName: z.string().min(2, "Indiquez le nom du propriétaire"),
  ownerPhone: z.string().nullable(),
  ownerEmail: z.email("Adresse e-mail invalide").nullable(),
  ownerCity: z.string().nullable(),
});

function readAnimalForm(form: FormData) {
  return {
    name: str(form, "name"),
    species: str(form, "species"),
    breed: optional(form, "breed"),
    sex: str(form, "sex") || "unknown",
    birthDate: optional(form, "birthDate"),
    color: optional(form, "color"),
    status: str(form, "status") || "alive",
    chipNumber: normalizeChip(str(form, "chipNumber")),
    chipImplantedAt: optional(form, "chipImplantedAt"),
    chipLocation: optional(form, "chipLocation"),
    implantedByName: optional(form, "implantedByName"),
    photoKey: optional(form, "photoKey"),
    ownerName: str(form, "ownerName"),
    ownerPhone: optional(form, "ownerPhone"),
    ownerEmail: optional(form, "ownerEmail")?.toLowerCase() ?? null,
    ownerCity: optional(form, "ownerCity"),
  };
}

type EditableAnimal = {
  ownerId: string | null;
  implantedByVetId: string | null;
  registeredById: string | null;
  clinicId: string | null;
};

/** Vétérinaire vérifié de la clinique responsable de l'animal. */
function isClinicVet(u: CurrentUser, a: { clinicId: string | null }) {
  return u.vet?.status === "verified" && a.clinicId !== null && a.clinicId === u.vet.clinicId;
}

function canEdit(u: CurrentUser, a: EditableAnimal) {
  return (
    u.role === "admin" ||
    a.ownerId === u.id ||
    a.implantedByVetId === u.id ||
    a.registeredById === u.id ||
    isClinicVet(u, a)
  );
}

/**
 * Rattache le propriétaire saisi à son compte, ou lui crée un compte invité (mot de passe provisoire).
 * `invitationFailed` : le compte a été créé mais l'e-mail d'invitation n'est pas parti.
 */
async function resolveOwner(
  user: CurrentUser,
  data: { name: string; chipNumber: string; ownerName: string; ownerEmail: string | null; ownerPhone: string | null; ownerCity: string | null },
) {
  if (user.role === "owner") return { ownerId: user.id, invitationFailed: false };
  if (!data.ownerEmail) return { ownerId: null, invitationFailed: false };
  const by = user.vet ? `${user.vet.clinicName} (Dr ${user.name})` : "l'équipe Puce ID";
  const { userId, invited, emailSent } = await findOrInviteOwner({
    name: data.ownerName,
    email: data.ownerEmail,
    phone: data.ownerPhone,
    city: data.ownerCity,
    subject: `${data.name} est enregistré dans le registre Puce ID`,
    intro: `${data.name} vient d'être enregistré dans le registre national des animaux identifiés par ${by} (puce ${data.chipNumber}). Un compte a été créé à votre nom : il vous permet de consulter sa fiche, de mettre à jour vos coordonnées et de le déclarer perdu en cas de disparition.`,
  });
  return { ownerId: userId, invitationFailed: invited && !emailSent };
}

/** Fiche de l'animal, avec un avertissement si l'invitation du propriétaire n'est pas partie. */
function animalUrl(id: string, invitationFailed: boolean) {
  return `/animaux/${id}${invitationFailed ? "?invitation=echec" : ""}`;
}

export async function saveAnimal(
  animalId: string | null,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = animalSchema.safeParse(readAnimalForm(form));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  const data = parsed.data;

  const isVet = user.role === "vet";
  if (isVet && user.vet?.status !== "verified") {
    return { error: "Votre compte vétérinaire doit être vérifié avant de pouvoir enregistrer des animaux." };
  }

  // Unicité de la puce
  const existing = await db.query.animal.findFirst({
    where: eq(animal.chipNumber, data.chipNumber),
    columns: { id: true },
  });
  if (existing && existing.id !== animalId) {
    await db.insert(report).values({
      type: "duplicate",
      animalId: existing.id,
      chipNumber: data.chipNumber,
      reporterUserId: user.id,
      reporterName: user.name,
      description: `Tentative d'enregistrement d'une puce déjà présente (animal « ${data.name} »).`,
    });
    return {
      fieldErrors: {
        chipNumber: "Cette puce est déjà enregistrée. Un signalement de doublon a été transmis à l'équipe.",
      },
    };
  }

  if (animalId) {
    const current = await db.query.animal.findFirst({ where: eq(animal.id, animalId) });
    if (!current || !canEdit(user, current)) return { error: "Vous ne pouvez pas modifier cette fiche." };
    const resolved = current.ownerId ? null : await resolveOwner(user, data);
    const ownerId = current.ownerId ?? resolved?.ownerId ?? null;
    await db
      .update(animal)
      .set({
        ...data,
        ownerId,
        ownerConfirmed: current.ownerConfirmed || ownerId !== null,
        deceasedAt: data.status === "deceased" ? (current.deceasedAt ?? today()) : null,
        updatedAt: new Date(),
      })
      .where(eq(animal.id, animalId));
    await logAccess(user.id, animalId, "animal_updated", data.name);
    revalidatePath(`/animaux/${animalId}`);
    redirect(animalUrl(animalId, resolved?.invitationFailed ?? false));
  }

  const { ownerId, invitationFailed } = await resolveOwner(user, data);
  const [created] = await db
    .insert(animal)
    .values({
      ...data,
      ownerId,
      clinicId: user.vet?.status === "verified" ? user.vet.clinicId : null,
      ownerConfirmed: user.role === "owner" || ownerId !== null,
      implantedByVetId: isVet ? user.id : null,
      implantedByName: isVet ? null : data.implantedByName,
      chipImplantedAt: data.chipImplantedAt ?? (isVet ? today() : null),
      registeredById: user.id,
      deceasedAt: data.status === "deceased" ? today() : null,
    })
    .returning({ id: animal.id });

  await db.insert(ownershipHistory).values([
    {
      animalId: created.id,
      event: "chip",
      ownerName: data.ownerName,
      occurredAt: data.chipImplantedAt ?? today(),
      note: isVet ? `Dr ${user.name}` : (data.implantedByName ?? undefined),
    },
    {
      animalId: created.id,
      event: "registration",
      ownerName: data.ownerName,
      occurredAt: today(),
    },
  ]);
  await logAccess(user.id, created.id, isVet ? "chip_implanted" : "animal_registered", data.name);

  redirect(animalUrl(created.id, invitationFailed));
}

/* -------------------------------------------------------------------------- */
/*                          Changements de statut                             */
/* -------------------------------------------------------------------------- */

async function loadEditable(animalId: string) {
  const user = await requireUser();
  const row = await db.query.animal.findFirst({ where: eq(animal.id, animalId) });
  if (!row) throw new Error("Animal introuvable");
  return { user, row, editable: canEdit(user, row) };
}

export async function declareLost(animalId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const { user, row } = await loadEditable(animalId);
  if (row.ownerId !== user.id && user.role !== "admin") {
    return { error: "Seul le propriétaire peut déclarer son animal disparu." };
  }
  const location = str(form, "location");
  if (location.length < 2) return { fieldErrors: { location: "Indiquez le lieu de disparition" } };

  await db.update(animal).set({ status: "lost", updatedAt: new Date() }).where(eq(animal.id, animalId));
  await db.insert(report).values({
    type: "lost",
    animalId,
    chipNumber: row.chipNumber,
    species: row.species,
    location,
    occurredAt: optional(form, "occurredAt") ?? today(),
    description: optional(form, "description") ?? `${row.name}, ${row.species.toLowerCase()} ${row.color ?? ""}`.trim(),
    reporterName: user.name,
    reporterContact: user.phone ?? user.email,
    reporterUserId: user.id,
    photoKey: row.photoKey,
  });
  revalidatePath(`/animaux/${animalId}`);
  return { ok: true, message: `${row.name} est déclaré disparu. L'alerte est visible par toute personne qui scanne sa puce.` };
}

/** L'animal a été retrouvé : retour au statut « Vivant » et clôture des signalements. */
export async function markFound(animalId: string): Promise<void> {
  const { row, editable } = await loadEditable(animalId);
  if (!editable) return;
  await db.update(animal).set({ status: "alive", updatedAt: new Date() }).where(eq(animal.id, animalId));
  await db
    .update(report)
    .set({ status: "resolved", resolvedAt: new Date() })
    .where(and(eq(report.animalId, row.id), eq(report.status, "open"), or(eq(report.type, "lost"), eq(report.type, "found"))));
  revalidatePath(`/animaux/${animalId}`);
}

export async function declareDeath(animalId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const { user, row, editable } = await loadEditable(animalId);
  const verifiedVet = user.role === "vet" && user.vet?.status === "verified";
  if (!editable && !verifiedVet) return { error: "Action non autorisée." };
  const date = optional(form, "deceasedAt") ?? today();
  await db
    .update(animal)
    .set({ status: "deceased", deceasedAt: date, updatedAt: new Date() })
    .where(eq(animal.id, animalId));
  await logAccess(user.id, animalId, "death_declared", optional(form, "note") ?? row.name);
  revalidatePath(`/animaux/${animalId}`);
  return { ok: true, message: "Le décès a été enregistré." };
}

/** Un vétérinaire déclare qu'un animal pucé a été recueilli dans sa clinique. */
export async function vetDeclareFound(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== "vet" || user.vet?.status !== "verified") return { error: "Réservé aux vétérinaires vérifiés." };
  const chip = normalizeChip(str(form, "chipNumber"));
  if (!isValidChip(chip)) return { fieldErrors: { chipNumber: "15 chiffres attendus" } };
  const row = await db.query.animal.findFirst({ where: eq(animal.chipNumber, chip) });
  if (!row) return { fieldErrors: { chipNumber: "Aucun animal enregistré avec cette puce" } };

  await db.update(animal).set({ status: "found", updatedAt: new Date() }).where(eq(animal.id, row.id));
  await db.insert(report).values({
    type: "found",
    animalId: row.id,
    chipNumber: chip,
    species: row.species,
    location: user.vet.clinicName + ", " + user.vet.city,
    occurredAt: today(),
    description: optional(form, "description") ?? "Animal recueilli à la clinique.",
    reporterName: `Dr ${user.name}`,
    reporterContact: user.phone ?? user.email,
    reporterUserId: user.id,
  });
  await logAccess(user.id, row.id, "found_declared", row.name);
  if (row.ownerEmail) {
    await sendMail({
      to: row.ownerEmail,
      subject: `${row.name} a été retrouvé !`,
      text: `Bonjour ${row.ownerName},\n\n${row.name} a été recueilli par ${user.vet.clinicName} (${user.vet.city}). Contactez la clinique : ${user.phone ?? user.email}.`,
    });
  }
  redirect(`/animaux/${row.id}`);
}

/* -------------------------------------------------------------------------- */
/*                                Transferts                                  */
/* -------------------------------------------------------------------------- */

const transferSchema = z.object({
  toName: z.string().min(2, "Indiquez le nom du nouveau propriétaire"),
  toEmail: z.email("Adresse e-mail invalide"),
  toPhone: z.string().nullable(),
  reason: z.string().nullable(),
});

export async function initiateTransfer(animalId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const { user, row, editable } = await loadEditable(animalId);
  const verifiedVet = user.role === "vet" && user.vet?.status === "verified";
  if (!editable && !verifiedVet) return { error: "Vous ne pouvez pas transférer cet animal." };
  const parsed = transferSchema.safeParse({
    toName: str(form, "toName"),
    toEmail: str(form, "toEmail").toLowerCase(),
    toPhone: optional(form, "toPhone"),
    reason: optional(form, "reason"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const pending = await db.query.transfer.findFirst({
    where: and(eq(transfer.animalId, animalId), eq(transfer.status, "pending")),
  });
  if (pending) return { error: "Un transfert est déjà en attente pour cet animal." };

  const recipient = await db.query.user.findFirst({
    where: eq(schema.user.email, parsed.data.toEmail),
    columns: { id: true },
  });
  // Destinataire sans compte : création d'un compte invité avec mot de passe provisoire.
  const invited = recipient
    ? null
    : await createInvitedAccount({
        name: parsed.data.toName,
        email: parsed.data.toEmail,
        phone: parsed.data.toPhone,
        role: "owner",
      });

  await db.insert(transfer).values({
    animalId,
    fromName: row.ownerName,
    fromUserId: row.ownerId,
    ...parsed.data,
    toUserId: recipient?.id ?? invited?.userId ?? null,
    initiatedById: user.id,
    expiresAt: new Date(Date.now() + 14 * 86400_000),
  });
  await logAccess(user.id, animalId, "transfer_initiated", `→ ${parsed.data.toName}`);
  const proposal = `${row.ownerName} souhaite vous transférer la propriété de ${row.name} (puce ${row.chipNumber}). La demande est valable 14 jours.`;
  const sent = invited
    ? await sendInvitation({
        to: parsed.data.toEmail,
        name: parsed.data.toName,
        password: invited.password,
        subject: `Transfert de propriété : ${row.name}`,
        intro: `${proposal}\nUn compte Puce ID a été créé à votre nom : connectez-vous puis ouvrez « Transferts » pour accepter ou refuser.`,
      })
    : await sendMail({
        to: parsed.data.toEmail,
        subject: `Transfert de propriété : ${row.name}`,
        text: `Bonjour ${parsed.data.toName},\n\n${proposal}\nConnectez-vous pour accepter ou refuser : ${appUrl("/transferts")}`,
      });
  revalidatePath("/transferts");
  if (!sent) {
    // Pas de `ok` : le rafraîchissement fermerait la fenêtre du formulaire, et avec elle ce message.
    return {
      error: `La demande de transfert est enregistrée, mais l'e-mail n'a pas pu être envoyé à ${parsed.data.toName}. Prévenez-le directement : il pourra accepter depuis « Transferts » une fois connecté.`,
    };
  }
  return { ok: true, message: `Invitation envoyée à ${parsed.data.toName}. Le transfert sera effectif après son acceptation.` };
}

export async function respondTransfer(transferId: string, accept: boolean): Promise<void> {
  const user = await requireUser();
  const t = await db.query.transfer.findFirst({ where: eq(transfer.id, transferId), with: { animal: true } });
  if (!t || t.status !== "pending") return;
  const isRecipient = t.toUserId === user.id || t.toEmail === user.email;
  if (!isRecipient && user.role !== "admin") return;

  if (!accept) {
    await db.update(transfer).set({ status: "rejected", resolvedAt: new Date() }).where(eq(transfer.id, t.id));
    revalidatePath("/transferts");
    return;
  }

  await db.update(transfer).set({ status: "accepted", resolvedAt: new Date(), toUserId: user.id }).where(eq(transfer.id, t.id));
  await db
    .update(animal)
    .set({
      ownerId: user.id,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerPhone: user.phone ?? t.toPhone,
      ownerCity: user.city,
      ownerConfirmed: true,
      updatedAt: new Date(),
    })
    .where(eq(animal.id, t.animalId));
  await db.insert(ownershipHistory).values({
    animalId: t.animalId,
    event: "transfer",
    ownerName: user.name,
    occurredAt: today(),
    note: `Cédé par ${t.fromName}`,
  });
  revalidatePath("/transferts");
}

export async function cancelTransfer(transferId: string): Promise<void> {
  const user = await requireUser();
  const t = await db.query.transfer.findFirst({ where: eq(transfer.id, transferId) });
  if (!t || t.status !== "pending") return;
  if (t.initiatedById !== user.id && t.fromUserId !== user.id && user.role !== "admin") return;
  await db.update(transfer).set({ status: "cancelled", resolvedAt: new Date() }).where(eq(transfer.id, t.id));
  revalidatePath("/transferts");
}

/* -------------------------------------------------------------------------- */
/*                          Changement de clinique                            */
/* -------------------------------------------------------------------------- */

/** Adresses d'une clinique : adresse générale et vétérinaires vérifiés. */
async function clinicEmails(clinicId: string) {
  const target = await db.query.clinic.findFirst({
    where: eq(schema.clinic.id, clinicId),
    with: { members: { where: eq(schema.vetProfile.status, "verified"), with: { user: { columns: { email: true } } } } },
  });
  if (!target) return [];
  return [target.email, ...target.members.map((m) => m.user.email)].filter((e): e is string => Boolean(e));
}

/** Notifie les vétérinaires vérifiés (et l'adresse générale) d'une clinique. */
async function notifyClinic(clinicId: string, subject: string, text: string) {
  const to = new Set(await clinicEmails(clinicId));
  await Promise.all([...to].map((email) => sendMail({ to: email, subject, text })));
}

/** Notifie les administrateurs de Puce ID. */
async function notifyAdmins(subject: string, text: string) {
  const admins = await db.query.user.findMany({
    where: eq(schema.user.role, "admin"),
    columns: { email: true },
  });
  await Promise.all(admins.map((a) => sendMail({ to: a.email, subject, text })));
}

async function applyClinicChange(animalId: string, toClinicId: string) {
  await db.update(animal).set({ clinicId: toClinicId, updatedAt: new Date() }).where(eq(animal.id, animalId));
}

export async function initiateClinicTransfer(animalId: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const { user, row } = await loadEditable(animalId);
  // Le propriétaire, la clinique actuelle ou l'administration peuvent changer de clinique responsable.
  const allowed =
    user.role === "admin" ||
    row.ownerId === user.id ||
    isClinicVet(user, row) ||
    (row.clinicId === null && canEdit(user, row));
  if (!allowed) return { error: "Seuls le propriétaire et la clinique responsable peuvent changer de clinique." };

  const toClinicId = str(form, "toClinicId");
  if (!toClinicId) return { fieldErrors: { toClinicId: "Choisissez la nouvelle clinique" } };
  if (toClinicId === row.clinicId) return { fieldErrors: { toClinicId: "L'animal est déjà suivi par cette clinique" } };
  const target = await db.query.clinic.findFirst({
    where: eq(schema.clinic.id, toClinicId),
    with: { members: { where: eq(schema.vetProfile.status, "verified"), columns: { userId: true } } },
  });
  if (!target || target.members.length === 0) return { fieldErrors: { toClinicId: "Clinique introuvable" } };

  const pending = await db.query.clinicTransfer.findFirst({
    where: and(eq(clinicTransfer.animalId, animalId), eq(clinicTransfer.status, "pending")),
  });
  if (pending) return { error: "Un changement de clinique est déjà en attente pour cet animal." };

  const reason = optional(form, "reason");
  // Changement immédiat pour l'administration, ou si la clinique d'accueil prend en charge un animal
  // sans clinique (aucun dossier n'est retiré à personne). Sinon, seule l'administration valide.
  const immediate =
    user.role === "admin" ||
    (row.clinicId === null && user.vet?.status === "verified" && user.vet.clinicId === toClinicId);
  await db.insert(clinicTransfer).values({
    animalId,
    fromClinicId: row.clinicId,
    toClinicId,
    initiatedById: user.id,
    reason,
    status: immediate ? "accepted" : "pending",
    resolvedAt: immediate ? new Date() : null,
    expiresAt: new Date(Date.now() + 14 * 86400_000),
  });
  await logAccess(user.id, animalId, "clinic_transfer_initiated", `→ ${target.name}`);

  if (immediate) {
    await applyClinicChange(animalId, toClinicId);
    revalidatePath(`/animaux/${animalId}`);
    return { ok: true, message: `${row.name} est désormais suivi par ${target.name}.` };
  }

  const fromClinic = row.clinicId
    ? await db.query.clinic.findFirst({ where: eq(schema.clinic.id, row.clinicId), columns: { name: true } })
    : null;
  await notifyAdmins(
    `Demande de transfert de dossier à valider : ${row.name}`,
    `Bonjour,\n\n${user.name} demande le transfert du dossier de ${row.name} (${row.species.toLowerCase()}, puce ${row.chipNumber}) de ${fromClinic?.name ?? "« sans clinique »"} vers ${target.name} (${target.city}).${reason ? `\nMotif : ${reason}` : ""}\n\nValidez ou refusez la demande dans les 14 jours : ${appUrl("/transferts")}`,
  );
  revalidatePath(`/animaux/${animalId}`);
  revalidatePath("/transferts");
  return {
    ok: true,
    message: `Demande de transfert vers ${target.name} envoyée. Le changement sera effectif après validation par l'administration.`,
  };
}

export async function respondClinicTransfer(transferId: string, accept: boolean): Promise<void> {
  const user = await requireUser();
  // Seule l'administration valide ou refuse un transfert de dossier.
  if (user.role !== "admin") return;
  const t = await db.query.clinicTransfer.findFirst({
    where: eq(clinicTransfer.id, transferId),
    with: { animal: true, toClinic: true },
  });
  if (!t || t.status !== "pending") return;

  const expired = t.expiresAt < new Date();
  const status = accept && !expired ? "accepted" : expired ? "cancelled" : "rejected";
  await db
    .update(clinicTransfer)
    .set({ status, resolvedAt: new Date() })
    .where(eq(clinicTransfer.id, t.id));

  // Résultat communiqué à la personne qui a lancé la demande et à la clinique d'origine.
  if (status !== "cancelled") {
    const outcome = status === "accepted" ? "validé" : "refusé";
    const initiator = t.initiatedById
      ? await db.query.user.findFirst({ where: eq(schema.user.id, t.initiatedById), columns: { email: true } })
      : null;
    const fromEmails = t.fromClinicId ? await clinicEmails(t.fromClinicId) : [];
    const to = new Set([...fromEmails, initiator?.email].filter((e): e is string => Boolean(e)));
    const subject = `Transfert du dossier de ${t.animal.name} ${outcome}`;
    const text = `Bonjour,\n\nL'administration de Puce ID a ${outcome} le transfert du dossier de ${t.animal.name} (puce ${t.animal.chipNumber}) vers ${t.toClinic.name} (${t.toClinic.city}).\n\n${appUrl(`/animaux/${t.animalId}`)}`;
    await Promise.all([...to].map((email) => sendMail({ to: email, subject, text })));
  }

  if (status === "accepted") {
    await applyClinicChange(t.animalId, t.toClinicId);
    await notifyClinic(
      t.toClinicId,
      `Nouveau patient : ${t.animal.name}`,
      `Bonjour,\n\n${t.toClinic.name} est désormais la clinique responsable de ${t.animal.name} (${t.animal.species.toLowerCase()}, puce ${t.animal.chipNumber}).\n\n${appUrl(`/animaux/${t.animalId}`)}`,
    );
    if (t.animal.ownerEmail) {
      await sendMail({
        to: t.animal.ownerEmail,
        subject: `${t.animal.name} est suivi par ${t.toClinic.name}`,
        text: `Bonjour ${t.animal.ownerName},\n\n${t.toClinic.name} (${t.toClinic.city}) est désormais la clinique responsable de ${t.animal.name} dans le registre Puce ID.${t.toClinic.phone ? `\nTéléphone de la clinique : ${t.toClinic.phone}` : ""}`,
      });
    }
  }
  revalidatePath("/transferts");
  revalidatePath(`/animaux/${t.animalId}`);
}

export async function cancelClinicTransfer(transferId: string): Promise<void> {
  const user = await requireUser();
  const t = await db.query.clinicTransfer.findFirst({ where: eq(clinicTransfer.id, transferId) });
  if (!t || t.status !== "pending") return;
  const fromClinic = user.vet?.status === "verified" && t.fromClinicId !== null && user.vet.clinicId === t.fromClinicId;
  if (t.initiatedById !== user.id && !fromClinic && user.role !== "admin") return;
  await db
    .update(clinicTransfer)
    .set({ status: "cancelled", resolvedAt: new Date() })
    .where(eq(clinicTransfer.id, t.id));
  revalidatePath("/transferts");
  revalidatePath(`/animaux/${t.animalId}`);
}

/* -------------------------------------------------------------------------- */
/*                                Documents                                   */
/* -------------------------------------------------------------------------- */

export async function addDocument(
  animalId: string,
  file: { key: string; fileName: string; contentType: string; size: number },
): Promise<void> {
  const { user, editable } = await loadEditable(animalId);
  if (!editable || !file.key.startsWith("documents/")) return;
  await db.insert(document).values({
    animalId,
    key: file.key,
    fileName: file.fileName.slice(0, 200),
    mimeType: file.contentType,
    size: file.size,
    uploadedById: user.id,
  });
  revalidatePath(`/animaux/${animalId}`);
}

export async function removeDocument(documentId: string): Promise<void> {
  const user = await requireUser();
  const doc = await db.query.document.findFirst({ where: eq(document.id, documentId), with: { animal: true } });
  if (!doc || !canEdit(user, doc.animal)) return;
  await db.delete(document).where(eq(document.id, doc.id));
  await deleteObject(doc.key).catch(() => undefined);
  revalidatePath(`/animaux/${doc.animalId}`);
}

/* -------------------------------------------------------------------------- */
/*                               Signalements                                 */
/* -------------------------------------------------------------------------- */

export async function resolveReport(reportId: string, dismiss = false): Promise<void> {
  const user = await requireUser();
  const r = await db.query.report.findFirst({ where: eq(report.id, reportId), with: { animal: true } });
  if (!r) return;
  const allowed =
    user.role === "admin" ||
    r.reporterUserId === user.id ||
    (r.animal && canEdit(user, r.animal));
  if (!allowed) return;
  await db
    .update(report)
    .set({ status: dismiss ? "dismissed" : "resolved", resolvedAt: new Date() })
    .where(eq(report.id, r.id));
  if (r.animal && (r.type === "lost" || r.type === "found") && !dismiss) {
    await db.update(animal).set({ status: "alive", updatedAt: new Date() }).where(eq(animal.id, r.animal.id));
  }
  revalidatePath("/signalements");
}
