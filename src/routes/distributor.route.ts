import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createDistributor, deleteDistributor, editDistributor, getDistributor, getDistributorById, getDistributorDdl } from '../controllers/distributor.controller';

const DistributorRoutes = express.Router();

// create permission
DistributorRoutes.post('/', checkJwt, createDistributor);

// get ddl
DistributorRoutes.get('/ddl', checkJwt, getDistributorDdl);

// get all permission
DistributorRoutes.get('/', checkJwt, getDistributor);

// get permission by id
DistributorRoutes.get('/:distributor_uid', checkJwt, getDistributorById);

// edit permission by id
DistributorRoutes.put('/:distributor_uid', checkJwt, editDistributor);

// delete permission by id
DistributorRoutes.patch('/:distributor_uid', checkJwt, deleteDistributor);


export default DistributorRoutes;
