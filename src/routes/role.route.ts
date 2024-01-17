import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createRole, deleteRole, editRole, getRole, getRoleById } from '../controllers/role.controller';

const RoleRoutes = express.Router();

// create role
RoleRoutes.post('/', checkJwt, createRole);

// get all role
RoleRoutes.get('/', checkJwt, getRole);

// get role by id
RoleRoutes.get('/:role_uid', checkJwt, getRoleById);

// edit role by id
RoleRoutes.put('/:role_uid', checkJwt, editRole);

// delete role by id
RoleRoutes.patch('/:role_uid', checkJwt, deleteRole);

export default RoleRoutes;
