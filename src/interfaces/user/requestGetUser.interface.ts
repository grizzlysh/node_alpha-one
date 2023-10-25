import { Request } from "express";

interface RequestGetUser extends Request{
  query: {
    asda: string,
    page: string,
    size: string,
    cond: string
  }
}

export default RequestGetUser;