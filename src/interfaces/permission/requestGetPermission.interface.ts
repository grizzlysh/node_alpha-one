import { Request } from "express";

interface RequestGetPermission extends Request{
  query: {
    page : string,
    size : string,
    cond : string,
    sort : string,
    field: string,
  }
}

export default RequestGetPermission;