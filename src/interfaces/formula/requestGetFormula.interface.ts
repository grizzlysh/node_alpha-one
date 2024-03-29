import { Request } from "express";

interface RequestGetFormula extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : string,
    field: string,
  }
}

export default RequestGetFormula;