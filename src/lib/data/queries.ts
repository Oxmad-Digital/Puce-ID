import "server-only";
import { and, asc, count, desc, eq, exists, gt, gte, ilike, inArray, isNotNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { AccessAction } from "@/lib/db/schema";
import type { AnimalFilters } from "@/lib/filters";
import type { CurrentUser } from "@/lib/session";
import { normalizeChip } from "@/lib/utils";

const {
  animal,
  transfer,
  clinicTransfer,
  report,
  accessLog,
  ownershipHistory,
  vetProfile,
  clinic,
  user,
  contactMessage,
} = schema;

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
  const where: SQL[] = [eq(vetProfile.status, "verified"), eq(clinic.listedPublicly, true)];
  if (filters.city) where.push(eq(clinic.city, filters.city));
  if (filters.q) {
    where.push(or(ilike(clinic.name, `%${filters.q}%`), ilike(user.name, `%${filters.q}%`))!);
  }
  return db
    .select({
      id: user.id,
      name: user.name,
      email: sql<string>`coalesce(${clinic.email}, ${user.email})`,
      clinicName: clinic.name,
      city: clinic.city,
      address: clinic.address,
      phone: sql<string | null>`coalesce(${clinic.phone}, ${user.phone})`,
    })
    .from(vetProfile)
    .innerJoin(user, eq(user.id, vetProfile.userId))
    .innerJoin(clinic, eq(clinic.id, vetProfile.clinicId))
    .where(and(...where))
    .orderBy(clinic.city, clinic.name, user.name);
}

export async function listVetCities() {
  const rows = await db
    .selectDistinct({ city: clinic.city })
    .from(clinic)
    .innerJoin(vetProfile, eq(vetProfile.clinicId, clinic.id))
    .where(eq(vetProfile.status, "verified"))
    .orderBy(clinic.city);
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

function animalFilters(filters: AnimalFilters): SQL[] {
  const where: SQL[] = [];
  if (filters.status) where.push(eq(animal.status, filters.status));
  if (filters.species) where.push(eq(animal.species, filters.species));
  if (filters.sex) where.push(eq(animal.sex, filters.sex));
  if (filters.city) where.push(ilike(animal.ownerCity, filters.city));
  if (filters.clinicId === "none") where.push(sql`${animal.clinicId} is null`);
  else if (filters.clinicId) where.push(eq(animal.clinicId, filters.clinicId));
  if (filters.from) where.push(gte(animal.createdAt, new Date(`${filters.from}T00:00:00`)));
  if (filters.to) where.push(lte(animal.createdAt, new Date(`${filters.to}T23:59:59.999`)));
  if (filters.q) {
    const q = filters.q.trim();
    const digits = normalizeChip(q);
    where.push(
      or(
        ilike(animal.name, `%${q}%`),
        ilike(animal.ownerName, `%${q}%`),
        ilike(animal.ownerEmail, `%${q}%`),
        ilike(animal.ownerPhone, `%${q}%`),
        digits.length >= 3 ? ilike(animal.chipNumber, `%${digits}%`) : undefined,
      )!,
    );
  }
  return where;
}

/**
 * Périmètre d'animaux visible par l'utilisateur dans ses listes.
 * Un vétérinaire vérifié voit les patients de toute sa clinique.
 */
function scopeFor(u: CurrentUser): SQL | undefined {
  if (u.role === "admin") return undefined;
  if (u.role === "vet") {
    return or(
      eq(animal.implantedByVetId, u.id),
      eq(animal.registeredById, u.id),
      u.vet?.status === "verified" ? eq(animal.clinicId, u.vet.clinicId) : undefined,
    );
  }
  return eq(animal.ownerId, u.id);
}

/** Valeurs proposées dans les filtres avancés (limitées au périmètre de l'utilisateur). */
export async function animalFilterOptions(u: CurrentUser) {
  const scope = scopeFor(u);
  const [species, cities, clinics] = await Promise.all([
    db.selectDistinct({ v: animal.species }).from(animal).where(scope).orderBy(animal.species),
    db
      .selectDistinct({ v: animal.ownerCity })
      .from(animal)
      .where(and(scope, isNotNull(animal.ownerCity)))
      .orderBy(animal.ownerCity),
    u.role === "admin"
      ? db.select({ id: clinic.id, name: clinic.name, city: clinic.city }).from(clinic).orderBy(clinic.name)
      : Promise.resolve([]),
  ]);
  return {
    species: species.map((r) => r.v),
    cities: cities.map((r) => r.v!).filter(Boolean),
    clinics,
  };
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
      implantedBy: {
        columns: { name: true },
        with: { vetProfile: { columns: {}, with: { clinic: { columns: { name: true } } } } },
      },
      clinic: { columns: { id: true, name: true, city: true, phone: true } },
      transfers: { where: eq(transfer.status, "pending") },
      clinicTransfers: {
        where: eq(clinicTransfer.status, "pending"),
        with: { toClinic: { columns: { name: true, city: true } } },
      },
    },
  });
  if (!row) return null;

  const isOwner = row.ownerId === u.id;
  const isVet = u.role === "vet" && u.vet?.status === "verified";
  if (!isOwner && !isVet && u.role !== "admin") return null;

  if (isVet && !isOwner) {
    await logAccess(u.id, row.id, "contact_viewed", `Fiche ${row.name}`);
  }
  const isClinicVet = isVet && row.clinicId !== null && row.clinicId === u.vet?.clinicId;
  return {
    ...row,
    isClinicVet,
    canEdit:
      isOwner ||
      isClinicVet ||
      u.role === "admin" ||
      row.implantedByVetId === u.id ||
      row.registeredById === u.id,
  };
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

export async function vetStats(u: CurrentUser, now: Date) {
  const vetId = u.id;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 86400_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400_000);
  const scope = scopeFor(u);

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

  const [clinicTransfers] = u.vet
    ? await db
        .select({ total: count() })
        .from(clinicTransfer)
        .where(and(eq(clinicTransfer.status, "pending"), eq(clinicTransfer.toClinicId, u.vet.clinicId)))
    : [{ total: 0 }];

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
    pendingTransfers: transfers.total + clinicTransfers.total,
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

/** Changements de clinique visibles : ceux de ma clinique, de mes animaux ou que j'ai initiés. */
export async function listClinicTransfers(u: CurrentUser) {
  let where: SQL | undefined;
  if (u.role === "vet" && u.vet) {
    where = or(
      eq(clinicTransfer.toClinicId, u.vet.clinicId),
      eq(clinicTransfer.fromClinicId, u.vet.clinicId),
      eq(clinicTransfer.initiatedById, u.id),
    );
  }
  const isOwner = !(u.role === "vet" && u.vet) && u.role !== "admin";
  return db.query.clinicTransfer.findMany({
    // Propriétaire : la sous-requête doit viser l'alias de la requête relationnelle (t), pas la table brute.
    where: (t) =>
      isOwner
        ? or(
            eq(t.initiatedById, u.id),
            exists(
              db
                .select({ id: animal.id })
                .from(animal)
                .where(and(eq(animal.id, t.animalId), eq(animal.ownerId, u.id))),
            ),
          )
        : where,
    with: {
      animal: { columns: { id: true, name: true, species: true, chipNumber: true, ownerId: true } },
      fromClinic: { columns: { id: true, name: true, city: true } },
      toClinic: { columns: { id: true, name: true, city: true } },
    },
    orderBy: desc(clinicTransfer.createdAt),
    limit: 100,
  });
}

/**
 * Compteur de la cloche (exécuté à chaque page) : transferts de propriété qui me sont proposés
 * et, pour l'administration, transferts de dossier à valider.
 */
export async function notificationCount(u: CurrentUser, now: Date) {
  const [[incoming], [toValidate]] = await Promise.all([
    db
      .select({ total: count() })
      .from(transfer)
      .where(and(eq(transfer.status, "pending"), or(eq(transfer.toUserId, u.id), eq(transfer.toEmail, u.email)))),
    u.role === "admin"
      ? db
          .select({ total: count() })
          .from(clinicTransfer)
          .where(and(eq(clinicTransfer.status, "pending"), gt(clinicTransfer.expiresAt, now)))
      : Promise.resolve([{ total: 0 }]),
  ]);
  return incoming.total + toValidate.total;
}

/** Parmi ces animaux, ceux qui ont déjà une demande de changement de clinique en attente. */
export async function pendingClinicTransferAnimalIds(ids: string[]) {
  if (ids.length === 0) return new Set<string>();
  const rows = await db
    .select({ animalId: clinicTransfer.animalId })
    .from(clinicTransfer)
    .where(and(eq(clinicTransfer.status, "pending"), inArray(clinicTransfer.animalId, ids)));
  return new Set(rows.map((r) => r.animalId));
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
export async function vetTodo(u: CurrentUser) {
  const transfers = await db.query.transfer.findMany({
    where: and(eq(transfer.status, "pending"), eq(transfer.initiatedById, u.id)),
    with: { animal: { columns: { name: true } } },
    orderBy: transfer.expiresAt,
    limit: 3,
  });
  const clinicTransfers = u.vet
    ? await db.query.clinicTransfer.findMany({
        where: and(eq(clinicTransfer.status, "pending"), eq(clinicTransfer.toClinicId, u.vet.clinicId)),
        with: { animal: { columns: { name: true } }, fromClinic: { columns: { name: true } } },
        orderBy: clinicTransfer.expiresAt,
        limit: 3,
      })
    : [];
  const reports = await db.query.report.findMany({
    where: and(eq(report.status, "open"), inArray(report.type, ["found", "duplicate"])),
    with: { animal: { columns: { id: true, name: true } } },
    orderBy: desc(report.createdAt),
    limit: 3,
  });
  return { transfers, clinicTransfers, reports };
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
      clinicName: clinic.name,
      orderNumber: vetProfile.orderNumber,
      city: clinic.city,
      createdAt: vetProfile.createdAt,
    })
    .from(vetProfile)
    .innerJoin(user, eq(user.id, vetProfile.userId))
    .innerJoin(clinic, eq(clinic.id, vetProfile.clinicId))
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

/** Cliniques et leurs vétérinaires (administration). */
export async function listClinicsWithMembers() {
  const [clinics, animalCounts] = await Promise.all([
    db.query.clinic.findMany({
      with: {
        members: {
          with: { user: { columns: { id: true, name: true, email: true, mustChangePassword: true } } },
          orderBy: [asc(vetProfile.clinicRole), asc(vetProfile.createdAt)],
        },
      },
      orderBy: [asc(clinic.city), asc(clinic.name)],
    }),
    db
      .select({ clinicId: animal.clinicId, total: count() })
      .from(animal)
      .where(isNotNull(animal.clinicId))
      .groupBy(animal.clinicId),
  ]);
  const totals = new Map(animalCounts.map((r) => [r.clinicId, r.total]));
  return clinics.map((c) => ({ ...c, animals: totals.get(c.id) ?? 0 }));
}

/** Fiche clinique avec ses membres (espace vétérinaire). */
export async function getClinic(clinicId: string) {
  return db.query.clinic.findFirst({
    where: eq(clinic.id, clinicId),
    with: {
      members: {
        with: { user: { columns: { id: true, name: true, email: true, phone: true, mustChangePassword: true } } },
        orderBy: [asc(vetProfile.clinicRole), asc(vetProfile.createdAt)],
      },
    },
  });
}

/** Cliniques pouvant accueillir un animal : au moins un vétérinaire vérifié. */
export async function listActiveClinics() {
  return db
    .select({ id: clinic.id, name: clinic.name, city: clinic.city })
    .from(clinic)
    .where(
      exists(
        db
          .select({ id: vetProfile.userId })
          .from(vetProfile)
          .where(and(eq(vetProfile.clinicId, clinic.id), eq(vetProfile.status, "verified"))),
      ),
    )
    .orderBy(clinic.city, clinic.name);
}
