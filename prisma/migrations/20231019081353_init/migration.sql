/*
  Warnings:

  - Added the required column `created_by` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "created_by" INTEGER NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(0),
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "updated_by" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "created_by" INTEGER NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(0),
ADD COLUMN     "deleted_by" INTEGER,
ADD COLUMN     "updated_by" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
