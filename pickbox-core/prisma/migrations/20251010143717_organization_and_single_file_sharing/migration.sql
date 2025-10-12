-- CreateEnum
CREATE TYPE "FileRole" AS ENUM ('EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "organizationDomain" TEXT,
ADD COLUMN     "organizationRole" "FileRole";

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "FileShare" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "FileRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FileShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FileShare_userId_idx" ON "FileShare"("userId");

-- CreateIndex
CREATE INDEX "FileShare_fileId_idx" ON "FileShare"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "FileShare_fileId_userId_key" ON "FileShare"("fileId", "userId");

-- CreateIndex
CREATE INDEX "File_organizationDomain_idx" ON "File"("organizationDomain");

-- CreateIndex
CREATE INDEX "Folder_parentId_idx" ON "Folder"("parentId");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileShare" ADD CONSTRAINT "FileShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
