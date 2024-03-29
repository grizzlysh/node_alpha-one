import { Request } from "express";

interface RequestGetDrug extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : string,
    field: string,
  }
}

export default RequestGetDrug;