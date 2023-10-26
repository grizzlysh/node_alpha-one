import { Request } from "express";

interface RequestGetUserByID extends Request {
  params: {
    user_uid: string,
  },
}

export default RequestGetUserByID;