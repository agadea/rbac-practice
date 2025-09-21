/*
  Warnings:

  - Added the required column `createdBy` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Module" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ADD COLUMN     "updatedBy" TEXT;
