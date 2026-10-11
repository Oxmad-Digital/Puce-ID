import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db, schema } from "@/lib/db";
import type { UserRole } from "@/lib/db/schema";
import { appUrl, sendMail } from "@/lib/mail";

/** Sans caractères ambigus (0/O, 1/l/I) pour pouvoir être recopié depuis un e-mail ou un SMS. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Mot de passe provisoire au format « Xk7p-9QaR-m4Tz » (≈ 70 bits d'entropie). */
export function generateTemporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return [0, 4, 8].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

export type InvitedAccount = { userId: string; password: string };

/**
 * Crée un compte avec un mot de passe provisoire à changer dès la première connexion.
 * Retourne null si un compte existe déjà avec cette adresse.
 */
export async function createInvitedAccount(input: {
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  city?: string | null;
}): Promise<InvitedAccount | null> {
  const email = input.email.toLowerCase();
  const existing = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
    columns: { id: true },
  });
  if (existing) return null;

  const userId = crypto.randomUUID();
  const password = generateTemporaryPassword();
  await db.insert(schema.user).values({
    id: userId,
    name: input.name,
    email,
    role: input.role,
    phone: input.phone ?? null,
    city: input.city ?? null,
    mustChangePassword: true,
  });
  await db.insert(schema.account).values({
    id: crypto.randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: await hashPassword(password),
  });
  await claimRecords(userId, email);
  return { userId, password };
}

/** Génère un nouveau mot de passe provisoire pour un compte invité pas encore activé. */
export async function resetTemporaryPassword(userId: string) {
  const password = generateTemporaryPassword();
  await db
    .update(schema.account)
    .set({ password: await hashPassword(password), updatedAt: new Date() })
    .where(and(eq(schema.account.userId, userId), eq(schema.account.providerId, "credential")));
  await db
    .update(schema.user)
    .set({ mustChangePassword: true, updatedAt: new Date() })
    .where(eq(schema.user.id, userId));
  return password;
}

/** E-mail d'invitation contenant les identifiants provisoires. */
export async function sendInvitation(input: {
  to: string;
  name: string;
  password: string;
  subject: string;
  /** Paragraphe expliquant pourquoi la personne est invitée. */
  intro: string;
}) {
  return sendMail({
    to: input.to,
    subject: input.subject,
    text: [
      `Bonjour ${input.name},`,
      "",
      input.intro,
      "",
      "Vos identifiants de connexion :",
      `  • Adresse : ${appUrl("/connexion")}`,
      `  • E-mail : ${input.to}`,
      `  • Mot de passe provisoire : ${input.password}`,
      "",
      "Ce mot de passe est temporaire : vous choisirez votre propre mot de passe lors de votre première connexion.",
      "",
      "Si vous n'attendiez pas ce message, vous pouvez l'ignorer.",
      "",
      "— L'équipe Puce ID",
    ].join("\n"),
  });
}

/**
 * Retrouve le compte propriétaire correspondant à l'e-mail, ou l'invite s'il n'existe pas.
 * `invited` vaut true quand un compte vient d'être créé (et l'e-mail envoyé).
 */
export async function findOrInviteOwner(input: {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  subject: string;
  intro: string;
}): Promise<{ userId: string; invited: boolean }> {
  const email = input.email.toLowerCase();
  const existing = await db.query.user.findFirst({
    where: eq(schema.user.email, email),
    columns: { id: true },
  });
  if (existing) return { userId: existing.id, invited: false };

  const account = await createInvitedAccount({ ...input, email, role: "owner" });
  if (!account) throw new Error(`Compte ${email} créé en parallèle`);
  await sendInvitation({ to: email, name: input.name, password: account.password, subject: input.subject, intro: input.intro });
  return { userId: account.userId, invited: true };
}

/** Rattache au compte les animaux et transferts saisis avec son e-mail. */
export async function claimRecords(userId: string, email: string) {
  await db
    .update(schema.animal)
    .set({ ownerId: userId, ownerConfirmed: true })
    .where(and(eq(schema.animal.ownerEmail, email), isNull(schema.animal.ownerId)));
  await db
    .update(schema.transfer)
    .set({ toUserId: userId })
    .where(and(eq(schema.transfer.toEmail, email), isNull(schema.transfer.toUserId)));
}
