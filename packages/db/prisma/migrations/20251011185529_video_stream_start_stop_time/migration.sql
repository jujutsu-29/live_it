/*
  Warnings:

  - The values [archived] on the enum `VideoStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "VideoStatus_new" AS ENUM ('active', 'deleted', 'streaming', 'stopped', 'processing');
ALTER TABLE "public"."videos" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "videos" ALTER COLUMN "status" TYPE "VideoStatus_new" USING ("status"::text::"VideoStatus_new");
ALTER TYPE "VideoStatus" RENAME TO "VideoStatus_old";
ALTER TYPE "VideoStatus_new" RENAME TO "VideoStatus";
DROP TYPE "public"."VideoStatus_old";
ALTER TABLE "videos" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "video_jobs" ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "stoppedAt" TIMESTAMP(3);
