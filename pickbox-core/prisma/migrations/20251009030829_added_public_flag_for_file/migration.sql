/*
  Warnings:

  - Added the required column `ownerId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "File_ownerId_idx" ON "File"("ownerId");

-- CreateIndex
CREATE INDEX "File_isPublic_idx" ON "File"("isPublic");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
