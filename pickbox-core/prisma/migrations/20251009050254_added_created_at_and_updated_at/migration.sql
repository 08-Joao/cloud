/*
  Warnings:

  - You are about to drop the column `uploadedAt` on the `File` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserFolder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "uploadedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserFolder" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
