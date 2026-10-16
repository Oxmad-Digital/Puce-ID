"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { logAccess } from "@/lib/data/queries";
import { claimRecords, findOrInviteOwner } from "@/lib/invitations";
import { appUrl, sendMail } from "@/lib/mail";
import { requireRole, requireUser } from "@/lib/session";
import { isValidChip, normalizeChip } from "@/lib/utils";
import type { ActionState } from "./state";

export type ImportResult = ActionState & {
  imported?: number;
  errors?: { line: number; message: string }[];
};

const SEX: Record<string, "male" | "female" | "unknown"> = {
  m: "male", male: "male", mâle: "male", male_: "male",
  f: "female", femelle: "female", female: "female",
};

/** Parse un CSV simple (séparateur , ou ;, guillemets doubles). */
function parseCsv(text: string): string[][] {
  const sep = (text.split("\n")[0].match(/;/g)?.length ?? 0) > (text.split("\n")[0].match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(cell.trim()); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim()); cell = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

/** Accepte JJ/MM/AAAA ou AAAA-MM-JJ. */
function parseDate(v: string | undefined) {
  if (!v) return null;
  const fr = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (fr) return `${fr[3]}-${fr[2].padStart(2, "0")}-${fr[1].padStart(2, "0")}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

export async function importCsv(_prev: ImportResult, form: FormData): Promise<ImportResult> {
  const user = await requireRole("vet", "admin");
  if (user.role === "vet" && user.vet?.status !== "verified") {
    return { error: "Votre compte doit être vérifié pour importer des animaux." };
  }
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choisissez un fichier CSV." };
  if (file.size > 2 * 1024 * 1024) return { error: "Fichier trop volumineux (2 Mo maximum)." };

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { error: "Le fichier ne contient aucune ligne de données." };

  const header = rows[0].map((h) => h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_"));
  const col = (r: string[], name: string) => {
    const i = header.indexOf(name);
    return i >= 0 ? r[i] || undefined : undefined;
  };
  for (const required of ["nom", "espece", "numero_puce", "proprietaire_nom"]) {
    if (!header.includes(required)) return { error: `Colonne obligatoire manquante : ${required}` };
  }

  const errors: { line: number; message: string }[] = [];
  const candidates: (typeof schema.animal.$inferInsert)[] = [];
  const seen = new Set<string>();

  rows.slice(1).forEach((r, idx) => {
    const line = idx + 2;
    const chip = normalizeChip(col(r, "numero_puce") ?? "");
    const name = col(r, "nom");
    const species = col(r, "espece");
    const ownerName = col(r, "proprietaire_nom");
    if (!name || !species || !ownerName) return errors.push({ line, message: "Nom, espèce ou propriétaire manquant" });
    if (!isValidChip(chip)) return errors.push({ line, message: `Numéro de puce invalide (${chip || "vide"})` });
    if (seen.has(chip)) return errors.push({ line, message: "Puce présente deux fois dans le fichier" });
    seen.add(chip);
    candidates.push({
      name,
      species,
      breed: col(r, "race") ?? null,
      sex: SEX[(col(r, "sexe") ?? "").toLowerCase()] ?? "unknown",
      birthDate: parseDate(col(r, "date_naissance")),
      color: col(r, "couleur") ?? null,
      chipNumber: chip,
      chipImplantedAt: parseDate(col(r, "date_pose")),
      ownerName,
      ownerPhone: col(r, "proprietaire_telephone") ?? null,
      ownerEmail: col(r, "proprietaire_email")?.toLowerCase() ?? null,
      ownerCity: col(r, "proprietaire_ville") ?? null,
      implantedByVetId: user.id,
      registeredById: user.id,
      clinicId: user.vet?.status === "verified" ? user.vet.clinicId : null,
    });
  });

  if (candidates.length) {
    const taken = await db
      .select({ chip: schema.animal.chipNumber })
      .from(schema.animal)
      .where(inArray(schema.animal.chipNumber, candidates.map((c) => c.chipNumber)));
    const takenSet = new Set(taken.map((t) => t.chip));
    const fresh = candidates.filter((c) => {
      if (takenSet.has(c.chipNumber)) {
        errors.push({ line: 0, message: `Puce ${c.chipNumber} déjà enregistrée — ignorée` });
        return false;
      }
      return true;
    });
    if (fresh.length) {
      const inserted = await db.insert(schema.animal).values(fresh).returning({ id: schema.animal.id, ownerName: schema.animal.ownerName, chipImplantedAt: schema.animal.chipImplantedAt });
      await db.insert(schema.ownershipHistory).values(
        inserted.map((a) => ({
          animalId: a.id,
          event: "registration" as const,
          ownerName: a.ownerName,
          occurredAt: a.chipImplantedAt ?? new Date().toISOString().slice(0, 10),
          note: "Import CSV",
        })),
      );
    }
    await logAccess(user.id, null, "csv_import", `${fresh.length} animaux importés`);

    // Propriétaires : rattachement aux comptes existants, sinon invitation avec mot de passe provisoire.
    const owners = new Map<string, (typeof fresh)[number]>();
    for (const a of fresh) if (a.ownerEmail && !owners.has(a.ownerEmail)) owners.set(a.ownerEmail, a);
    const by = user.vet ? `${user.vet.clinicName} (Dr ${user.name})` : "l'équipe Puce ID";
    let invitedCount = 0;
    let unsentCount = 0;
    for (const [email, a] of owners) {
      const { userId, invited, emailSent } = await findOrInviteOwner({
        name: a.ownerName,
        email,
        phone: a.ownerPhone,
        city: a.ownerCity,
        subject: "Votre animal est enregistré dans le registre Puce ID",
        intro: `${by} a enregistré votre animal « ${a.name} » dans le registre national des animaux identifiés (puce ${a.chipNumber}). Un compte a été créé à votre nom pour consulter sa fiche et mettre à jour vos coordonnées.`,
      });
      if (invited && emailSent) invitedCount++;
      else if (invited) unsentCount++;
      else await claimRecords(userId, email);
    }
    revalidatePath("/veterinaire/patients");
    return {
      ok: true,
      imported: fresh.length,
      errors,
      message:
        `${fresh.length} animal${fresh.length > 1 ? "aux importés" : " importé"}.` +
        (invitedCount ? ` ${invitedCount} propriétaire${invitedCount > 1 ? "s ont" : " a"} reçu une invitation par e-mail.` : ""),
      error: unsentCount
        ? `${unsentCount} invitation${unsentCount > 1 ? "s n'ont" : " n'a"} pas pu être envoyée${unsentCount > 1 ? "s" : ""} par e-mail : les comptes sont créés, contactez l'administration pour les renvoyer.`
        : undefined,
    };
  }
  return { ok: false, imported: 0, errors, error: "Aucune ligne valide à importer." };
}

/* ------------------------------- Admin ------------------------------------ */

export async function reviewVet(userId: string, approve: boolean): Promise<ActionState> {
  const admin = await requireUser();
  if (admin.role !== "admin") return { error: "Réservé à l'administration." };
  const [profile] = await db
    .update(schema.vetProfile)
    .set({ status: approve ? "verified" : "rejected", verifiedAt: approve ? new Date() : null })
    .where(eq(schema.vetProfile.userId, userId))
    .returning({ status: schema.vetProfile.status });
  const vet = await db.query.user.findFirst({ where: eq(schema.user.id, userId), columns: { name: true, email: true } });
  if (!profile || !vet) return { error: "Vétérinaire introuvable." };
  revalidatePath("/admin");
  revalidatePath("/admin/veterinaires");
  const sent = await sendMail({
    to: vet.email,
    subject: approve ? "Votre compte vétérinaire Puce ID est validé" : "Votre compte vétérinaire Puce ID",
    text: approve
      ? `Bonjour Dr ${vet.name},\n\nVotre numéro d'ordre a été vérifié : vous pouvez désormais enregistrer des puces et consulter les coordonnées des propriétaires.\n\n${appUrl("/connexion")}`
      : `Bonjour Dr ${vet.name},\n\nVotre accès vétérinaire n'a pas été validé ou a été suspendu. Pour toute question, répondez à ce message ou écrivez à ${process.env.CONTACT_EMAIL ?? "contact@puceid.mg"}.`,
  });
  if (!sent) {
    // Pas de `ok` : le rafraîchissement retirerait la ligne, et avec elle ce message.
    return {
      error: `Statut de Dr ${vet.name} mis à jour, mais l'e-mail de notification n'a pas pu lui être envoyé.`,
    };
  }
  return { ok: true };
}
