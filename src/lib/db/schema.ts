import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*                                   Enums                                    */
/* -------------------------------------------------------------------------- */

export const userRole = pgEnum("user_role", ["owner", "vet", "admin"]);
export const vetStatus = pgEnum("vet_status", ["pending", "verified", "rejected"]);
export const animalStatus = pgEnum("animal_status", ["alive", "lost", "found", "deceased"]);
export const animalSex = pgEnum("animal_sex", ["male", "female", "unknown"]);
export const transferStatus = pgEnum("transfer_status", [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
]);
export const reportType = pgEnum("report_type", ["lost", "found", "duplicate", "dispute"]);
export const reportStatus = pgEnum("report_status", ["open", "resolved", "dismissed"]);
export const ownershipEvent = pgEnum("ownership_event", [
  "registration",
  "birth",
  "adoption",
  "transfer",
  "chip",
]);
export const accessAction = pgEnum("access_action", [
  "chip_search",
  "contact_viewed",
  "animal_registered",
  "animal_updated",
  "chip_implanted",
  "death_declared",
  "found_declared",
  "transfer_initiated",
  "csv_import",
]);

/* -------------------------------------------------------------------------- */
/*                           Better Auth core tables                          */
/* -------------------------------------------------------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRole("role").notNull().default("owner"),
  phone: text("phone"),
  city: text("city"),
  locale: text("locale").notNull().default("fr"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*                                  Domaine                                   */
/* -------------------------------------------------------------------------- */

/** Profil professionnel d'un vétérinaire (1-1 avec user.role = "vet"). */
export const vetProfile = pgTable("vet_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  clinicName: text("clinic_name").notNull(),
  orderNumber: text("order_number").notNull(),
  city: text("city").notNull(),
  address: text("address"),
  phone: text("phone"),
  status: vetStatus("status").notNull().default("pending"),
  verifiedAt: timestamp("verified_at"),
  listedPublicly: boolean("listed_publicly").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const animal = pgTable(
  "animal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    species: text("species").notNull(),
    breed: text("breed"),
    sex: animalSex("sex").notNull().default("unknown"),
    birthDate: date("birth_date"),
    color: text("color"),
    status: animalStatus("status").notNull().default("alive"),
    /** Clé de l'objet photo dans le bucket R2. */
    photoKey: text("photo_key"),

    // Puce électronique (ISO 11784/11785 — 15 chiffres)
    chipNumber: text("chip_number").notNull().unique(),
    chipImplantedAt: date("chip_implanted_at"),
    chipLocation: text("chip_location"),
    implantedByVetId: text("implanted_by_vet_id").references(() => user.id, {
      onDelete: "set null",
    }),
    /** Nom libre du vétérinaire poseur quand il n'a pas de compte. */
    implantedByName: text("implanted_by_name"),

    // Propriétaire : compte lié ou coordonnées saisies par le vétérinaire
    ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
    ownerName: text("owner_name").notNull(),
    ownerPhone: text("owner_phone"),
    ownerEmail: text("owner_email"),
    ownerCity: text("owner_city"),
    ownerConfirmed: boolean("owner_confirmed").notNull().default(false),

    registeredById: text("registered_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    deceasedAt: date("deceased_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("animal_owner_idx").on(t.ownerId),
    index("animal_vet_idx").on(t.implantedByVetId),
    index("animal_status_idx").on(t.status),
  ],
);

export const ownershipHistory = pgTable(
  "ownership_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animal.id, { onDelete: "cascade" }),
    event: ownershipEvent("event").notNull(),
    ownerName: text("owner_name").notNull(),
    note: text("note"),
    occurredAt: date("occurred_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ownership_animal_idx").on(t.animalId)],
);

export const transfer = pgTable(
  "transfer",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    animalId: uuid("animal_id")
      .notNull()
      .references(() => animal.id, { onDelete: "cascade" }),
    fromName: text("from_name").notNull(),
    fromUserId: text("from_user_id").references(() => user.id, { onDelete: "set null" }),
    toName: text("to_name").notNull(),
    toEmail: text("to_email"),
    toPhone: text("to_phone"),
    toUserId: text("to_user_id").references(() => user.id, { onDelete: "set null" }),
    initiatedById: text("initiated_by_id").references(() => user.id, { onDelete: "set null" }),
    reason: text("reason"),
    status: transferStatus("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at").notNull(),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("transfer_animal_idx").on(t.animalId), index("transfer_to_idx").on(t.toUserId)],
);

/** Signalements : perdu, trouvé, doublon de puce, contestation d'enregistrement. */
export const report = pgTable(
  "report",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: reportType("type").notNull(),
    status: reportStatus("status").notNull().default("open"),
    animalId: uuid("animal_id").references(() => animal.id, { onDelete: "cascade" }),
    chipNumber: text("chip_number"),
    species: text("species"),
    location: text("location"),
    description: text("description"),
    photoKey: text("photo_key"),
    reporterName: text("reporter_name"),
    reporterContact: text("reporter_contact"),
    reporterUserId: text("reporter_user_id").references(() => user.id, { onDelete: "set null" }),
    occurredAt: date("occurred_at"),
    resolvedAt: timestamp("resolved_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("report_type_status_idx").on(t.type, t.status)],
);

/** Messages anonymes relayés au propriétaire depuis la page publique. */
export const contactMessage = pgTable("contact_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  animalId: uuid("animal_id")
    .notNull()
    .references(() => animal.id, { onDelete: "cascade" }),
  senderName: text("sender_name"),
  senderContact: text("sender_contact").notNull(),
  message: text("message").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Documents (certificats, carnets de vaccination…) stockés dans R2. */
export const document = pgTable("document", {
  id: uuid("id").primaryKey().defaultRandom(),
  animalId: uuid("animal_id")
    .notNull()
    .references(() => animal.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedById: text("uploaded_by_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Journal d'audit : chaque consultation de coordonnées y est enregistrée. */
export const accessLog = pgTable(
  "access_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    animalId: uuid("animal_id").references(() => animal.id, { onDelete: "set null" }),
    action: accessAction("action").notNull(),
    detail: text("detail"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("access_actor_idx").on(t.actorId, t.createdAt)],
);

/* -------------------------------------------------------------------------- */
/*                                 Relations                                  */
/* -------------------------------------------------------------------------- */

export const userRelations = relations(user, ({ one, many }) => ({
  vetProfile: one(vetProfile, { fields: [user.id], references: [vetProfile.userId] }),
  animals: many(animal, { relationName: "owner" }),
}));

export const vetProfileRelations = relations(vetProfile, ({ one }) => ({
  user: one(user, { fields: [vetProfile.userId], references: [user.id] }),
}));

export const animalRelations = relations(animal, ({ one, many }) => ({
  owner: one(user, { fields: [animal.ownerId], references: [user.id], relationName: "owner" }),
  implantedBy: one(user, {
    fields: [animal.implantedByVetId],
    references: [user.id],
    relationName: "implantedBy",
  }),
  history: many(ownershipHistory),
  transfers: many(transfer),
  reports: many(report),
  documents: many(document),
}));

export const ownershipHistoryRelations = relations(ownershipHistory, ({ one }) => ({
  animal: one(animal, { fields: [ownershipHistory.animalId], references: [animal.id] }),
}));

export const transferRelations = relations(transfer, ({ one }) => ({
  animal: one(animal, { fields: [transfer.animalId], references: [animal.id] }),
}));

export const reportRelations = relations(report, ({ one }) => ({
  animal: one(animal, { fields: [report.animalId], references: [animal.id] }),
}));

export const documentRelations = relations(document, ({ one }) => ({
  animal: one(animal, { fields: [document.animalId], references: [animal.id] }),
}));

export const accessLogRelations = relations(accessLog, ({ one }) => ({
  actor: one(user, { fields: [accessLog.actorId], references: [user.id] }),
  animal: one(animal, { fields: [accessLog.animalId], references: [animal.id] }),
}));

export type Animal = typeof animal.$inferSelect;
export type AnimalStatus = (typeof animalStatus.enumValues)[number];
export type UserRole = (typeof userRole.enumValues)[number];
export type ReportType = (typeof reportType.enumValues)[number];
export type TransferStatus = (typeof transferStatus.enumValues)[number];
export type AccessAction = (typeof accessAction.enumValues)[number];
