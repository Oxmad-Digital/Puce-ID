ALTER TABLE "vet_profile" ALTER COLUMN "clinic_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vet_profile" DROP COLUMN "clinic_name";--> statement-breakpoint
ALTER TABLE "vet_profile" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "vet_profile" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "vet_profile" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "vet_profile" DROP COLUMN "listed_publicly";