import { Request } from "express";

interface RequestEditRole extends Request {
  params: {
    role_uid: string,
  },
  body  : {
    display_name    : string,
    description     : string,
    permissions      : string,
    current_user_uid: string,
  }
}

export default RequestEditRole