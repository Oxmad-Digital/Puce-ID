-- Suppression du schéma de l'ancienne version (Prisma). Sans effet sur une base vide.
DROP TABLE IF EXISTS "RateLimitBucket", "Membership", "Invitation", "AuthToken", "AuditLog", "Transfer", "Session", "Animal", "Clinic", "User" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
--> statement-breakpoint
DROP TYPE IF EXISTS "AnimalStatus", "AuditAction", "MembershipRole", "Role", "Species", "TokenPurpose", "TransferStatus", "VerificationStatus" CASCADE;
