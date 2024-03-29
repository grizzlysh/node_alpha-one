import express from 'express';
import checkJwt from '../middleware/checkJwt';
import { createInvoice, deleteInvoice, editInvoice, getInvoice, getInvoiceById } from '../controllers/invoice.controller';
import { createTransactionInvoice, deleteTransactionInvoice, getTransactionInvoiceById } from '../controllers/invoiceTransaction.controller';

const InvoiceRoutes = express.Router();

// create invoice
InvoiceRoutes.post('/', checkJwt, createInvoice);

// get all invoice
InvoiceRoutes.get('/', checkJwt, getInvoice);

// get invoice by id
InvoiceRoutes.get('/:invoice_uid', checkJwt, getInvoiceById);

// edit invoice by id
InvoiceRoutes.put('/:invoice_uid', checkJwt, editInvoice);

// delete invoice by id
InvoiceRoutes.patch('/:invoice_uid', checkJwt, deleteInvoice);

// create invoice transaction
InvoiceRoutes.post('/transaction', checkJwt, createTransactionInvoice);

// get invoice transaction by id
InvoiceRoutes.get('/transaction/:invoice_uid', checkJwt, getTransactionInvoiceById);

// delete invoice transaction by id
InvoiceRoutes.patch('/transaction/:transaction_invoice_uid', checkJwt, deleteTransactionInvoice);

export default InvoiceRoutes;
