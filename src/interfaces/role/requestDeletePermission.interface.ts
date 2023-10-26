import { Request } from "express";

interface RequestDeletePermission extends Request {
  params: {
    permission_uid: string,
  },
  body  : {
    current_user_uid: string,
  }
}

export default RequestDeletePermission;