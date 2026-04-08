-- CreateEnum
CREATE TYPE "PerformanceType" AS ENUM ('solo', 'chamber', 'orchestra', 'masterclass');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "admin_user_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performances" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "PerformanceType" NOT NULL,
    "venue" VARCHAR(500) NOT NULL,
    "location" VARCHAR(300) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "organization" TEXT,
    "collaborators" JSONB NOT NULL DEFAULT '[]',
    "repertoire" JSONB NOT NULL DEFAULT '[]',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" SERIAL NOT NULL,
    "youtube_id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "performance_date" TIMESTAMP(3),
    "venue" TEXT,
    "repertoire" JSONB NOT NULL DEFAULT '[]',
    "thumbnail_url" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photos" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "alt_text" TEXT NOT NULL,
    "object_position" TEXT NOT NULL DEFAULT 'center center',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biography" (
    "id" SERIAL NOT NULL,
    "short_bio" TEXT NOT NULL,
    "full_bio" JSONB NOT NULL,
    "sections" JSONB NOT NULL DEFAULT '[]',
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "venues" JSONB NOT NULL,
    "testimonials" JSONB NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biography_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_admin_user_id_used_idx" ON "password_reset_tokens"("admin_user_id", "used");

-- CreateIndex
CREATE INDEX "performances_date_idx" ON "performances"("date");

-- CreateIndex
CREATE INDEX "performances_is_featured_idx" ON "performances"("is_featured");

-- CreateIndex
CREATE UNIQUE INDEX "videos_youtube_id_key" ON "videos"("youtube_id");

-- CreateIndex
CREATE INDEX "videos_sort_order_idx" ON "videos"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "photos_filename_key" ON "photos"("filename");

-- CreateIndex
CREATE INDEX "photos_sort_order_idx" ON "photos"("sort_order");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
