import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createPermission, deletePermission, editPermission, getPermission, getPermissionById, getPermissionDdl } from '../controllers/permission.controller';

const PermissionRoutes = express.Router();

// create permission
PermissionRoutes.post('/', checkJwt, createPermission);

// get ddl
PermissionRoutes.get('/ddl', checkJwt, getPermissionDdl);

// get all permission
PermissionRoutes.get('/', checkJwt, getPermission);

// get permission by id
PermissionRoutes.get('/:permission_uid', checkJwt, getPermissionById);

// edit permission by id
PermissionRoutes.put('/:permission_uid', checkJwt, editPermission);

// delete permission by id
PermissionRoutes.patch('/:permission_uid', checkJwt, deletePermission);

export default PermissionRoutes;
