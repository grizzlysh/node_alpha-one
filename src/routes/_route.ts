import express from 'express';

import AuthRoutes from './auth.route';
import UserRoutes from './user.route';

const MainRoutes = express.Router();

// register users
MainRoutes.use("/user", UserRoutes);
MainRoutes.use("/auth", AuthRoutes);

export default MainRoutes;
