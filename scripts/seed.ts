/**
 * Données de démonstration reprises des maquettes (Kiki, Rex, Mimi, Bella, Coco…).
 * Usage : npm run db:seed  — le mot de passe de tous les comptes est « pawsafe2026 ».
 */
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { hashPassword } from "better-auth/crypto";
import * as schema from "../src/lib/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });
const PASSWORD = "pawsafe2026";

type SeedUser = { id: string; name: string; email: string; role: "owner" | "vet" | "admin"; phone: string; city: string };

const users: SeedUser[] = [
  { id: "usr_admin", name: "Admin PawSafe", email: "admin@pawsafe.mg", role: "admin", phone: "+261 34 00 000 00", city: "Antananarivo" },
  { id: "usr_rakoto", name: "Hery Rakoto", email: "dr.rakoto@pawsafe.mg", role: "vet", phone: "+261 34 11 222 33", city: "Antananarivo" },
  { id: "usr_rasolo", name: "Fara Rasolo", email: "dr.rasolo@pawsafe.mg", role: "vet", phone: "+261 32 44 555 66", city: "Mahajanga" },
  { id: "usr_randria", name: "Lova Randrianarisoa", email: "dr.lova@pawsafe.mg", role: "vet", phone: "+261 33 77 888 99", city: "Toamasina" },
  { id: "usr_pending", name: "Mamy Razafy", email: "dr.razafy@pawsafe.mg", role: "vet", phone: "+261 34 98 765 43", city: "Fianarantsoa" },
  { id: "usr_rasoa", name: "Rasoa Andrianina", email: "rasoa@example.mg", role: "owner", phone: "+261 34 12 345 67", city: "Antananarivo" },
  { id: "usr_hery", name: "Hery Randria", email: "hery@example.mg", role: "owner", phone: "+261 33 23 456 78", city: "Antsirabe" },
];

const vets = [
  { userId: "usr_rakoto", clinicName: "Clinique Ambohijatovo", orderNumber: "1234", city: "Antananarivo", address: "Lot II J 45 Ambohijatovo", status: "verified" as const },
  { userId: "usr_rasolo", clinicName: "Cabinet vétérinaire du Port", orderNumber: "2087", city: "Mahajanga", address: "Rue du Port", status: "verified" as const },
  { userId: "usr_randria", clinicName: "Vétérinaire de l'Est", orderNumber: "1876", city: "Toamasina", address: "Bd Joffre", status: "verified" as const },
  { userId: "usr_pending", clinicName: "Clinique des Hautes Terres", orderNumber: "2411", city: "Fianarantsoa", address: null, status: "pending" as const },
];

const animals = [
  { name: "Kiki", species: "Chat", breed: "Européen", sex: "female", birthDate: "2023-02-14", color: "Tigré gris", status: "alive", chipNumber: "450200000123456", chipImplantedAt: "2023-03-15", ownerId: "usr_rasoa", ownerName: "Rasoa Andrianina", ownerPhone: "+261 34 12 345 67", ownerEmail: "rasoa@example.mg", ownerCity: "Antananarivo" },
  { name: "Rex", species: "Chien", breed: "Berger malinois", sex: "male", birthDate: "2021-06-02", color: "Fauve charbonné", status: "alive", chipNumber: "450200000234567", chipImplantedAt: "2021-08-10", ownerId: null, ownerName: "Jean Rakoto", ownerPhone: "+261 34 55 666 77", ownerEmail: "jean.rakoto@example.mg", ownerCity: "Antananarivo" },
  { name: "Mimi", species: "Chat", breed: "Siamois", sex: "female", birthDate: "2022-09-20", color: "Seal point", status: "lost", chipNumber: "450200000345678", chipImplantedAt: "2022-11-03", ownerId: "usr_hery", ownerName: "Hery Randria", ownerPhone: "+261 33 23 456 78", ownerEmail: "hery@example.mg", ownerCity: "Antsirabe" },
  { name: "Bella", species: "Chien", breed: "Coton de Tuléar", sex: "female", birthDate: "2020-04-11", color: "Blanc", status: "found", chipNumber: "450200000456789", chipImplantedAt: "2020-06-18", ownerId: null, ownerName: "Voahangy Rabe", ownerPhone: "+261 32 11 223 34", ownerEmail: "voahangy@example.mg", ownerCity: "Mahajanga" },
  { name: "Coco", species: "Chien", breed: "Croisé", sex: "male", birthDate: "2012-01-05", color: "Noir et feu", status: "deceased", chipNumber: "450200000567890", chipImplantedAt: "2012-03-01", ownerId: null, ownerName: "Tsiory Ravelo", ownerPhone: "+261 34 99 888 77", ownerEmail: null, ownerCity: "Antananarivo" },
  { name: "Simba", species: "Chat", breed: "Européen", sex: "male", birthDate: "2024-05-01", color: "Roux", status: "alive", chipNumber: "450200000678901", chipImplantedAt: "2024-07-12", ownerId: "usr_rasoa", ownerName: "Rasoa Andrianina", ownerPhone: "+261 34 12 345 67", ownerEmail: "rasoa@example.mg", ownerCity: "Antananarivo" },
] as const;

async function main() {
  const existing = await db.query.user.findFirst();
  if (existing) {
    console.log("La base contient déjà des utilisateurs : seed ignoré.");
    return;
  }

  const hash = await hashPassword(PASSWORD);
  await db.insert(schema.user).values(users.map((u) => ({ ...u, emailVerified: true })));
  await db.insert(schema.account).values(
    users.map((u) => ({ id: `acc_${u.id}`, accountId: u.id, providerId: "credential", userId: u.id, password: hash })),
  );
  await db.insert(schema.vetProfile).values(
    vets.map((v) => ({ ...v, phone: users.find((u) => u.id === v.userId)!.phone, verifiedAt: v.status === "verified" ? new Date() : null })),
  );

  const inserted = await db
    .insert(schema.animal)
    .values(
      animals.map((a) => ({
        ...a,
        chipLocation: "Cou, côté gauche",
        implantedByVetId: "usr_rakoto",
        registeredById: "usr_rakoto",
        ownerConfirmed: a.ownerId !== null,
        deceasedAt: a.status === "deceased" ? "2026-08-14" : null,
      })),
    )
    .returning();
  const byName = Object.fromEntries(inserted.map((a) => [a.name, a]));

  await db.insert(schema.ownershipHistory).values([
    ...inserted.map((a) => ({ animalId: a.id, event: "chip" as const, ownerName: a.ownerName, occurredAt: a.chipImplantedAt!, note: "Dr Rakoto" })),
    { animalId: byName.Kiki.id, event: "birth", ownerName: "Hery Randria", occurredAt: "2023-02-14", note: "Élevage familial" },
    { animalId: byName.Kiki.id, event: "adoption", ownerName: "Rasoa Andrianina", occurredAt: "2023-04-20", note: "Cédée par Hery Randria" },
  ]);

  await db.insert(schema.transfer).values({
    animalId: byName.Kiki.id,
    fromName: "Rasoa Andrianina",
    fromUserId: "usr_rasoa",
    toName: "Hery Randria",
    toEmail: "hery@example.mg",
    toUserId: "usr_hery",
    initiatedById: "usr_rakoto",
    reason: "Déménagement",
    expiresAt: new Date(Date.now() + 10 * 86400_000),
  });

  await db.insert(schema.report).values([
    { type: "lost", animalId: byName.Mimi.id, chipNumber: byName.Mimi.chipNumber, species: "Chat", location: "Antsirabe, quartier Mahazoarivo", occurredAt: "2026-10-05", description: "Chatte siamoise, collier rouge, très craintive.", reporterName: "Hery Randria", reporterContact: "+261 33 23 456 78", reporterUserId: "usr_hery" },
    { type: "found", animalId: byName.Bella.id, chipNumber: byName.Bella.chipNumber, species: "Chien", location: "Mahajanga, front de mer", occurredAt: "2026-10-09", description: "Petite chienne blanche trouvée près de la plage, en bonne santé.", reporterName: "Fara", reporterContact: "+261 32 44 555 66" },
    { type: "found", species: "Chien", location: "Antananarivo, Analakely", occurredAt: "2026-10-10", description: "Chien noir de taille moyenne, sans collier, très sociable.", reporterName: "Nirina", reporterContact: "+261 34 22 333 44" },
    { type: "duplicate", animalId: byName.Rex.id, chipNumber: byName.Rex.chipNumber, description: "Tentative d'enregistrement d'une puce déjà présente.", reporterName: "Dr Rasolo", reporterUserId: "usr_rasolo" },
  ]);

  await db.insert(schema.accessLog).values([
    { actorId: "usr_rakoto", animalId: byName.Rex.id, action: "contact_viewed", detail: "Fiche Rex", createdAt: new Date(Date.now() - 2 * 3600_000) },
    { actorId: "usr_rakoto", animalId: byName.Mimi.id, action: "chip_implanted", detail: "Mimi", createdAt: new Date(Date.now() - 26 * 3600_000) },
    { actorId: "usr_rakoto", animalId: byName.Coco.id, action: "death_declared", detail: "Coco", createdAt: new Date("2026-08-14T10:00:00Z") },
  ]);

  await db.insert(schema.contactMessage).values({
    animalId: byName.Kiki.id,
    senderName: "Nirina",
    senderContact: "+261 34 22 333 44",
    message: "Bonjour, j'ai vu un chat tigré qui ressemble beaucoup à Kiki près du lac Anosy hier soir.",
  });

  console.log(`Seed terminé — ${users.length} comptes (mot de passe : ${PASSWORD}), ${inserted.length} animaux.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
