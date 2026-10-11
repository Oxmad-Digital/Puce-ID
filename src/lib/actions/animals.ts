"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { logAccess } from "@/lib/data/queries";
import { sendMail } from "@/lib/mail";
import { deleteObject } from "@/lib/r2";
import { requireUser, type CurrentUser } from "@/lib/session";
import { isValidChip, normalizeChip } from "@/lib/utils";
import { fieldErrorsFrom, optional, str, type ActionState } from "./state";

const { animal, ownershipHistory, report, transfer, document } = schema;

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

function canEdit(u: CurrentUser, a: { ownerId: string | null; implantedByVetId: string | null; registeredById: string | null }) {
  return u.role === "admin" || a.ownerId === u.id || a.implantedByVetId === u.id || a.registeredById === u.id;
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

  // Le propriétaire saisi est-il déjà inscrit ?
  let ownerId: string | null = user.role === "owner" ? user.id : null;
  if (!ownerId && data.ownerEmail) {
    const match = await db.query.user.findFirst({
      where: eq(schema.user.email, data.ownerEmail),
      columns: { id: true },
    });
    ownerId = match?.id ?? null;
  }

  if (animalId) {
    const current = await db.query.animal.findFirst({ where: eq(animal.id, animalId) });
    if (!current || !canEdit(user, current)) return { error: "Vous ne pouvez pas modifier cette fiche." };
    await db
      .update(animal)
      .set({
        ...data,
        ownerId: current.ownerId ?? ownerId,
        deceasedAt: data.status === "deceased" ? (current.deceasedAt ?? today()) : null,
        updatedAt: new Date(),
      })
      .where(eq(animal.id, animalId));
    await logAccess(user.id, animalId, "animal_updated", data.name);
    revalidatePath(`/animaux/${animalId}`);
    redirect(`/animaux/${animalId}`);
  }

  const [created] = await db
    .insert(animal)
    .values({
      ...data,
      ownerId,
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

  if (isVet && data.ownerEmail && !ownerId) {
    await sendMail({
      to: data.ownerEmail,
      subject: `${data.name} est enregistré dans le registre PawSafe`,
      text: `Bonjour ${data.ownerName},\n\n${data.name} vient d'être identifié par le Dr ${user.name} (puce ${data.chipNumber}).\nCréez votre compte avec cette adresse e-mail pour retrouver sa fiche : ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/inscription`,
    });
  }

  redirect(`/animaux/${created.id}`);
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

  await db.insert(transfer).values({
    animalId,
    fromName: row.ownerName,
    fromUserId: row.ownerId,
    ...parsed.data,
    toUserId: recipient?.id ?? null,
    initiatedById: user.id,
    expiresAt: new Date(Date.now() + 14 * 86400_000),
  });
  await logAccess(user.id, animalId, "transfer_initiated", `→ ${parsed.data.toName}`);
  await sendMail({
    to: parsed.data.toEmail,
    subject: `Transfert de propriété : ${row.name}`,
    text: `Bonjour ${parsed.data.toName},\n\n${row.ownerName} souhaite vous transférer la propriété de ${row.name} (puce ${row.chipNumber}).\nConnectez-vous ou créez un compte avec cette adresse pour accepter : ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/transferts\n\nCe lien expire dans 14 jours.`,
  });
  revalidatePath("/transferts");
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
