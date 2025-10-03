/*
  Warnings:

  - You are about to drop the `VideoJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `video` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."VideoJob";

-- DropTable
DROP TABLE "public"."video";

-- CreateTable
CREATE TABLE "public"."video_jobs" (
    "id" SERIAL NOT NULL,
    "videoId" TEXT NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'pending',
    "s3Key" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "s3Key" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thumbnail" TEXT,
    "status" "public"."VideoStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_jobs_status_idx" ON "public"."video_jobs"("status");

-- CreateIndex
CREATE INDEX "video_jobs_videoId_idx" ON "public"."video_jobs"("videoId");

-- CreateIndex
CREATE INDEX "videos_userId_idx" ON "public"."videos"("userId");

-- AddForeignKey
ALTER TABLE "public"."video_jobs" ADD CONSTRAINT "video_jobs_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "public"."videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."videos" ADD CONSTRAINT "videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
