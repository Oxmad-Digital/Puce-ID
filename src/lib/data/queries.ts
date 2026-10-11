import "server-only";
import { and, count, desc, eq, gte, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { AccessAction, AnimalStatus } from "@/lib/db/schema";
import type { CurrentUser } from "@/lib/session";
import { normalizeChip } from "@/lib/utils";

const { animal, transfer, report, accessLog, ownershipHistory, vetProfile, user, contactMessage } =
  schema;

/* -------------------------------------------------------------------------- */
/*                               Public                                       */
/* -------------------------------------------------------------------------- */

/** Recherche publique d'une puce : aucune coordonnée du propriétaire n'est exposée. */
export async function findPublicChip(raw: string) {
  const chip = normalizeChip(raw);
  const row = await db.query.animal.findFirst({
    where: eq(animal.chipNumber, chip),
    columns: {
      id: true,
      name: true,
      species: true,
      breed: true,
      sex: true,
      color: true,
      status: true,
      chipNumber: true,
      chipImplantedAt: true,
      ownerCity: true,
      ownerConfirmed: true,
      photoKey: true,
    },
  });
  return row ?? null;
}

export async function listVerifiedVets(filters: { q?: string; city?: string }) {
  const where: SQL[] = [eq(vetProfile.status, "verified"), eq(vetProfile.listedPublicly, true)];
  if (filters.city) where.push(eq(vetProfile.city, filters.city));
  if (filters.q) {
    where.push(
      or(ilike(vetProfile.clinicName, `%${filters.q}%`), ilike(user.name, `%${filters.q}%`))!,
    );
  }
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      clinicName: vetProfile.clinicName,
      city: vetProfile.city,
      address: vetProfile.address,
      phone: vetProfile.phone,
    })
    .from(vetProfile)
    .innerJoin(user, eq(user.id, vetProfile.userId))
    .where(and(...where))
    .orderBy(vetProfile.city, vetProfile.clinicName);
}

export async function listVetCities() {
  const rows = await db
    .selectDistinct({ city: vetProfile.city })
    .from(vetProfile)
    .where(eq(vetProfile.status, "verified"))
    .orderBy(vetProfile.city);
  return rows.map((r) => r.city);
}

/** Animaux actuellement déclarés perdus ou trouvés (annonces publiques). */
export async function listPublicLostFound(type?: "lost" | "found") {
  return db.query.report.findMany({
    where: and(
      eq(report.status, "open"),
      type ? eq(report.type, type) : inArray(report.type, ["lost", "found"]),
    ),
    with: {
      animal: { columns: { name: true, species: true, breed: true, color: true, photoKey: true } },
    },
    orderBy: desc(report.createdAt),
    limit: 60,
  });
}

/* -------------------------------------------------------------------------- */
/*                               Animaux                                      */
/* -------------------------------------------------------------------------- */

export type AnimalFilters = { q?: string; status?: AnimalStatus };

function animalFilters(filters: AnimalFilters): SQL[] {
  const where: SQL[] = [];
  if (filters.status) where.push(eq(animal.status, filters.status));
  if (filters.q) {
    const q = filters.q.trim();
    const digits = normalizeChip(q);
    where.push(
      or(
        ilike(animal.name, `%${q}%`),
        ilike(animal.ownerName, `%${q}%`),
        digits.length >= 3 ? ilike(animal.chipNumber, `%${digits}%`) : undefined,
      )!,
    );
  }
  return where;
}

/** Périmètre d'animaux visible par l'utilisateur dans ses listes. */
function scopeFor(u: CurrentUser): SQL | undefined {
  if (u.role === "admin") return undefined;
  if (u.role === "vet") {
    return or(eq(animal.implantedByVetId, u.id), eq(animal.registeredById, u.id));
  }
  return eq(animal.ownerId, u.id);
}

export async function listAnimals(u: CurrentUser, filters: AnimalFilters = {}, limit = 100) {
  const scope = scopeFor(u);
  return db
    .select()
    .from(animal)
    .where(and(...(scope ? [scope] : []), ...animalFilters(filters)))
    .orderBy(desc(animal.createdAt))
    .limit(limit);
}

/**
 * Fiche complète. Un propriétaire ne voit que ses animaux ; un vétérinaire vérifié
 * peut consulter n'importe quelle fiche (consultation journalisée).
 */
export async function getAnimal(u: CurrentUser, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const row = await db.query.animal.findFirst({
    where: eq(animal.id, id),
    with: {
      history: { orderBy: desc(ownershipHistory.occurredAt) },
      documents: { orderBy: desc(schema.document.createdAt) },
      implantedBy: { columns: { name: true }, with: { vetProfile: { columns: { clinicName: true } } } },
      transfers: { where: eq(transfer.status, "pending") },
    },
  });
  if (!row) return null;

  const isOwner = row.ownerId === u.id;
  const isVet = u.role === "vet" && u.vet?.status === "verified";
  if (!isOwner && !isVet && u.role !== "admin") return null;

  if (isVet && !isOwner) {
    await logAccess(u.id, row.id, "contact_viewed", `Fiche ${row.name}`);
  }
  return { ...row, canEdit: isOwner || u.role === "admin" || row.implantedByVetId === u.id || row.registeredById === u.id };
}

export async function ownerStats(userId: string) {
  const [animals] = await db
    .select({
      total: count(),
      active: sql<number>`count(*) filter (where ${animal.status} <> 'deceased')`.mapWith(Number),
    })
    .from(animal)
    .where(eq(animal.ownerId, userId));

  const [transfers] = await db
    .select({ total: count() })
    .from(transfer)
    .where(
      and(
        eq(transfer.status, "pending"),
        or(eq(transfer.fromUserId, userId), eq(transfer.toUserId, userId)),
      ),
    );

  const [reports] = await db
    .select({ total: count() })
    .from(report)
    .innerJoin(animal, eq(animal.id, report.animalId))
    .where(and(eq(report.status, "open"), eq(animal.ownerId, userId)));

  return {
    animals: animals.total,
    activeChips: animals.active,
    pendingTransfers: transfers.total,
    openReports: reports.total,
  };
}

export async function vetStats(vetId: string, now: Date) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 86400_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);
  const scope = or(eq(animal.implantedByVetId, vetId), eq(animal.registeredById, vetId));

  const [patients] = await db
    .select({
      total: count(),
      thisWeek: sql<number>`count(*) filter (where ${animal.createdAt} >= ${weekAgo})`.mapWith(Number),
      chippedThisMonth: sql<number>`count(*) filter (where ${animal.implantedByVetId} = ${vetId} and ${animal.chipImplantedAt} >= ${monthStart.toISOString().slice(0, 10)})`.mapWith(Number),
    })
    .from(animal)
    .where(scope);

  const [transfers] = await db
    .select({ total: count() })
    .from(transfer)
    .where(and(eq(transfer.status, "pending"), eq(transfer.initiatedById, vetId)));

  const [views] = await db
    .select({ total: count() })
    .from(accessLog)
    .where(
      and(
        eq(accessLog.actorId, vetId),
        eq(accessLog.action, "contact_viewed"),
        gte(accessLog.createdAt, thirtyDaysAgo),
      ),
    );

  return {
    patients: patients.total,
    patientsThisWeek: patients.thisWeek,
    chippedThisMonth: patients.chippedThisMonth,
    pendingTransfers: transfers.total,
    contactViews: views.total,
  };
}

/* -------------------------------------------------------------------------- */
/*                         Transferts & signalements                          */
/* -------------------------------------------------------------------------- */

export async function listTransfers(u: CurrentUser) {
  const where =
    u.role === "admin"
      ? undefined
      : or(
          eq(transfer.fromUserId, u.id),
          eq(transfer.toUserId, u.id),
          eq(transfer.initiatedById, u.id),
          eq(transfer.toEmail, u.email),
        );
  return db.query.transfer.findMany({
    where,
    with: { animal: { columns: { id: true, name: true, species: true, chipNumber: true } } },
    orderBy: desc(transfer.createdAt),
    limit: 100,
  });
}

export async function listReportsFor(u: CurrentUser) {
  if (u.role === "admin") {
    return db.query.report.findMany({
      with: { animal: { columns: { id: true, name: true, species: true, chipNumber: true } } },
      orderBy: desc(report.createdAt),
      limit: 100,
    });
  }
  const mine = await db
    .select({ id: animal.id })
    .from(animal)
    .where(scopeFor(u));
  const ids = mine.map((a) => a.id);
  return db.query.report.findMany({
    where: or(
      eq(report.reporterUserId, u.id),
      ids.length ? inArray(report.animalId, ids) : undefined,
    ),
    with: { animal: { columns: { id: true, name: true, species: true, chipNumber: true } } },
    orderBy: desc(report.createdAt),
    limit: 100,
  });
}

/** Éléments « À traiter » du tableau de bord vétérinaire. */
export async function vetTodo(vetId: string) {
  const transfers = await db.query.transfer.findMany({
    where: and(eq(transfer.status, "pending"), eq(transfer.initiatedById, vetId)),
    with: { animal: { columns: { name: true } } },
    orderBy: transfer.expiresAt,
    limit: 3,
  });
  const reports = await db.query.report.findMany({
    where: and(eq(report.status, "open"), inArray(report.type, ["found", "duplicate"])),
    with: { animal: { columns: { id: true, name: true } } },
    orderBy: desc(report.createdAt),
    limit: 3,
  });
  return { transfers, reports };
}

/* -------------------------------------------------------------------------- */
/*                         Journal & messages                                 */
/* -------------------------------------------------------------------------- */

export async function logAccess(
  actorId: string | null,
  animalId: string | null,
  action: AccessAction,
  detail?: string,
) {
  await db.insert(accessLog).values({ actorId, animalId, action, detail });
}

export async function listAccessLog(actorId: string | null, limit = 50) {
  return db.query.accessLog.findMany({
    where: actorId ? eq(accessLog.actorId, actorId) : undefined,
    with: {
      animal: { columns: { id: true, name: true } },
      actor: { columns: { name: true } },
    },
    orderBy: desc(accessLog.createdAt),
    limit,
  });
}

export async function listMessagesFor(ownerId: string) {
  return db
    .select({
      id: contactMessage.id,
      senderName: contactMessage.senderName,
      senderContact: contactMessage.senderContact,
      message: contactMessage.message,
      readAt: contactMessage.readAt,
      createdAt: contactMessage.createdAt,
      animalId: animal.id,
      animalName: animal.name,
    })
    .from(contactMessage)
    .innerJoin(animal, eq(animal.id, contactMessage.animalId))
    .where(eq(animal.ownerId, ownerId))
    .orderBy(desc(contactMessage.createdAt))
    .limit(50);
}

/* -------------------------------------------------------------------------- */
/*                                   Admin                                    */
/* -------------------------------------------------------------------------- */

export async function adminOverview() {
  const [counts] = await db
    .select({
      animals: count(),
      lost: sql<number>`count(*) filter (where ${animal.status} = 'lost')`.mapWith(Number),
    })
    .from(animal);
  const [users] = await db.select({ total: count() }).from(user).where(ne(user.role, "admin"));
  const pendingVets = await db
    .select({
      userId: vetProfile.userId,
      name: user.name,
      email: user.email,
      clinicName: vetProfile.clinicName,
      orderNumber: vetProfile.orderNumber,
      city: vetProfile.city,
      createdAt: vetProfile.createdAt,
    })
    .from(vetProfile)
    .innerJoin(user, eq(user.id, vetProfile.userId))
    .where(eq(vetProfile.status, "pending"))
    .orderBy(vetProfile.createdAt);
  const openDisputes = await db.query.report.findMany({
    where: and(eq(report.status, "open"), inArray(report.type, ["duplicate", "dispute"])),
    with: { animal: { columns: { id: true, name: true, chipNumber: true } } },
    orderBy: desc(report.createdAt),
  });
  return { animals: counts.animals, lost: counts.lost, users: users.total, pendingVets, openDisputes };
}

/** Identifiant de l'animal portant cette puce (pour la lecture par un vétérinaire). */
export async function findAnimalIdByChip(raw: string) {
  const row = await db.query.animal.findFirst({
    where: eq(animal.chipNumber, normalizeChip(raw)),
    columns: { id: true },
  });
  return row?.id ?? null;
}

export async function listAllVets() {
  return db
    .select({
      userId: vetProfile.userId,
      name: user.name,
      email: user.email,
      clinicName: vetProfile.clinicName,
      orderNumber: vetProfile.orderNumber,
      city: vetProfile.city,
      status: vetProfile.status,
      createdAt: vetProfile.createdAt,
    })
    .from(vetProfile)
    .innerJoin(user, eq(user.id, vetProfile.userId))
    .orderBy(vetProfile.status, desc(vetProfile.createdAt));
}
