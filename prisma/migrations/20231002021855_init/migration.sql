/*
  Warnings:

  - Changed the type of `uid` on the `categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `detail_formulas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `detail_invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `detail_order_invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `detail_sales` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `detail_stocks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `distributors` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `drugs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `formulas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `history_stocks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `order_invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `return_invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `sales` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `shapes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `stocks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `summary_transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `transaction_invoices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `transaction_sales` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `types` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `uid` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "detail_formulas" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "detail_invoices" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "detail_order_invoices" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "detail_sales" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "detail_stocks" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "distributors" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "drugs" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "formulas" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "history_stocks" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "order_invoices" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "return_invoices" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "shapes" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "stocks" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "summary_transactions" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "transaction_invoices" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "transaction_sales" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "types" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "uid",
ADD COLUMN     "uid" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "categories_uid_key" ON "categories"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_formulas_uid_key" ON "detail_formulas"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_invoices_uid_key" ON "detail_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_order_invoices_uid_key" ON "detail_order_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_sales_uid_key" ON "detail_sales"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_stocks_uid_key" ON "detail_stocks"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "distributors_uid_key" ON "distributors"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "drugs_uid_key" ON "drugs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_uid_key" ON "formulas"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "history_stocks_uid_key" ON "history_stocks"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_uid_key" ON "invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "order_invoices_uid_key" ON "order_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_uid_key" ON "permissions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "return_invoices_uid_key" ON "return_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uid_key" ON "roles"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "sales_uid_key" ON "sales"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "shapes_uid_key" ON "shapes"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_uid_key" ON "stocks"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "summary_transactions_uid_key" ON "summary_transactions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_invoices_uid_key" ON "transaction_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_sales_uid_key" ON "transaction_sales"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "types_uid_key" ON "types"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");
