import express from 'express';

import AuthRoutes from './auth.route';
import UserRoutes from './user.route';
import RoleRoutes from './role.route';
import PermissionRoutes from './permission.route';

const MainRoutes = express.Router();

// register users
MainRoutes.use("/user", UserRoutes);
MainRoutes.use("/auth", AuthRoutes);
MainRoutes.use("/permission", PermissionRoutes);
MainRoutes.use("/role", RoleRoutes);

export default MainRoutes;
