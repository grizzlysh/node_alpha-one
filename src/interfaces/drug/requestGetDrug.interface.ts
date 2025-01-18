import { Request } from "express";
import { sortPage } from "../../utils/pagination.util";

interface RequestGetDrug extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : sortPage,
    field: string,
  }
}

export default RequestGetDrug;