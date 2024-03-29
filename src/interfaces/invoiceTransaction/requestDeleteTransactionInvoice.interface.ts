import { Request } from "express";

interface RequestDeleteTransactionInvoice extends Request {
  params: {
    transaction_invoice_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteTransactionInvoice;