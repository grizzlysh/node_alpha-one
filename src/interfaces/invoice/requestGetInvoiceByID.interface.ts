import { Request } from "express";

interface RequestGetInvoiceByID extends Request {
  params: {
    invoice_uid: string,
  },
}

export default RequestGetInvoiceByID;