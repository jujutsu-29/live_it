/*
  Warnings:

  - The values [processing] on the enum `VideoStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `startedAt` on the `video_jobs` table. All the data in the column will be lost.
  - You are about to drop the column `stoppedAt` on the `video_jobs` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoStatus_new" AS ENUM ('active', 'deleted', 'streaming', 'stopped', 'failed');
ALTER TABLE "public"."videos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "videos" ALTER COLUMN "status" TYPE "VideoStatus_new" USING ("status"::text::"VideoStatus_new");
ALTER TYPE "VideoStatus" RENAME TO "VideoStatus_old";
ALTER TYPE "VideoStatus_new" RENAME TO "VideoStatus";
DROP TYPE "public"."VideoStatus_old";
ALTER TABLE "videos" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "video_jobs" DROP COLUMN "startedAt",
DROP COLUMN "stoppedAt";

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "live_startedAt" TIMESTAMP(3),
ADD COLUMN     "live_stoppedAt" TIMESTAMP(3),
ADD COLUMN     "live_streamKey" TEXT;
