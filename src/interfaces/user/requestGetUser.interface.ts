import { Request } from "express";

interface RequestGetUser extends Request{
  query: {
    page: string,
    size: string,
    cond: string
  }
}

export default RequestGetUser;