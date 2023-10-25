import { Request } from "express";

interface RequestGetUserByID extends Request {
  params: {
    username: string,
  },
}

export default RequestGetUserByID;