import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { editStock, getStock, getStockById } from '../controllers/stock.controller';

const StockRoutes = express.Router();


// get all invoice
StockRoutes.get('/', checkJwt, getStock);

// get invoice by id
StockRoutes.get('/:stock_uid', checkJwt, getStockById);

// edit invoice by id
StockRoutes.put('/:stock_uid', checkJwt, editStock);

export default StockRoutes;
