"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { getCurrentUser } from "@/lib/session";
import { isValidChip, normalizeChip } from "@/lib/utils";
import { fieldErrorsFrom, optional, str, type ActionState } from "./state";

const contactSchema = z.object({
  senderName: z.string().max(120).optional(),
  senderContact: z.string().min(5, "Indiquez un téléphone ou un e-mail pour être recontacté"),
  message: z.string().min(10, "Votre message est trop court").max(2000),
});

/** Message anonyme : les coordonnées du propriétaire ne sont jamais révélées. */
export async function contactOwner(chip: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    senderName: str(form, "senderName") || undefined,
    senderContact: str(form, "senderContact"),
    message: str(form, "message"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const found = await db.query.animal.findFirst({
    where: eq(schema.animal.chipNumber, normalizeChip(chip)),
    columns: { id: true, name: true, ownerEmail: true, ownerName: true },
  });
  if (!found) return { error: "Aucun animal n'est enregistré avec ce numéro de puce." };

  await db.insert(schema.contactMessage).values({ animalId: found.id, ...parsed.data });
  if (found.ownerEmail) {
    await sendMail({
      to: found.ownerEmail,
      subject: `Quelqu'un a des nouvelles de ${found.name}`,
      text: `Bonjour ${found.ownerName},\n\n${parsed.data.senderName ?? "Une personne"} vous a laissé un message via Puce ID :\n\n« ${parsed.data.message} »\n\nPour lui répondre : ${parsed.data.senderContact}`,
    });
  }
  return { ok: true, message: "Votre message a été transmis au propriétaire. Merci pour votre aide !" };
}

const disputeSchema = z.object({
  reporterName: z.string().min(2, "Indiquez votre nom"),
  reporterContact: z.string().min(5, "Indiquez un téléphone ou un e-mail"),
  description: z.string().min(20, "Expliquez la situation en quelques phrases").max(3000),
});

export async function disputeRecord(chip: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = disputeSchema.safeParse({
    reporterName: str(form, "reporterName"),
    reporterContact: str(form, "reporterContact"),
    description: str(form, "description"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const found = await db.query.animal.findFirst({
    where: eq(schema.animal.chipNumber, normalizeChip(chip)),
    columns: { id: true },
  });
  const user = await getCurrentUser();
  await db.insert(schema.report).values({
    type: "dispute",
    animalId: found?.id ?? null,
    chipNumber: normalizeChip(chip),
    reporterUserId: user?.id ?? null,
    ...parsed.data,
  });
  return {
    ok: true,
    message: "Votre contestation a été enregistrée. Notre équipe vous recontactera sous 72 h ouvrées.",
  };
}

const lostFoundSchema = z.object({
  type: z.enum(["lost", "found"]),
  chipNumber: z
    .string()
    .optional()
    .refine((v) => !v || isValidChip(v), "Le numéro de puce doit comporter 15 chiffres"),
  species: z.string().min(1, "Précisez l'espèce"),
  location: z.string().min(2, "Indiquez le lieu"),
  occurredAt: z.string().min(1, "Indiquez la date"),
  description: z.string().min(10, "Décrivez l'animal (couleur, collier, signes particuliers…)"),
  reporterName: z.string().min(2, "Indiquez votre nom"),
  reporterContact: z.string().min(5, "Indiquez un téléphone ou un e-mail"),
  photoKey: z.string().optional(),
});

/** Déclaration publique d'un animal perdu ou trouvé. */
export async function declareLostFound(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = lostFoundSchema.safeParse({
    type: str(form, "type"),
    chipNumber: str(form, "chipNumber") || undefined,
    species: str(form, "species"),
    location: str(form, "location"),
    occurredAt: str(form, "occurredAt"),
    description: str(form, "description"),
    reporterName: str(form, "reporterName"),
    reporterContact: str(form, "reporterContact"),
    photoKey: str(form, "photoKey") || undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };

  const data = parsed.data;
  const chip = data.chipNumber ? normalizeChip(data.chipNumber) : null;
  const found = chip
    ? await db.query.animal.findFirst({
        where: eq(schema.animal.chipNumber, chip),
        columns: { id: true, name: true, ownerEmail: true, ownerName: true, ownerId: true },
      })
    : null;
  const user = await getCurrentUser();

  await db.insert(schema.report).values({
    ...data,
    chipNumber: chip,
    animalId: found?.id ?? null,
    reporterUserId: user?.id ?? null,
  });

  if (found) {
    // Le propriétaire ne peut déclarer « perdu » que son propre animal ; « trouvé » est ouvert à tous.
    if (data.type === "found" || found.ownerId === user?.id) {
      await db
        .update(schema.animal)
        .set({ status: data.type, updatedAt: new Date() })
        .where(eq(schema.animal.id, found.id));
    }
    if (data.type === "found" && found.ownerEmail) {
      await sendMail({
        to: found.ownerEmail,
        subject: `${found.name} a peut-être été retrouvé !`,
        text: `Bonjour ${found.ownerName},\n\n${data.reporterName} déclare avoir trouvé votre animal à ${data.location}.\n\n${data.description}\n\nContact : ${data.reporterContact}`,
      });
    }
  }

  return {
    ok: true,
    message: found
      ? "Signalement enregistré : la puce correspond à un animal du registre, son propriétaire est prévenu."
      : "Signalement enregistré et publié dans les annonces Perdu / Trouvé.",
  };
}

const contactFormSchema = z.object({
  name: z.string().min(2, "Indiquez votre nom"),
  email: z.email("Adresse e-mail invalide"),
  subject: z.string().min(2, "Précisez le sujet"),
  message: z.string().min(10, "Votre message est trop court").max(4000),
});

export async function sendContactForm(_prev: ActionState, form: FormData): Promise<ActionState> {
  const parsed = contactFormSchema.safeParse({
    name: str(form, "name"),
    email: str(form, "email"),
    subject: str(form, "subject"),
    message: str(form, "message"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  await sendMail({
    to: process.env.CONTACT_EMAIL ?? "contact@puceid.mg",
    subject: `[Contact] ${parsed.data.subject}`,
    text: `${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}\n\nTéléphone : ${optional(form, "phone") ?? "—"}`,
  });
  return { ok: true, message: "Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement." };
}
