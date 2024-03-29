import { Request } from "express";

interface RequestGetDistributor extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : string,
    field: string,
  }
}

export default RequestGetDistributor;