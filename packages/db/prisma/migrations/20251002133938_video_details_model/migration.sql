-- CreateEnum
CREATE TYPE "public"."VideoStatus" AS ENUM ('active', 'archived', 'deleted');

-- CreateTable
CREATE TABLE "public"."video" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "addedDate" TEXT NOT NULL,
    "thumbnail" TEXT,
    "status" "public"."VideoStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "video_pkey" PRIMARY KEY ("id")
);
