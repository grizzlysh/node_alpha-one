import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createType, deleteType, editType, getType, getTypeById } from '../controllers/type.controller';

const TypeRoutes = express.Router();

// create permission
TypeRoutes.post('/', checkJwt, createType);

// get all permission
TypeRoutes.get('/', checkJwt, getType);

// get permission by id
TypeRoutes.get('/:type_uid', checkJwt, getTypeById);

// edit permission by id
TypeRoutes.put('/:type_uid', checkJwt, editType);

// delete permission by id
TypeRoutes.patch('/:type_uid', checkJwt, deleteType);

export default TypeRoutes;
