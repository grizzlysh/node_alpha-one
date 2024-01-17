import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createShape, deleteShape, editShape, getShape, getShapeById } from '../controllers/shape.controller';

const ShapeRoutes = express.Router();

// create permission
ShapeRoutes.post('/', checkJwt, createShape);

// get all permission
ShapeRoutes.get('/', checkJwt, getShape);

// get permission by id
ShapeRoutes.get('/:shape_uid', checkJwt, getShapeById);

// edit permission by id
ShapeRoutes.put('/:shape_uid', checkJwt, editShape);

// delete permission by id
ShapeRoutes.patch('/:shape_uid', checkJwt, deleteShape);

export default ShapeRoutes;
