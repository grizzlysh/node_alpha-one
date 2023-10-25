import express from 'express';
import { createUser, getUser, getUserById, editUser, deleteUser } from '../controllers/user.controller';
import checkJwt from '../middleware/checkJwt';

const UserRoutes = express.Router();

// create user
UserRoutes.post('/', checkJwt, createUser);

// get all USer
UserRoutes.get('/', checkJwt, getUser);

// get user by id
UserRoutes.get('/:username', checkJwt, getUserById);

// edit user by id
UserRoutes.put('/:username', checkJwt, editUser);

// delete user by id
UserRoutes.delete('/:username', checkJwt, deleteUser);

export default UserRoutes;
