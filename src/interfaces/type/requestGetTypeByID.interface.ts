import { Request } from "express";

interface RequestGetTypeByID extends Request {
  params: {
    type_uid: string,
  },
}

export default RequestGetTypeByID;