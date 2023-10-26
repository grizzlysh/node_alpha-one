import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createPermission, deletePermission, editPermission, getPermission, getPermissionById } from '../controllers/permissions.controller';

const PermissionRoutes = express.Router();

// create permission
PermissionRoutes.post('/', checkJwt, createPermission);

// get all permission
PermissionRoutes.get('/', checkJwt, getPermission);

// get permission by id
PermissionRoutes.get('/:permission_uid', checkJwt, getPermissionById);

// edit permission by id
PermissionRoutes.put('/:permission_uid', checkJwt, editPermission);

// delete permission by id
PermissionRoutes.delete('/:permission_uid', checkJwt, deletePermission);

export default PermissionRoutes;
