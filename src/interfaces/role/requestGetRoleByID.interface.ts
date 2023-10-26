import { Request } from "express";

interface RequestGetRoleByID extends Request {
  params: {
    role_uid: string,
  },
}

export default RequestGetRoleByID;