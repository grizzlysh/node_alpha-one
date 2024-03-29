import { Request } from "express";

interface RequestCreateTransactionInvoice extends Request {
  params: {
    invoice_uid: string,
  },
  body  : {
    pay_date        : Date,
    total_pay       : number,
    current_user_uid: string,
  }
}

export default RequestCreateTransactionInvoice;