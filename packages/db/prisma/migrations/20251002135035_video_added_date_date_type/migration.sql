/*
  Warnings:

  - The `addedDate` column on the `video` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."video" DROP COLUMN "addedDate",
ADD COLUMN     "addedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
