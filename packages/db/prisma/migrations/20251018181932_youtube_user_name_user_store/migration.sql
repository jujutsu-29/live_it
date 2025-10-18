/*
  Warnings:

  - A unique constraint covering the columns `[youtubeUserName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "youtubeUserName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_youtubeUserName_key" ON "User"("youtubeUserName");
