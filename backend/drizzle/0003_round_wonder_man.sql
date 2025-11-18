CREATE SCHEMA IF NOT EXISTS "app";--> statement-breakpoint
CREATE TYPE "app"."delivery_request_status" AS ENUM('pending', 'accepted', 'declined', 'withdrawn', 'expired', 'cancelled_by_sender');--> statement-breakpoint
CREATE TYPE "app"."driver_profile_status" AS ENUM('pending_verification', 'active', 'suspended', 'blocked');--> statement-breakpoint
CREATE TYPE "app"."listing_status" AS ENUM('draft', 'published', 'assigned', 'ready_for_pickup', 'in_transit', 'delivered', 'cancelled', 'disputed', 'archived');--> statement-breakpoint
CREATE TYPE "app"."payment_status" AS ENUM('unpaid', 'reserved', 'released');--> statement-breakpoint
CREATE TYPE "app"."review_role" AS ENUM('expediteur', 'driver');--> statement-breakpoint
CREATE TABLE "app"."delivery_reviews" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"listing_id" uuid,
	"reviewer_id" text,
	"reviewed_id" text,
	"role" "app"."review_role" NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_reviews_rating_range" CHECK ("app"."delivery_reviews"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "app"."driver_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"profile_status" "app"."driver_profile_status" DEFAULT 'pending_verification' NOT NULL,
	"vehicle_type" text,
	"max_weight_kg" numeric(10, 2),
	"max_length_cm" numeric(10, 2),
	"years_of_experience" integer,
	"documents" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rating_average" numeric(3, 2),
	"rating_count" integer DEFAULT 0 NOT NULL,
	"last_connection_at" timestamp with time zone,
	"activated_at" timestamp with time zone,
	"suspended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."listing_delivery_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"driver_id" text NOT NULL,
	"status" "app"."delivery_request_status" DEFAULT 'pending' NOT NULL,
	"message" text,
	"proposed_price" numeric(10, 2),
	"estimated_pickup_time" timestamp with time zone,
	"vehicle_notes" text,
	"decision_by_sender_at" timestamp with time zone,
	"decision_reason" text,
	"withdrawn_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."listing_media" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"listing_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"media_type" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."listing_status_history" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"listing_id" uuid NOT NULL,
	"previous_status" "app"."listing_status",
	"new_status" "app"."listing_status" NOT NULL,
	"changed_by" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "app"."listing_watchers" (
	"listing_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listing_watchers_pkey" PRIMARY KEY("listing_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "app"."listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expediteur_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"short_description" text,
	"long_description" text,
	"status" "app"."listing_status" DEFAULT 'draft' NOT NULL,
	"parcel_details" jsonb DEFAULT '{"weight_kg":0,"length_cm":0,"width_cm":0,"height_cm":0}'::jsonb NOT NULL,
	"pickup_address" text,
	"pickup_lat" numeric(9, 6),
	"pickup_lng" numeric(9, 6),
	"pickup_window" "tstzrange",
	"delivery_address" text,
	"delivery_lat" numeric(9, 6),
	"delivery_lng" numeric(9, 6),
	"delivery_window" "tstzrange",
	"budget" numeric(10, 2),
	"currency" char(3) DEFAULT 'EUR' NOT NULL,
	"payment_status" "app"."payment_status" DEFAULT 'unpaid' NOT NULL,
	"accepted_request_id" uuid,
	"current_driver_id" text,
	"published_at" timestamp with time zone,
	"assigned_at" timestamp with time zone,
	"picked_up_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listings_parcel_details_keys" CHECK ("app"."listings"."parcel_details" ?& array['weight_kg','length_cm','width_cm','height_cm'])
);
--> statement-breakpoint
CREATE TABLE "app"."user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"phone_number" text,
	"default_pickup_address" text,
	"default_delivery_address" text,
	"avatar_url" text,
	"preferred_language" varchar(10),
	"bio_sender" text,
	"bio_driver" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."delivery_reviews" ADD CONSTRAINT "delivery_reviews_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "app"."listings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."delivery_reviews" ADD CONSTRAINT "delivery_reviews_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."delivery_reviews" ADD CONSTRAINT "delivery_reviews_reviewed_id_user_id_fk" FOREIGN KEY ("reviewed_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listing_delivery_requests" ADD CONSTRAINT "listing_delivery_requests_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "app"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listing_delivery_requests" ADD CONSTRAINT "listing_delivery_requests_driver_id_user_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listing_media" ADD CONSTRAINT "listing_media_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "app"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listing_status_history" ADD CONSTRAINT "listing_status_history_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "app"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listing_status_history" ADD CONSTRAINT "listing_status_history_changed_by_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listing_watchers" ADD CONSTRAINT "listing_watchers_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "app"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listing_watchers" ADD CONSTRAINT "listing_watchers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listings" ADD CONSTRAINT "listings_expediteur_id_user_id_fk" FOREIGN KEY ("expediteur_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."listings" ADD CONSTRAINT "listings_current_driver_id_user_id_fk" FOREIGN KEY ("current_driver_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "listing_delivery_requests_listing_driver_key" ON "app"."listing_delivery_requests" USING btree ("listing_id","driver_id");--> statement-breakpoint
CREATE INDEX "listing_delivery_requests_driver_status_idx" ON "app"."listing_delivery_requests" USING btree ("driver_id","status");--> statement-breakpoint
CREATE INDEX "listing_delivery_requests_listing_status_idx" ON "app"."listing_delivery_requests" USING btree ("listing_id","status");--> statement-breakpoint
CREATE INDEX "listings_status_pickup_window_idx" ON "app"."listings" USING btree ("status","pickup_window");--> statement-breakpoint
CREATE INDEX "listings_expediteur_created_idx" ON "app"."listings" USING btree ("expediteur_id","created_at");--> statement-breakpoint
CREATE INDEX "listings_driver_status_idx" ON "app"."listings" USING btree ("current_driver_id","status");
