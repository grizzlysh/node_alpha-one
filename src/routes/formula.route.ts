import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createFormula, deleteFormula, editFormula, getFormula, getFormulaById } from '../controllers/formula.controller';

const FormulaRoutes = express.Router();

// create permission
FormulaRoutes.post('/', checkJwt, createFormula);

// get all permission
FormulaRoutes.get('/', checkJwt, getFormula);

// get permission by id
FormulaRoutes.get('/:formula_uid', checkJwt, getFormulaById);

// edit permission by id
FormulaRoutes.put('/:formula_uid', checkJwt, editFormula);

// delete permission by id
FormulaRoutes.patch('/:formula_uid', checkJwt, deleteFormula);

export default FormulaRoutes;
