import express from 'express';
import { createUser, getUser, getUserById, editUser, deleteUser, resetPassword } from '../controllers/user.controller';
import checkJwt from '../middleware/checkJwt';

const UserRoutes = express.Router();

// create user
UserRoutes.post('/', checkJwt, createUser);

// get all USer
UserRoutes.get('/', checkJwt, getUser);

// get user by id
UserRoutes.get('/:user_uid', checkJwt, getUserById);

// edit user by id
UserRoutes.put('/:user_uid', checkJwt, editUser);

// reset user password by id
UserRoutes.put('/reset/:user_uid', checkJwt, resetPassword);

// delete user by id
UserRoutes.patch('/:user_uid', checkJwt, deleteUser);

export default UserRoutes;
