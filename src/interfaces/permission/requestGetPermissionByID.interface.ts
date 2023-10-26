import { Request } from "express";

interface RequestGetPermissionByID extends Request {
  params: {
    permission_uid: string,
  },
}

export default RequestGetPermissionByID;