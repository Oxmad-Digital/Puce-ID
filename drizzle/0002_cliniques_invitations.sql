CREATE TYPE "public"."clinic_role" AS ENUM('manager', 'member');--> statement-breakpoint
ALTER TYPE "public"."access_action" ADD VALUE 'clinic_transfer_initiated' BEFORE 'csv_import';--> statement-breakpoint
ALTER TYPE "public"."access_action" ADD VALUE 'invitation_sent' BEFORE 'csv_import';--> statement-breakpoint
CREATE TABLE "clinic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"listed_publicly" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_transfer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"animal_id" uuid NOT NULL,
	"from_clinic_id" uuid,
	"to_clinic_id" uuid NOT NULL,
	"initiated_by_id" text,
	"reason" text,
	"status" "transfer_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "animal" ADD COLUMN "clinic_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "vet_profile" ADD COLUMN "clinic_id" uuid;--> statement-breakpoint
ALTER TABLE "vet_profile" ADD COLUMN "clinic_role" "clinic_role" DEFAULT 'member' NOT NULL;--> statement-breakpoint
-- Reprise des données : chaque vétérinaire existant devient responsable de sa propre clinique.
UPDATE "vet_profile" SET "clinic_id" = gen_random_uuid(), "clinic_role" = 'manager';--> statement-breakpoint
INSERT INTO "clinic" ("id", "name", "city", "address", "phone", "email", "listed_publicly", "created_at")
SELECT vp."clinic_id", vp."clinic_name", vp."city", vp."address", vp."phone", u."email", vp."listed_publicly", vp."created_at"
FROM "vet_profile" vp JOIN "user" u ON u."id" = vp."user_id";--> statement-breakpoint
UPDATE "animal" a SET "clinic_id" = vp."clinic_id"
FROM "vet_profile" vp
WHERE vp."user_id" = COALESCE(a."implanted_by_vet_id", a."registered_by_id");--> statement-breakpoint
ALTER TABLE "clinic_transfer" ADD CONSTRAINT "clinic_transfer_animal_id_animal_id_fk" FOREIGN KEY ("animal_id") REFERENCES "public"."animal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_transfer" ADD CONSTRAINT "clinic_transfer_from_clinic_id_clinic_id_fk" FOREIGN KEY ("from_clinic_id") REFERENCES "public"."clinic"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_transfer" ADD CONSTRAINT "clinic_transfer_to_clinic_id_clinic_id_fk" FOREIGN KEY ("to_clinic_id") REFERENCES "public"."clinic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinic_transfer" ADD CONSTRAINT "clinic_transfer_initiated_by_id_user_id_fk" FOREIGN KEY ("initiated_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clinic_transfer_animal_idx" ON "clinic_transfer" USING btree ("animal_id");--> statement-breakpoint
CREATE INDEX "clinic_transfer_to_idx" ON "clinic_transfer" USING btree ("to_clinic_id");--> statement-breakpoint
ALTER TABLE "animal" ADD CONSTRAINT "animal_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vet_profile" ADD CONSTRAINT "vet_profile_clinic_id_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinic"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "animal_clinic_idx" ON "animal" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "vet_clinic_idx" ON "vet_profile" USING btree ("clinic_id");