import { Request } from "express";

interface RequestGetCategory extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : string,
    field: string,
  }
}

export default RequestGetCategory;