import { Request } from "express";

interface RequestCreatePermission extends Request {
  body: {
    display_name    : string,
    description     : string,
    current_user_uid: string,
  }
}

export default RequestCreatePermission;