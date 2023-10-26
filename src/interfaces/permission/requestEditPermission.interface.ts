import { Request } from "express";

interface RequestEditPermission extends Request {
  params: {
    permission_uid: string,
  },
  body  : {
    display_name    : string,
    description     : string,
    current_user_uid: string,
  }
}

export default RequestEditPermission;