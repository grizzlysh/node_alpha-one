import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createTherapyClass, deleteTherapyClass, editTherapyClass, getTherapyClass, getTherapyClassById, getTherapyClassDdl } from '../controllers/therapyClass.controller';

const TherapyClassRoutes = express.Router();

// create permission
TherapyClassRoutes.post('/', checkJwt, createTherapyClass);

// get ddl
TherapyClassRoutes.get('/ddl', checkJwt, getTherapyClassDdl);

// get all permission
TherapyClassRoutes.get('/', checkJwt, getTherapyClass);

// get permission by id
TherapyClassRoutes.get('/:therapy_class_uid', checkJwt, getTherapyClassById);

// edit permission by id
TherapyClassRoutes.put('/:therapy_class_uid', checkJwt, editTherapyClass);

// delete permission by id
TherapyClassRoutes.patch('/:therapy_class_uid', checkJwt, deleteTherapyClass);


export default TherapyClassRoutes;
