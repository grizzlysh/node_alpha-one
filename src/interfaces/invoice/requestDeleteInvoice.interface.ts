import { Request } from "express";

interface RequestDeleteInvoice extends Request {
  params: {
    invoice_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeleteInvoice;