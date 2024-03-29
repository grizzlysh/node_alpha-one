import { Request } from "express";

interface RequestEditInvoice extends Request {
  params: {
    invoice_uid: string,
  },
  body  : {
    no_invoice      : string,
    invoice_date    : Date,
    receive_date    : Date,
    total_invoice   : number,
    count_item      : number,
    due_date        : Date,
    status          : string,
    total_pay       : number,
    distributor_uid : string,
    detail_invoices : string,
    current_user_uid: string,
  }
}

export default RequestEditInvoice;