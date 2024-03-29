import { Request } from "express";

interface RequestGetInvoice extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : string,
    field: string,
  }
}

export default RequestGetInvoice;