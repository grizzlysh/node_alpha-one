-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(19) NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_role" (
    "permission_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "read_permit" BOOLEAN NOT NULL DEFAULT false,
    "write_permit" BOOLEAN NOT NULL DEFAULT false,
    "modify_permit" BOOLEAN NOT NULL DEFAULT false,
    "delete_permit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "permission_role_pkey" PRIMARY KEY ("permission_id","role_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "display_name" VARCHAR(191) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "display_name" VARCHAR(191) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "username" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "sex" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "email_verified_at" TIMESTAMP(0),
    "password" VARCHAR(191) NOT NULL,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),
    "role_id" INTEGER NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shapes" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "shapes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drugs" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "shape_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "drugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "no_formula" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_formulas" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "formula_id" INTEGER NOT NULL,
    "drug_id" INTEGER NOT NULL,
    "qty_pcs" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "detail_formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributors" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "no_permit" VARCHAR(50) NOT NULL,
    "contact_person" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "distributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "distributor_id" INTEGER NOT NULL,
    "no_invoice" VARCHAR(191) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "receive_date" DATE NOT NULL,
    "total_invoice" INTEGER NOT NULL,
    "count_item" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "status" VARCHAR(191) NOT NULL,
    "total_pay" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_invoices" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "drug_id" INTEGER NOT NULL,
    "no_batch" VARCHAR(191) NOT NULL,
    "expired_at" DATE,
    "count_box" INTEGER NOT NULL,
    "qty_box" INTEGER NOT NULL,
    "price_box" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "discount_nominal" INTEGER NOT NULL,
    "ppn" INTEGER NOT NULL,
    "ppn_nominal" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "detail_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_invoices" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "pay_date" DATE NOT NULL,
    "total_pay" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "transaction_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "return_invoices" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "distributor_id" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "detail_invoice_id" INTEGER NOT NULL,
    "return_date" DATE,
    "qty_return" INTEGER NOT NULL,
    "total_return" INTEGER NOT NULL,
    "status" VARCHAR(191) NOT NULL,
    "confirm_date" DATE,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "return_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_invoices" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "distributor_id" INTEGER NOT NULL,
    "no_order" VARCHAR(191) NOT NULL,
    "order_date" DATE NOT NULL,
    "count_item" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "order_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_order_invoices" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "order_invoice_id" INTEGER NOT NULL,
    "drug_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit" VARCHAR(191) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "detail_order_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "drug_id" INTEGER NOT NULL,
    "total_qty" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "price_buy" INTEGER,
    "price_manual" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_stocks" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "stock_id" INTEGER NOT NULL,
    "detail_invoice_id" INTEGER,
    "qty_pcs" INTEGER NOT NULL,
    "qty_box" INTEGER,
    "expired_at" DATE NOT NULL,
    "no_barcode" VARCHAR(191) NOT NULL,
    "no_batch" VARCHAR(191),
    "is_initiate" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "detail_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_stocks" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "stock_id" INTEGER NOT NULL,
    "status" VARCHAR(191),
    "qty_pcs" INTEGER NOT NULL,
    "detail_invoice_id" INTEGER,
    "detail_stock_id" INTEGER,
    "detail_sale_id" INTEGER,
    "return_invoice_id" INTEGER,
    "reason" VARCHAR(191),
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "history_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "sale_date" DATE NOT NULL,
    "count_item" INTEGER NOT NULL,
    "total_sale" INTEGER NOT NULL,
    "description" TEXT,
    "status" VARCHAR(191) NOT NULL,
    "total_pay" INTEGER NOT NULL,
    "customer_name" VARCHAR(191),
    "customer_address" VARCHAR(191),
    "customer_age" VARCHAR(191),
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_sales" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "detail_stock_id" INTEGER,
    "qty_pcs" INTEGER NOT NULL,
    "price_pcs" INTEGER NOT NULL,
    "price_manual" INTEGER,
    "total_price" INTEGER NOT NULL,
    "is_formula" BOOLEAN NOT NULL DEFAULT false,
    "formula_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "detail_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_sales" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "pay_date" DATE NOT NULL,
    "total_pay" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "created_by" INTEGER NOT NULL,
    "updated_by" INTEGER NOT NULL,
    "deleted_by" INTEGER,

    CONSTRAINT "transaction_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary_transactions" (
    "id" SERIAL NOT NULL,
    "uid" UUID NOT NULL,
    "transaction_date" DATE NOT NULL,
    "revenue" INTEGER NOT NULL,
    "expense" INTEGER NOT NULL,
    "income" INTEGER NOT NULL,
    "credit" INTEGER NOT NULL,
    "invoice" INTEGER NOT NULL,
    "saving" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "summary_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menus_name_key" ON "menus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_uid_key" ON "permissions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_display_name_key" ON "permissions"("display_name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_uid_key" ON "roles"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shapes_uid_key" ON "shapes"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "types_uid_key" ON "types"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "categories_uid_key" ON "categories"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "drugs_uid_key" ON "drugs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_uid_key" ON "formulas"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_formulas_uid_key" ON "detail_formulas"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "distributors_uid_key" ON "distributors"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_uid_key" ON "invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_invoices_uid_key" ON "detail_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_invoices_uid_key" ON "transaction_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "return_invoices_uid_key" ON "return_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "order_invoices_uid_key" ON "order_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_order_invoices_uid_key" ON "detail_order_invoices"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_uid_key" ON "stocks"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_stocks_uid_key" ON "detail_stocks"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "history_stocks_uid_key" ON "history_stocks"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "sales_uid_key" ON "sales"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "detail_sales_uid_key" ON "detail_sales"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_sales_uid_key" ON "transaction_sales"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "summary_transactions_uid_key" ON "summary_transactions"("uid");

-- AddForeignKey
ALTER TABLE "permission_role" ADD CONSTRAINT "permission_role_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_role" ADD CONSTRAINT "permission_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shapes" ADD CONSTRAINT "shapes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shapes" ADD CONSTRAINT "shapes_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shapes" ADD CONSTRAINT "shapes_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "types" ADD CONSTRAINT "types_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "types" ADD CONSTRAINT "types_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "types" ADD CONSTRAINT "types_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_shape_id_fkey" FOREIGN KEY ("shape_id") REFERENCES "shapes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_formulas" ADD CONSTRAINT "detail_formulas_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_formulas" ADD CONSTRAINT "detail_formulas_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_formulas" ADD CONSTRAINT "detail_formulas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_formulas" ADD CONSTRAINT "detail_formulas_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_formulas" ADD CONSTRAINT "detail_formulas_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributors" ADD CONSTRAINT "distributors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributors" ADD CONSTRAINT "distributors_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributors" ADD CONSTRAINT "distributors_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_invoices" ADD CONSTRAINT "detail_invoices_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_invoices" ADD CONSTRAINT "detail_invoices_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_invoices" ADD CONSTRAINT "detail_invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_invoices" ADD CONSTRAINT "detail_invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_invoices" ADD CONSTRAINT "detail_invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_invoices" ADD CONSTRAINT "transaction_invoices_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_invoices" ADD CONSTRAINT "transaction_invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_invoices" ADD CONSTRAINT "transaction_invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_invoices" ADD CONSTRAINT "transaction_invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_invoices" ADD CONSTRAINT "return_invoices_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_invoices" ADD CONSTRAINT "return_invoices_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_invoices" ADD CONSTRAINT "return_invoices_detail_invoice_id_fkey" FOREIGN KEY ("detail_invoice_id") REFERENCES "detail_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_invoices" ADD CONSTRAINT "return_invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_invoices" ADD CONSTRAINT "return_invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_invoices" ADD CONSTRAINT "return_invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_invoices" ADD CONSTRAINT "order_invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_invoices" ADD CONSTRAINT "order_invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_invoices" ADD CONSTRAINT "order_invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_order_invoices" ADD CONSTRAINT "detail_order_invoices_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_order_invoices" ADD CONSTRAINT "detail_order_invoices_order_invoice_id_fkey" FOREIGN KEY ("order_invoice_id") REFERENCES "order_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_order_invoices" ADD CONSTRAINT "detail_order_invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_order_invoices" ADD CONSTRAINT "detail_order_invoices_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_order_invoices" ADD CONSTRAINT "detail_order_invoices_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_stocks" ADD CONSTRAINT "detail_stocks_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_stocks" ADD CONSTRAINT "detail_stocks_detail_invoice_id_fkey" FOREIGN KEY ("detail_invoice_id") REFERENCES "detail_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_stocks" ADD CONSTRAINT "detail_stocks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_stocks" ADD CONSTRAINT "detail_stocks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_stocks" ADD CONSTRAINT "detail_stocks_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_stocks" ADD CONSTRAINT "history_stocks_detail_sale_id_fkey" FOREIGN KEY ("detail_sale_id") REFERENCES "detail_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_stocks" ADD CONSTRAINT "history_stocks_detail_stock_id_fkey" FOREIGN KEY ("detail_stock_id") REFERENCES "detail_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_stocks" ADD CONSTRAINT "history_stocks_detail_invoice_id_fkey" FOREIGN KEY ("detail_invoice_id") REFERENCES "detail_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_stocks" ADD CONSTRAINT "history_stocks_return_invoice_id_fkey" FOREIGN KEY ("return_invoice_id") REFERENCES "return_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_stocks" ADD CONSTRAINT "history_stocks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_stocks" ADD CONSTRAINT "history_stocks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_stocks" ADD CONSTRAINT "history_stocks_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_sales" ADD CONSTRAINT "detail_sales_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_sales" ADD CONSTRAINT "detail_sales_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_sales" ADD CONSTRAINT "detail_sales_detail_stock_id_fkey" FOREIGN KEY ("detail_stock_id") REFERENCES "detail_stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_sales" ADD CONSTRAINT "detail_sales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_sales" ADD CONSTRAINT "detail_sales_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_sales" ADD CONSTRAINT "detail_sales_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_sales" ADD CONSTRAINT "transaction_sales_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_sales" ADD CONSTRAINT "transaction_sales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_sales" ADD CONSTRAINT "transaction_sales_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_sales" ADD CONSTRAINT "transaction_sales_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
