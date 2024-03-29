import { Request } from "express";

interface RequestGetTherapyClass extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : string,
    field: string,
  }
}

export default RequestGetTherapyClass;