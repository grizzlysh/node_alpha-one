/*
  Warnings:

  - Made the column `display_name` on table `roles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "roles" ALTER COLUMN "display_name" SET NOT NULL;
