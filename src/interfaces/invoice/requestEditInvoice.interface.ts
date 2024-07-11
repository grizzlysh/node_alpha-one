import { Request } from "express";

interface RequestEditInvoice extends Request {
  params: {
    invoice_uid: string,
  },
  body  : {
    no_invoice      : string,
    invoice_date    : string,
    receive_date    : string,
    total_invoice   : number,
    count_item      : number,
    due_date        : string,
    status          : string,
    total_pay       : number,
    distributor_uid : string,
    detail_invoices : string,
    current_user_uid: string,
  }
}

export default RequestEditInvoice;