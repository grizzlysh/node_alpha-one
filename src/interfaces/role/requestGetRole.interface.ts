import { Request } from "express";

interface RequestGetRole extends Request{
  query: {
    page: string,
    size: string,
    cond: string
  }
}

export default RequestGetRole;