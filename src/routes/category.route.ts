import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createCategory, deleteCategory, editCategory, getCategory, getCategoryById, getCategoryDdl } from '../controllers/category.controller';

const CategoryRoutes = express.Router();

// create permission
CategoryRoutes.post('/', checkJwt, createCategory);

// get all permission
CategoryRoutes.get('/ddl', checkJwt, getCategoryDdl);

// get all permission
CategoryRoutes.get('/', checkJwt, getCategory);

// get permission by id
CategoryRoutes.get('/:category_uid', checkJwt, getCategoryById);

// edit permission by id
CategoryRoutes.put('/:category_uid', checkJwt, editCategory);

// delete permission by id
CategoryRoutes.patch('/:category_uid', checkJwt, deleteCategory);


export default CategoryRoutes;
