import { Request } from "express";

interface RequestGetTransactionInvoiceByID extends Request {
  params: {
    invoice_uid: string,
  },
}

export default RequestGetTransactionInvoiceByID;