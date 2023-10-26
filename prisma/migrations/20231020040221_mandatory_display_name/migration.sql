/*
  Warnings:

  - A unique constraint covering the columns `[display_name]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - Made the column `display_name` on table `permissions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "detail_stocks" ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "permissions" ALTER COLUMN "display_name" SET NOT NULL,
ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "description" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "permissions_display_name_key" ON "permissions"("display_name");
