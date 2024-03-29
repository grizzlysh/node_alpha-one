import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createDrug, deleteDrug, editDrug, getDrug, getDrugById } from '../controllers/drug.controller';

const DrugRoutes = express.Router();

// create permission
DrugRoutes.post('/', checkJwt, createDrug);

// get all permission
DrugRoutes.get('/', checkJwt, getDrug);

// get permission by id
DrugRoutes.get('/:drug_uid', checkJwt, getDrugById);

// edit permission by id
DrugRoutes.put('/:drug_uid', checkJwt, editDrug);

// delete permission by id
DrugRoutes.patch('/:drug_uid', checkJwt, deleteDrug);

export default DrugRoutes;
