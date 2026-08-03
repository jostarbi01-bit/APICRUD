ALTER TABLE "user" DROP CONSTRAINT "user_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "policy" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "policy" ADD CONSTRAINT "policy_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "refresh_token_expires_at";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "scope";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "company_id";--> statement-breakpoint
ALTER TABLE "verification" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "verification" DROP COLUMN "updated_at";