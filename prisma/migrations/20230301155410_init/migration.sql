/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `detail_formulas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `detail_invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `detail_order_invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `detail_sales` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `detail_stocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `distributors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `drugs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `formulas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `history_stocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `order_invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `return_invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `sales` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `shapes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `stocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `summary_transactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `transaction_invoices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `transaction_sales` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uid]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
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
