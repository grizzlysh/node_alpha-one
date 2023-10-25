/*
  Warnings:

  - You are about to drop the `role_user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "role_user" DROP CONSTRAINT "role_user_role_id_fkey";

-- DropForeignKey
ALTER TABLE "role_user" DROP CONSTRAINT "role_user_user_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "role_user";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
