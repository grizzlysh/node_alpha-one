import { Request } from "express";
import { sortPage } from "../../utils/pagination.util";

interface RequestGetInvoice extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : sortPage,
    field: string,
  }
}

export default RequestGetInvoice;