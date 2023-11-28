import { Request } from "express";

interface RequestGetUser extends Request{
  query: {
    page: string,
    size: string,
    cond: string,
    sort : string,
    field: string,
  }
}

export default RequestGetUser;