import express from 'express';

import AuthRoutes from './auth.route';
import UserRoutes from './user.route';
import RoleRoutes from './role.route';
import PermissionRoutes from './permission.route';
import ShapeRoutes from './shape.route';
import CategoryRoutes from './category.route';
import TherapyClassRoutes from './therapyClass.route';
import DrugRoutes from './drug.route';
import FormulaRoutes from './formula.route';
import DistributorRoutes from './distributor.route';
import InvoiceRoutes from './invoice.route';
import StockRoutes from './stock.route.';

const MainRoutes = express.Router();

// register users
MainRoutes.use("/user", UserRoutes);
MainRoutes.use("/auth", AuthRoutes);
MainRoutes.use("/permission", PermissionRoutes);
MainRoutes.use("/role", RoleRoutes);
MainRoutes.use("/shape", ShapeRoutes);
MainRoutes.use("/category", CategoryRoutes);
MainRoutes.use("/therapy-class", TherapyClassRoutes);
MainRoutes.use("/drug", DrugRoutes);
MainRoutes.use("/formula", FormulaRoutes);
MainRoutes.use("/distributor", DistributorRoutes);
MainRoutes.use("/invoice", InvoiceRoutes);
MainRoutes.use("/stock", StockRoutes);

export default MainRoutes;
