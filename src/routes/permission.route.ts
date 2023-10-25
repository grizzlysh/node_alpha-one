import express from 'express';
import { createUser, getUser, getUserById, editUser, deleteUser } from '../controllers/user.controller';
import checkJwt from '../middleware/checkJwt';
import { createPermission, getPermission } from '../controllers/permissions.controller';

const PermissionRoutes = express.Router();

// create permission
PermissionRoutes.post('/', checkJwt, createPermission);

// get all permission
PermissionRoutes.get('/', checkJwt, getPermission);

// get permission by id
PermissionRoutes.get('/:username', checkJwt, getUserById);

// edit permission by id
PermissionRoutes.put('/:username', checkJwt, editUser);

// delete permission by id
PermissionRoutes.delete('/:username', checkJwt, deleteUser);

export default PermissionRoutes;
