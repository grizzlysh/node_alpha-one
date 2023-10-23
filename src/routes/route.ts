import express from 'express';
import AuthRoutes from './auth.route';
import UserRoutes from './user.route';


const MainRoutes = express.Router();

MainRoutes.use('/auth',AuthRoutes);
MainRoutes.use('/user',UserRoutes);

export default MainRoutes;