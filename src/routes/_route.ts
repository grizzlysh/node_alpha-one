import express from 'express';

import AuthRoutes from './auth.route';
import UserRoutes from './user.route';
import RoleRoutes from './role.route';
import PermissionRoutes from './permission.route';
import ShapeRoutes from './shape.route';
import TypeRoutes from './type.route';
import CategoryRoutes from './category.route';

const MainRoutes = express.Router();

// register users
MainRoutes.use("/user", UserRoutes);
MainRoutes.use("/auth", AuthRoutes);
MainRoutes.use("/permission", PermissionRoutes);
MainRoutes.use("/role", RoleRoutes);
MainRoutes.use("/shape", ShapeRoutes);
MainRoutes.use("/type", TypeRoutes);
MainRoutes.use("/category", CategoryRoutes);

export default MainRoutes;
