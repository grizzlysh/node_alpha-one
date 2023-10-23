import express from 'express';
import { createUser, getUser, getUserById, editUser, deleteUser } from '../controllers/user.controller';
import checkJwt from '../middleware/checkJwt';

const UserRoutes = express.Router();

// create user
UserRoutes.post('/', checkJwt, createUser);

// get all USer
UserRoutes.get('/', checkJwt, getUser);

// get user by id
UserRoutes.get('/:id', checkJwt, getUserById);

// edit user by id
UserRoutes.put('/s:id', checkJwt, editUser);

// delete user by id
UserRoutes.put('/s:id', checkJwt, deleteUser);

export default UserRoutes;
