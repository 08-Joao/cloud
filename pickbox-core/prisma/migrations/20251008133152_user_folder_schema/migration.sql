/*
  Warnings:

  - You are about to drop the column `userId` on the `File` table. All the data in the column will be lost.
  - Added the required column `folderId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FolderRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_userId_fkey";

-- DropIndex
DROP INDEX "public"."File_userId_idx";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "userId",
ADD COLUMN     "folderId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserFolder" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" "FolderRole" NOT NULL,
    "folderId" TEXT NOT NULL,

    CONSTRAINT "UserFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFolder_userId_idx" ON "UserFolder"("userId");

-- CreateIndex
CREATE INDEX "UserFolder_folderId_idx" ON "UserFolder"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFolder_userId_folderId_key" ON "UserFolder"("userId", "folderId");

-- CreateIndex
CREATE INDEX "File_folderId_idx" ON "File"("folderId");

-- AddForeignKey
ALTER TABLE "UserFolder" ADD CONSTRAINT "UserFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFolder" ADD CONSTRAINT "UserFolder_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
